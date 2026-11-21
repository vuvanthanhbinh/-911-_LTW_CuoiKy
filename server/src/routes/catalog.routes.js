import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as c from '../controllers/catalog.controller.js';

const r = Router();
r.get('/catalog', c.catalog); // công khai
r.get('/suggest', auth, c.suggest);
r.get('/lookup', auth, c.lookup);
export default r;
