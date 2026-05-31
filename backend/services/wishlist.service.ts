import Product from '../models/Product';
import Wishlist from '../models/Wishlist';
import { AppError } from '../utils/AppError';

const populate = {
  path: 'products',
  select: 'productId title price image images category subcategory colors collections tags description slug'
};

export async function fetchWishlist(userId: any) {
  let wishlist: any = await Wishlist.findOne({ user: userId }).populate(populate).lean();
  if (!wishlist) {
    const created = await Wishlist.create({ user: userId, products: [] });
    wishlist = await Wishlist.findById(created._id).populate(populate).lean();
  }
  return wishlist;
}

export async function addToWishlist(userId: any, productId: number) {
  const product = await Product.findOne({ productId });
  if (!product) throw new AppError('Product not found', 404);
  await Wishlist.updateOne(
    { user: userId },
    { $setOnInsert: { user: userId }, $addToSet: { products: product._id } },
    { upsert: true }
  );
  return Wishlist.findOne({ user: userId }).populate(populate).lean();
}

export async function removeFromWishlist(userId: any, productId: number) {
  const product = await Product.findOne({ productId });
  if (!product) throw new AppError('Product not found', 404);
  await Wishlist.updateOne({ user: userId }, { $pull: { products: product._id } }, { upsert: true });
  return Wishlist.findOne({ user: userId }).populate(populate).lean();
}
