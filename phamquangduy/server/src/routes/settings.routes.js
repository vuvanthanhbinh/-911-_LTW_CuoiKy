import { Router } from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as c from '../controllers/settings.controller.js';

const r = Router();
r.get('/', auth, c.get); // mọi người dùng cần đọc để hiển thị đúng ngôn ngữ/tiền tệ
r.put('/', auth, authorize('admin'), c.update);
export default r;
