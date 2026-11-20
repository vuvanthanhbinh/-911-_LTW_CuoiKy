import { q, run } from '../config/db.js';
import { runList } from '../utils/list.js';
import { guard, httpErr, need, removeById, statusOf } from '../utils/http.js';

const cfg = {
  from: 'products p JOIN categories c ON c.id=p.category_id', alias: 'p', search: ['p.name', 'p.sku'],
  sel: 'p.id,p.sku,p.name,p.category_id,c.name AS category,p.price,p.stock,p.status,p.image_url',
  sorts: { id: 'p.id', name: 'p.name', price: 'p.price', stock: 'p.stock' },
};
export const list = async (req, res) => res.json(await runList(req, cfg));
export const detail = async (req, res) => {
  const [p] = await q('SELECT p.*,c.name AS category FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=:id', { id: Number(req.params.id) });
  if (!p) throw httpErr(404, 'Không tìm thấy sản phẩm');
  res.json(p);
};
const body = (b) => {
  need(b.sku && String(b.sku).trim() && b.name && String(b.name).trim(), 'Thiếu SKU hoặc tên');
  need(Number(b.category_id) > 0, 'Chọn danh mục');
  need(Number(b.price) >= 0, 'Giá không hợp lệ');
  need(Number.isInteger(Number(b.stock)) && Number(b.stock) >= 0, 'Tồn kho không hợp lệ');
  const img = String(b.image_url ?? '').trim(); // link ảnh có thể để trống
  need(!img || /^(https?:\/\/|\/)/i.test(img), 'Link ảnh phải bắt đầu bằng http:// hoặc https://');
  need(img.length <= 2000, 'Link ảnh quá dài (tối đa 2000 ký tự)');
  return { sku: String(b.sku).trim(), name: String(b.name).trim(), category_id: Number(b.category_id), price: Number(b.price), stock: Number(b.stock), description: b.description ?? null, image_url: img || null, st: statusOf(b) };
};
export const create = async (req, res) => {
  await guard(() => run('INSERT INTO products(sku,name,category_id,price,stock,status,description,image_url) VALUES(:sku,:name,:category_id,:price,:stock,:st,:description,:image_url)', body(req.body)), 'SKU đã tồn tại');
  res.status(201).json({ ok: true });
};
export const update = async (req, res) => {
  await guard(() => run('UPDATE products SET sku=:sku,name=:name,category_id=:category_id,price=:price,stock=:stock,status=:st,description=ISNULL(:description,description),image_url=:image_url,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { ...body(req.body), id: Number(req.params.id) }), 'SKU đã tồn tại');
  res.json({ ok: true });
};
export const remove = removeById('products');
