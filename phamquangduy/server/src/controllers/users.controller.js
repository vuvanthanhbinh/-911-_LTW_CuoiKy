import { q, run } from '../config/db.js';
import { need } from '../utils/http.js';

export const list = async (req, res) => res.json(await q('SELECT id,name,email,role,status FROM users ORDER BY id'));
export const setStatus = async (req, res) => {
  need(['active', 'inactive'].includes(req.body.status), 'Trạng thái không hợp lệ');
  await run('UPDATE users SET status=:s,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { s: req.body.status, id: Number(req.params.id) });
  res.json({ ok: true });
};
