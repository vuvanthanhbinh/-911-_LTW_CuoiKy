import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as c from '../controllers/orders.controller.js';

const r = Router();
r.get('/', auth, c.list);
r.get('/export', auth, c.exportCsv); // phải đặt trước '/:id'
r.get('/:id', auth, c.detail);
r.post('/', auth, c.create);
r.put('/:id/status', auth, c.updateStatus);
export default r;
