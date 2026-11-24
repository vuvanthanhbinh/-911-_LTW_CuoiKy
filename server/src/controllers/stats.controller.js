import { q } from '../config/db.js';

// Dashboard + Analytics
export const stats = async (req, res) => {
  const months = Math.min(12, Math.max(1, Number(req.query.months) || 12));
  const from = new Date(); from.setUTCDate(1); from.setUTCMonth(from.getUTCMonth() - (months - 1)); from.setUTCHours(0, 0, 0, 0);
  const raw = await q("SELECT YEAR(created_at) yr,MONTH(created_at) mth,COUNT(*) n,SUM(total) rev FROM orders WHERE status<>N'cancelled' AND created_at>=:f GROUP BY YEAR(created_at),MONTH(created_at)", { f: from.toISOString() });
  const series = Array.from({ length: months }, (_, i) => { // điền 0 cho tháng không có đơn
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + i, 1));
    const r = raw.find((x) => x.yr === d.getUTCFullYear() && x.mth === d.getUTCMonth() + 1);
    return { label: `T${d.getUTCMonth() + 1}/${String(d.getUTCFullYear()).slice(2)}`, revenue: Number(r?.rev || 0), orders: r?.n || 0 };
  });
  const [kpi] = await q("SELECT (SELECT ISNULL(SUM(total),0) FROM orders WHERE status<>N'cancelled') revenue,(SELECT COUNT(*) FROM orders) orders,(SELECT COUNT(*) FROM customers) customers,(SELECT COUNT(*) FROM products) products");
  res.json({ kpi, series,
    topProducts: await q('SELECT TOP 5 name,sold FROM v_top_products ORDER BY sold DESC'),
    recentOrders: await q('SELECT TOP 5 code,customer_name,created_at,total,status FROM v_order_summary ORDER BY created_at DESC'),
    byStatus: await q('SELECT status AS name,COUNT(*) AS value FROM orders GROUP BY status'),
    byCategory: await q("SELECT c.name,SUM(i.line_total) AS value FROM order_items i JOIN products p ON p.id=i.product_id JOIN categories c ON c.id=p.category_id JOIN orders o ON o.id=i.order_id AND o.status<>N'cancelled' GROUP BY c.name") });
};
// Chuông thông báo: nhẹ hơn /stats nhiều
export const alerts = async (req, res) => res.json({
  lowStock: await q("SELECT TOP 5 id,name,stock FROM products WHERE stock<10 AND status=N'active' ORDER BY stock"),
  pending: (await q("SELECT COUNT(*) n FROM orders WHERE status=N'pending'"))[0].n,
});
