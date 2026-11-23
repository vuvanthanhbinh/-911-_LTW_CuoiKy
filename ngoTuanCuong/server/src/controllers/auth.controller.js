import bcrypt from 'bcrypt';
import { q, run } from '../config/db.js';
import { EMAIL, guard, httpErr, need } from '../utils/http.js';

const strong = (p) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

export const login = async (req, res) => {
  const { email = '', password = '' } = req.body;
  const [u] = await q('SELECT id,name,email,password_hash,role,status FROM users WHERE email=:email', { email });
  if (!u || !(await bcrypt.compare(password, u.password_hash))) throw httpErr(401, 'Sai email hoặc mật khẩu');
  if (u.status !== 'active') throw httpErr(403, 'Tài khoản chưa được kích hoạt');
  req.session.regenerate((err) => { // session id mới chống session fixation
    if (err) return res.status(500).json({ message: 'Lỗi session' });
    req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role };
    return res.json(req.session.user);
  });
};
export const logout = (req, res) => req.session.destroy(() => res.clearCookie('sid').json({ ok: true }));
export const me = (req, res) => res.json(req.session.user);

export const register = async (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  need(String(name).trim().length >= 2, 'Tên quá ngắn');
  need(EMAIL.test(email), 'Email không hợp lệ');
  need(strong(password), 'Mật khẩu tối thiểu 8 ký tự, gồm chữ và số');
  const hash = await bcrypt.hash(password, 10);
  await guard(() => run("INSERT INTO users(name,email,password_hash,role,status) VALUES(:name,:email,:hash,N'staff',N'inactive')", { name: name.trim(), email: email.trim(), hash }), 'Email đã được đăng ký');
  res.status(201).json({ message: 'Đăng ký thành công. Chờ Admin kích hoạt tài khoản.' });
};
export const updateProfile = async (req, res) => {
  const name = String(req.body.name || '').trim();
  need(name.length >= 2, 'Tên quá ngắn');
  await run('UPDATE users SET name=:n,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { n: name, id: req.session.user.id });
  req.session.user = { ...req.session.user, name }; res.json(req.session.user);
};
export const changePassword = async (req, res) => {
  const { current = '', next = '' } = req.body;
  need(strong(next), 'Mật khẩu mới tối thiểu 8 ký tự, gồm chữ và số');
  const [u] = await q('SELECT password_hash FROM users WHERE id=:id', { id: req.session.user.id });
  if (!(await bcrypt.compare(current, u.password_hash))) throw httpErr(400, 'Mật khẩu hiện tại sai');
  await run('UPDATE users SET password_hash=:h,updated_at=SYSDATETIMEOFFSET() WHERE id=:id', { h: await bcrypt.hash(next, 10), id: req.session.user.id });
  res.json({ ok: true });
};
