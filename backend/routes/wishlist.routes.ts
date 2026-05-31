import express from 'express';

import { protect } from '../middleware/auth';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/:productId', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);

export default router;
