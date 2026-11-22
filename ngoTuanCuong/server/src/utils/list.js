import { q } from '../config/db.js';
import { OS } from './http.js';

const STATUSES = ['active', 'inactive', ...OS];
// Tìm kiếm không phân biệt hoa/thường và dấu tiếng Việt, sắp xếp theo whitelist, phân trang OFFSET/FETCH
export async function runList(req, d) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));
  const where = []; const p = { off: (page - 1) * limit, lim: limit };
  const term = String(req.query.q || '').trim();
  if (term) { where.push('(' + d.search.map((c) => `${c} COLLATE Latin1_General_100_CI_AI LIKE :q`).join(' OR ') + ')'); p.q = `%${term}%`; }
  if (STATUSES.includes(req.query.status)) { where.push(`${d.alias}.status=:st`); p.st = req.query.status; }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const sort = d.sorts[req.query.sort] || d.sorts.id; const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';
  const tie = sort === d.sorts.id ? '' : `, ${d.sorts.id} DESC`; // thứ tự ổn định khi cuộn tải thêm
  const rows = await q(`SELECT ${d.sel} FROM ${d.from} ${w} ORDER BY ${sort} ${dir}${tie} OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY`, p);
  const [{ n }] = await q(`SELECT COUNT(*) AS n FROM ${d.from} ${w}`, p);
  return { rows, total: n, page, limit };
}
