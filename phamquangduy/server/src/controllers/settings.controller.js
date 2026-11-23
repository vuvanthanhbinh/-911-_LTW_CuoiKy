import { q, run } from '../config/db.js';
import { need } from '../utils/http.js';

export const get = async (req, res) => res.json(Object.fromEntries((await q('SELECT [key] AS k,value AS v FROM settings')).map((r) => [r.k, r.v])));
export const update = async (req, res) => {
  const b = req.body;
  need(['vi', 'en'].includes(b.language) && ['VND', 'USD', 'EUR'].includes(b.currency) && String(b.site_name || '').trim(), 'Cài đặt không hợp lệ');
  for (const [k, v] of Object.entries({ site_name: b.site_name.trim(), language: b.language, currency: b.currency }))
    await run('UPDATE settings SET value=:v,updated_at=SYSDATETIMEOFFSET() WHERE [key]=:k; IF @@ROWCOUNT=0 INSERT INTO settings([key],value) VALUES(:k,:v);', { k, v });
  res.json({ ok: true });
};
