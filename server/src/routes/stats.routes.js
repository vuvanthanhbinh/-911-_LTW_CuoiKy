import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as c from '../controllers/stats.controller.js';

const r = Router();
r.get('/stats', auth, c.stats);
r.get('/alerts', auth, c.alerts);
export default r;
