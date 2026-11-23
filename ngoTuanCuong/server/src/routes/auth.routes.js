import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '../middleware/auth.js';
import * as c from '../controllers/auth.controller.js';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }); // 30 lần / 15 phút / IP
const r = Router();
r.post('/login', limiter, c.login);
r.post('/register', limiter, c.register);
r.post('/logout', c.logout);
r.get('/me', auth, c.me);
r.put('/profile', auth, c.updateProfile);
r.put('/password', auth, c.changePassword);
export default r;
