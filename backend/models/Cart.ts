import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    size: {
      type: String,
      default: 'M'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

cartSchema.pre('save', function cartPreSave(this: any) {
  this.totalAmount = this.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
});

export default mongoose.model('Cart', cartSchema);
