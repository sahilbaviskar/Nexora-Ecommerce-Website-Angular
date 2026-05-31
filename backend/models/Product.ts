import mongoose, { Document } from 'mongoose';

function slugify(title: string, productId: number): string {
  const base = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${productId}`;
}

export interface IProduct extends Document {
  productId: number;
  title: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  colors: string[];
  collections: string[];
  tags: string[];
  description: string;
  stock: number;
  slug: string;
  ratingsAverage: number;
  ratingsCount: number;
  createdBy?: mongoose.Types.ObjectId;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    productId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    colors: {
      type: [String],
      default: []
    },
    collections: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ''
    },
    stock: {
      type: Number,
      default: 100,
      min: 0
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

productSchema.pre('save', async function (this: any) {
  if (!this.slug || this.isModified('title') || this.isModified('productId')) {
    this.slug = slugify(this.title as string, this.productId as number);
  }
});

export default mongoose.model<IProduct>('Product', productSchema);
