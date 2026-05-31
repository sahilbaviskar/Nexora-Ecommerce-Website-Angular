import Product from '../models/Product';
import Review from '../models/Review';
import { AppError } from '../utils/AppError';

export interface ProductFilters {
  page?: any;
  limit?: any;
  gender?: any;
  category?: any;
  subcategory?: any;
  collection?: any;
  tag?: any;
  search?: any;
  sortBy?: any;
  sortOrder?: any;
  minPrice?: any;
  maxPrice?: any;
}

export async function listCollections() {
  const collections = await Product.distinct('collections');
  return collections.filter(Boolean);
}

export async function listProducts(filters: ProductFilters) {
  const {
    page = 1,
    limit = 100,
    gender,
    category,
    subcategory,
    collection,
    tag,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minPrice,
    maxPrice
  } = filters;

  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 1000);

  const query: Record<string, any> = {};
  if (gender) query.category = String(gender).toLowerCase();
  if (category) query.category = String(category).toLowerCase();
  if (subcategory) query.subcategory = String(subcategory).toLowerCase();
  if (collection) query.collections = { $in: [String(collection).toLowerCase()] };
  if (tag) query.tags = { $in: [String(tag).toLowerCase()] };
  if (search) query.title = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const allowedSortFields = ['createdAt', 'price', 'title', 'ratingsAverage'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const safeSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Product.countDocuments(query)
  ]);

  return { items, page: numericPage, limit: numericLimit, total, totalPages: Math.ceil(total / numericLimit) };
}

export async function findProduct(slug: string) {
  const product = await Product.findOne({ slug });
  if (!product) throw new AppError('Product not found', 404);
  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  return { product, reviews };
}

export async function addProduct(data: any, userId: any) {
  const existing = await Product.findOne({ productId: data.productId });
  if (existing) throw new AppError('Product with this productId already exists', 409);
  const product = await Product.create({ ...data, createdBy: userId });
  return product;
}

export async function editProduct(id: number, data: any) {
  const product = await Product.findOneAndUpdate({ productId: id }, data, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

export async function removeProduct(id: number) {
  const deleted = await Product.findOneAndDelete({ productId: id });
  if (!deleted) throw new AppError('Product not found', 404);
  await Review.deleteMany({ product: deleted._id });
}
