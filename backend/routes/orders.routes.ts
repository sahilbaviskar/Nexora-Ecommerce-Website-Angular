import express from 'express';

import { protect, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  createOrderSchema,
  statusSchema
} from '../controllers/orders.controller';

const router = express.Router();

router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, adminOnly, validate(statusSchema), updateOrderStatus);

export default router;
