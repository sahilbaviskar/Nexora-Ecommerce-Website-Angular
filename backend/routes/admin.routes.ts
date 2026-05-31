import express from 'express';

import { protect, adminOnly } from '../middleware/auth';
import { getUsers, getOrders, getDashboard } from '../controllers/admin.controller';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', getUsers);
router.get('/orders', getOrders);
router.get('/dashboard', getDashboard);

export default router;
