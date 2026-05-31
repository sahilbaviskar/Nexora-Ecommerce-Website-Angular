import Product from '../models/Product';
import Review from '../models/Review';
import { AppError } from '../utils/AppError';

export async function listReviews(productSlug: string) {
  const product = await Product.findOne({ slug: productSlug });
  if (!product) throw new AppError('Product not found', 404);
  return Review.find({ product: product._id }).populate('user', 'name').sort({ createdAt: -1 });
}

export async function addReview(
  userId: any,
  data: { productSlug: string; rating: number; comment: string }
) {
  const product = await Product.findOne({ slug: data.productSlug });
  if (!product) throw new AppError('Product not found', 404);
  const existing = await Review.findOne({ user: userId, product: product._id });
  if (existing) throw new AppError('You already reviewed this product', 409);
  return Review.create({ user: userId, product: product._id, rating: data.rating, comment: data.comment });
}

export async function editReview(
  reviewId: string,
  userId: any,
  role: string,
  data: { rating?: number; comment?: string }
) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (review.user.toString() !== userId.toString() && role !== 'admin') {
    throw new AppError('Not allowed to edit this review', 403);
  }
  if (typeof data.rating !== 'undefined') review.rating = data.rating;
  if (typeof data.comment !== 'undefined') review.comment = data.comment;
  await review.save();
  await Review.refreshProductRatings(review.product);
  return review;
}

export async function removeReview(reviewId: string, userId: any, role: string) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (review.user.toString() !== userId.toString() && role !== 'admin') {
    throw new AppError('Not allowed to delete this review', 403);
  }
  const productId = review.product;
  await Review.findByIdAndDelete(review._id);
  await Review.refreshProductRatings(productId);
}
