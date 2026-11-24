import { run } from '../config/db.js';
import { runList } from '../utils/list.js';
import { guard, need, pick, removeById, statusOf } from '../utils/http.js';

const cfg = {
  from: 'categories c', alias: 'c', search: ['c.name', 'c.description'],
  sel: 'c.id,c.name,c.description,c.icon,c.status,(SELECT COUNT(*) FROM products x WHERE x.category_id=c.id) AS products_count',
  sorts: { id: 'c.id', name: 'c.name', count: 'products_count' },
};
export const list = async (req, res) => res.json(await runList(req, cfg));
const body = (b) => { need(b.name && String(b.name).trim(), 'Thiếu tên danh mục'); return { ...pick(b, ['name', 'description', 'icon']), st: statusOf(b) }; };
export const create = async (req, res) => {
  await guard(() => run('INSERT INTO categories(name,description,icon,status) VALUES(:name,:description,:icon,:st)', body(req.body)), 'Tên danh mục đã tồn tại');
  res.status(201).json({ ok: true });
};
export const update = async (req, res) => {
  await guard(() => run('UPDATE categories SET name=:name,description=:description,icon=:icon,status=:st,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { ...body(req.body), id: Number(req.params.id) }), 'Tên danh mục đã tồn tại');
  res.json({ ok: true });
};
export const remove = removeById('categories'); // còn sản phẩm => 409
