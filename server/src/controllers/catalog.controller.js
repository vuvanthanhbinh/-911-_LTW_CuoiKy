import { q } from '../config/db.js';

// Công khai: chỉ sản phẩm Active, không lộ dữ liệu nội bộ
export const catalog = async (req, res) => {
  const p = { lim: Math.min(48, Number(req.query.limit) || 24) }; let w = "WHERE p.status=N'active' AND c.status=N'active'";
  if (req.query.q) { w += ' AND p.name COLLATE Latin1_General_100_CI_AI LIKE :q'; p.q = `%${req.query.q}%`; }
  res.json(await q(`SELECT TOP (:lim) p.id,p.name,p.price,p.image_url,c.name AS category,CASE WHEN p.stock>0 THEN 1 ELSE 0 END AS in_stock FROM products p JOIN categories c ON c.id=p.category_id ${w} ORDER BY p.name`, p));
};
// Gợi ý tìm kiếm nhanh khi gõ từng chữ (bỏ dấu, không phân biệt hoa thường)
export const suggest = async (req, res) => {
  const term = String(req.query.q || '').trim().replace(/[%_[\]]/g, '').slice(0, 50);
  if (!term) return res.json([]);
  res.json(await q(`SELECT TOP 6 id,sku,name FROM products WHERE name COLLATE Latin1_General_100_CI_AI LIKE :any OR sku COLLATE Latin1_General_100_CI_AI LIKE :any
    ORDER BY CASE WHEN name COLLATE Latin1_General_100_CI_AI LIKE :pre THEN 0 ELSE 1 END, name`, { any: `%${term}%`, pre: `${term}%` }));
};
// Dữ liệu cho các ô chọn trong form và trang tạo đơn
export const lookup = async (req, res) => res.json({
  categories: await q("SELECT id,name FROM categories WHERE status=N'active' ORDER BY name"),
  customers: await q("SELECT id,name FROM customers WHERE status=N'active' ORDER BY name"),
  products: await q("SELECT id,name,price,stock FROM products WHERE status=N'active' AND stock>0 ORDER BY name"),
});
