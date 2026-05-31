import Cart from '../models/Cart';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';

async function getOrCreateCart(userId: any) {
  await Cart.updateOne(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true }
  );
  return Cart.findOne({ user: userId });
}

export async function fetchCart(userId: any) {
  const cart = await getOrCreateCart(userId);
  const cartObj = cart.toObject();

  if (cartObj.items.length > 0) {
    const productIds = cartObj.items.map((i: any) => i.productId);
    const stockData = await Product.find({ productId: { $in: productIds } }).select('productId stock -_id');
    const stockMap = Object.fromEntries(stockData.map((p: any) => [p.productId, p.stock]));
    cartObj.items = cartObj.items.map((item: any) => ({ ...item, stock: stockMap[item.productId] ?? 100 })) as any;
  }

  return cartObj;
}

export async function addItem(userId: any, body: { productId: number; quantity: number; size: string }) {
  const product = await Product.findOne({ productId: body.productId });
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock === 0) throw new AppError('Product is out of stock', 400);

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find(
    (item: any) => item.productId === product.productId && item.size === body.size
  );

  if (existing) {
    existing.quantity = Math.min(existing.quantity + body.quantity, product.stock);
  } else {
    cart.items.push({
      product: product._id,
      productId: product.productId,
      title: product.title,
      image: product.image,
      price: product.price,
      size: body.size,
      quantity: Math.min(body.quantity, product.stock)
    });
  }

  await cart.save();
  return cart;
}

export async function updateItem(userId: any, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw new AppError('Cart item not found', 404);
  const product = await Product.findOne({ productId: item.productId }).select('stock');
  const maxQty = product?.stock ?? Infinity;
  item.quantity = Math.min(Math.max(1, quantity), maxQty);
  await cart.save();
  return cart;
}

export async function removeItem(userId: any, itemId: string) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw new AppError('Cart item not found', 404);
  item.deleteOne();
  await cart.save();
  return cart;
}

export async function emptyCart(userId: any) {
  const cart = await getOrCreateCart(userId);
  cart.items = [] as any;
  await cart.save();
  return cart;
}
