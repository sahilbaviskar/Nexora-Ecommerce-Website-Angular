import Joi from 'joi';
import { Request, Response } from 'express';

import * as ReviewService from '../services/reviews.service';

export const reviewCreateSchema = Joi.object({
  productSlug: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').max(500).default('')
});

export const reviewUpdateSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().allow('').max(500).optional()
}).min(1);

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  const reviews = await ReviewService.listReviews(req.query.product as string);
  res.json({ reviews });
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  const review = await ReviewService.addReview(req.user._id, req.body);
  res.status(201).json({ message: 'Review added', review });
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const review = await ReviewService.editReview(req.params.id as string, req.user._id, req.user.role, req.body);
  res.json({ message: 'Review updated', review });
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  await ReviewService.removeReview(req.params.id as string, req.user._id, req.user.role);
  res.json({ message: 'Review deleted' });
};
