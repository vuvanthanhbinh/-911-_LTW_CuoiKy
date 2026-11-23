import { q, run } from '../config/db.js';
import { runList } from '../utils/list.js';
import { EMAIL, guard, httpErr, need, pick, removeById, statusOf } from '../utils/http.js';

const cfg = {
  from: 'customers c', alias: 'c', search: ['c.name', 'c.email', 'c.code'],
  sel: "c.id,c.code,c.name,c.email,c.phone,c.address,c.status,(SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id) AS orders_count,(SELECT ISNULL(SUM(o.total),0) FROM orders o WHERE o.customer_id=c.id AND o.status<>N'cancelled') AS total_spent",
  sorts: { id: 'c.id', name: 'c.name', orders: 'orders_count', spent: 'total_spent' },
};
export const list = async (req, res) => res.json(await runList(req, cfg));
export const detail = async (req, res) => {
  const [c] = await q('SELECT * FROM customers WHERE id=:id', { id: Number(req.params.id) });
  if (!c) throw httpErr(404, 'Không tìm thấy khách hàng');
  res.json({ ...c, orders: await q('SELECT id,code,created_at,total,status FROM orders WHERE customer_id=:id ORDER BY created_at DESC', { id: c.id }) });
};
const body = (b) => { need(b.name && String(b.name).trim(), 'Thiếu tên'); need(EMAIL.test(b.email || ''), 'Email không hợp lệ'); return { ...pick(b, ['name', 'email', 'phone', 'address']), st: statusOf(b) }; };
export const create = async (req, res) => {
  const code = 'CUS-' + String(Date.now()).slice(-7);
  await guard(() => run('INSERT INTO customers(code,name,email,phone,address,status) VALUES(:code,:name,:email,:phone,:address,:st)', { ...body(req.body), code }), 'Email khách hàng đã tồn tại');
  res.status(201).json({ ok: true });
};
export const update = async (req, res) => {
  await guard(() => run('UPDATE customers SET name=:name,email=:email,phone=:phone,address=:address,status=:st,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { ...body(req.body), id: Number(req.params.id) }), 'Email khách hàng đã tồn tại');
  res.json({ ok: true });
};
export const remove = removeById('customers'); // còn đơn hàng => 409
