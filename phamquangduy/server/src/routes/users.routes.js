import { Router } from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as c from '../controllers/users.controller.js';

const r = Router();
r.use(auth, authorize('admin'));
r.get('/', c.list);
r.patch('/:id', c.setStatus);
export default r;
