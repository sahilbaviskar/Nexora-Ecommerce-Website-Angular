import Cart from '../models/Cart';
import Order from '../models/Order';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';

export async function placeOrder(userId: any, body: any) {
  const { paymentMethod, shippingAddress, items } = body;
  let finalItems: any[] = [];

  if (Array.isArray(items) && items.length > 0) {
    const products = await Product.find({ productId: { $in: items.map((i: any) => i.productId) } });

    for (const item of items) {
      const product = products.find((p: any) => p.productId === item.productId);
      if (!product) throw new AppError(`Product not found for productId ${item.productId}`, 404);
      finalItems.push({
        product: product._id,
        productId: product.productId,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        size: item.size || 'M'
      });
    }

    for (const item of finalItems) {
      const product = products.find((p: any) => p.productId === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${item.title}"`, 400);
      }
    }
  } else {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) throw new AppError('No cart items found to place order', 400);
    finalItems = cart.items as any[];

    const cartProducts = await Product.find({ productId: { $in: finalItems.map((i: any) => i.productId) } });
    for (const item of finalItems) {
      const product = cartProducts.find((p: any) => p.productId === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${item.title}"`, 400);
      }
    }
  }

  const totalAmount = finalItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: userId,
    items: finalItems,
    totalAmount,
    paymentMethod,
    shippingAddress
  });

  await Promise.all(
    finalItems.map((item: any) =>
      Product.updateOne({ productId: item.productId }, { $inc: { stock: -item.quantity } })
    )
  );

  await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { returnDocument: 'after' });

  return order;
}

export async function listUserOrders(userId: any) {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
}

export async function fetchOrder(orderId: string, userId: any, role: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== userId.toString() && role !== 'admin') {
    throw new AppError('Not allowed to view this order', 403);
  }
  return order;
}

export async function changeOrderStatus(orderId: string, data: any) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const previousStatus = order.status;
  Object.assign(order, data);
  await order.save();

  if (data.status === 'cancelled' && previousStatus !== 'cancelled') {
    await Promise.all(
      (order.items as any[]).map((item: any) =>
        Product.updateOne({ productId: item.productId }, { $inc: { stock: item.quantity } })
      )
    );
  }

  return order;
}
