import mongoose, { Document, Model } from 'mongoose';
import Product from './Product';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

interface IReviewModel extends Model<IReview> {
  refreshProductRatings(productId: mongoose.Types.ObjectId | string): Promise<void>;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.statics.refreshProductRatings = async function refreshProductRatings(
  productId: mongoose.Types.ObjectId | string
): Promise<void> {
  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId as string) } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0
    });
    return;
  }

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Number(stats[0].average.toFixed(2)),
    ratingsCount: stats[0].count
  });
};

reviewSchema.post('save', async function postSaveReview(this: IReview) {
  await (this.constructor as IReviewModel).refreshProductRatings(this.product);
});

reviewSchema.post('findOneAndDelete', async function postDeleteReview(doc: IReview | null) {
  if (doc) {
    await (doc.constructor as IReviewModel).refreshProductRatings(doc.product);
  }
});

export default mongoose.model<IReview, IReviewModel>('Review', reviewSchema);
