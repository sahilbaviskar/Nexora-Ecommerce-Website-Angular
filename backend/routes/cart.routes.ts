import express from 'express';

import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  addToCartSchema,
  updateQuantitySchema
} from '../controllers/cart.controller';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, validate(addToCartSchema), addToCart);
router.put('/:itemId', protect, validate(updateQuantitySchema), updateCartItem);
router.delete('/:itemId', protect, removeCartItem);
router.delete('/', protect, clearCart);

export default router;
