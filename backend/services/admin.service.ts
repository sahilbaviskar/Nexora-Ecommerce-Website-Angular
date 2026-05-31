import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

export async function fetchAllUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  return { users, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function fetchAllOrders(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments()
  ]);
  return { orders, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function fetchDashboard() {
  const [userCount, orderCount, productCount, revenueResult, latestOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'pending'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
  ]);

  return {
    stats: {
      users: userCount,
      orders: orderCount,
      products: productCount,
      revenue: revenueResult[0]?.totalRevenue || 0
    },
    latestOrders
  };
}
