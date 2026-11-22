import { run } from '../config/db.js';

export const OS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
export const NEXT = { pending: 'paid', paid: 'shipped', shipped: 'delivered' };
export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const httpErr = (status, message, extra) => Object.assign(new Error(message), { status, extra });
export const need = (cond, msg) => { if (!cond) throw httpErr(400, msg); };
export const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k] ?? null])); // whitelist, chống mass assignment
export const statusOf = (b) => (['active', 'inactive'].includes(b.status) ? b.status : 'active');
const sqlNo = (e) => e.original?.number ?? e.parent?.number;
// Dịch lỗi SQL Server: 2627/2601 = trùng UNIQUE, 547 = vi phạm khóa ngoại/CHECK
export const guard = (fn, dupMsg) => fn().catch((err) => {
  const n = sqlNo(err);
  if (n === 2627 || n === 2601) throw httpErr(409, dupMsg);
  if (n === 547) throw httpErr(400, 'Dữ liệu tham chiếu hoặc ràng buộc không hợp lệ');
  throw err;
});
// Xóa theo id; còn dữ liệu liên quan (khóa ngoại) thì trả 409
export const removeById = (table) => async (req, res) => {
  try { await run(`DELETE FROM ${table} WHERE id=:id`, { id: Number(req.params.id) }); } catch (err) {
    if (sqlNo(err) === 547) throw httpErr(409, 'Không thể xóa: còn dữ liệu liên quan');
    throw err;
  }
  res.json({ ok: true });
};
