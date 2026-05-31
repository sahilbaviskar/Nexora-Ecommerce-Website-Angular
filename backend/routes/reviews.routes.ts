import express from 'express';

import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  reviewCreateSchema,
  reviewUpdateSchema
} from '../controllers/reviews.controller';

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, validate(reviewCreateSchema), createReview);
router.put('/:id', protect, validate(reviewUpdateSchema), updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
