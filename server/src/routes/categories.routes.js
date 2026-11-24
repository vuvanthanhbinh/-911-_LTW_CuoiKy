import { Router } from 'express';
import { auth, authorize } from '../middleware/auth.js';
import * as c from '../controllers/categories.controller.js';

const r = Router();
r.get('/', auth, c.list);
r.post('/', auth, c.create);
r.put('/:id', auth, c.update);
r.delete('/:id', auth, authorize('admin'), c.remove);
export default r;
