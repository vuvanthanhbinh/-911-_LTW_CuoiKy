import { db, q, run } from '../config/db.js';
import { runList } from '../utils/list.js';
import { httpErr, need, NEXT, OS } from '../utils/http.js';

const cfg = {
  from: 'orders o JOIN customers c ON c.id=o.customer_id', alias: 'o', search: ['o.code', 'c.name'],
  sel: 'o.id,o.code,c.name AS customer,o.created_at,o.total,o.payment_method,o.status,(SELECT COUNT(*) FROM order_items i WHERE i.order_id=o.id) AS items',
  sorts: { id: 'o.id', date: 'o.created_at', total: 'o.total' },
};
export const list = async (req, res) => res.json(await runList(req, cfg));

export const exportCsv = async (req, res) => {
  const ok = OS.includes(req.query.status); const p = ok ? { st: req.query.status } : {};
  const rows = await q(`SELECT o.code,c.name AS customer,o.created_at,o.total,o.payment_method,o.status FROM orders o JOIN customers c ON c.id=o.customer_id ${ok ? 'WHERE o.status=:st' : ''} ORDER BY o.id DESC`, p);
  const esc = (v) => `"${String(v instanceof Date ? v.toISOString() : v ?? '').replace(/"/g, '""')}"`;
  const csv = '\ufeff' + ['code,customer,created_at,total,payment_method,status', ...rows.map((r) => Object.values(r).map(esc).join(','))].join('\r\n');
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="orders.csv"' }).send(csv);
};

export const detail = async (req, res) => {
  const [o] = await q('SELECT o.*,c.name AS customer FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=:id', { id: Number(req.params.id) });
  if (!o) throw httpErr(404, 'Không tìm thấy đơn hàng');
  res.json({ ...o,
    items: await q('SELECT i.*,p.name FROM order_items i JOIN products p ON p.id=i.product_id WHERE i.order_id=:id', { id: o.id }),
    history: await q('SELECT status,changed_at FROM order_status_history WHERE order_id=:id ORDER BY id', { id: o.id }) });
};

// Tạo đơn trong transaction: trừ kho nguyên tử, thiếu hàng => 409, tổng tính ở server theo giá trong DB
export const create = async (req, res) => {
  const { customer_id, payment_method, note, items } = req.body;
  need(Number(customer_id) > 0, 'Chọn khách hàng');
  need(['card', 'cash', 'transfer'].includes(payment_method), 'Phương thức thanh toán không hợp lệ');
  need(Array.isArray(items) && items.length > 0 && items.length <= 50, 'Đơn cần ít nhất 1 sản phẩm');
  const merged = new Map();
  for (const i of items) {
    const id = Number(i.product_id), n = Number(i.quantity);
    need(Number.isInteger(id) && id > 0 && Number.isInteger(n) && n > 0 && n <= 999, 'Sản phẩm hoặc số lượng không hợp lệ');
    merged.set(id, (merged.get(id) || 0) + n);
  }
  const out = await db.transaction(async (t) => {
    const [cus] = await q("SELECT id FROM customers WHERE id=:id AND status=N'active'", { id: Number(customer_id) }, t);
    if (!cus) throw httpErr(400, 'Khách hàng không hợp lệ');
    const lines = [], short = [];
    for (const [id, n] of [...merged].sort((x, y) => x[0] - y[0])) { // sắp theo id để tránh deadlock
      const [hit] = await q("UPDATE products SET stock=stock-:n,updated_at=SYSDATETIMEOFFSET() OUTPUT inserted.price WHERE id=:id AND status=N'active' AND stock>=:n", { id, n }, t);
      if (hit) lines.push({ id, n, price: Number(hit.price) });
      else short.push((await q('SELECT name FROM products WHERE id=:id', { id }, t))[0]?.name || `#${id}`);
    }
    if (short.length) throw httpErr(409, 'Không đủ hàng: ' + short.join(', '), { shortages: short });
    const total = Math.round(lines.reduce((s, l) => s + l.price * l.n, 0) * 100) / 100;
    const code = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.floor(10 + Math.random() * 90);
    const [o] = await q('INSERT INTO orders(code,customer_id,created_by,payment_method,total,note) OUTPUT inserted.id,inserted.code VALUES(:code,:cid,:u,:pm,:total,:note)',
      { code, cid: Number(customer_id), u: req.session.user.id, pm: payment_method, total, note: String(note || '').slice(0, 300) || null }, t);
    for (const l of lines) await run('INSERT INTO order_items(order_id,product_id,quantity,unit_price,line_total) VALUES(:o,:p,:n,:price,:lt)', { o: o.id, p: l.id, n: l.n, price: l.price, lt: Math.round(l.price * l.n * 100) / 100 }, t);
    await run("INSERT INTO order_status_history(order_id,status,changed_by) VALUES(:o,N'pending',:u)", { o: o.id, u: req.session.user.id }, t);
    return { id: o.id, code: o.code, total };
  });
  res.status(201).json(out);
};

// Đổi trạng thái đúng quy trình; hủy (chỉ khi chưa shipped) thì hoàn kho
export const updateStatus = async (req, res) => {
  const id = Number(req.params.id), to = req.body.status;
  await db.transaction(async (t) => {
    const [o] = await q('SELECT status FROM orders WITH (UPDLOCK) WHERE id=:id', { id }, t);
    if (!o) throw httpErr(404, 'Không tìm thấy đơn hàng');
    const ok = NEXT[o.status] === to || (to === 'cancelled' && ['pending', 'paid'].includes(o.status));
    if (!ok) throw httpErr(400, `Không thể chuyển trạng thái ${o.status} → ${to}`);
    if (to === 'cancelled') await run('UPDATE p SET p.stock=p.stock+i.quantity FROM products p JOIN order_items i ON i.product_id=p.id WHERE i.order_id=:id', { id }, t);
    await run('UPDATE orders SET status=:to,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { to, id }, t);
    await run('INSERT INTO order_status_history(order_id,status,changed_by) VALUES(:id,:to,:u)', { id, to, u: req.session.user.id }, t);
  });
  res.json({ ok: true });
};
