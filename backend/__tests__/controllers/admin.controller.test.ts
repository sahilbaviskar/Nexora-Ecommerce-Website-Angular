import { getUsers, getOrders, getDashboard } from '../../controllers/admin.controller';
import User from '../../models/User';
import Order from '../../models/Order';
import Product from '../../models/Product';

jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
  },
}));
jest.mock('../../models/Order', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));
jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: { countDocuments: jest.fn() },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'adminId', role: 'admin' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getUsers', () => {
  it('returns all users without passwords', async () => {
    const mockUsers = [{ _id: 'u1', name: 'Alice', email: 'a@x.com' }];
    const q: any = { select: jest.fn(), sort: jest.fn(), skip: jest.fn(), limit: jest.fn().mockResolvedValue(mockUsers) };
    q.select.mockReturnValue(q);
    q.sort.mockReturnValue(q);
    q.skip.mockReturnValue(q);
    (User.find as jest.Mock).mockReturnValue(q);
    (User.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getUsers(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ users: mockUsers, page: 1, total: 1 }));
  });
});

describe('getOrders', () => {
  it('returns all orders with user info', async () => {
    const mockOrders = [{ _id: 'o1', status: 'pending' }];
    const q: any = { populate: jest.fn(), sort: jest.fn(), skip: jest.fn(), limit: jest.fn().mockResolvedValue(mockOrders) };
    q.populate.mockReturnValue(q);
    q.sort.mockReturnValue(q);
    q.skip.mockReturnValue(q);
    (Order.find as jest.Mock).mockReturnValue(q);
    (Order.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getOrders(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ orders: mockOrders, page: 1, total: 1 }));
  });
});

describe('getDashboard', () => {
  it('returns dashboard stats', async () => {
    (User.countDocuments as jest.Mock).mockResolvedValue(10);
    (Order.countDocuments as jest.Mock).mockResolvedValue(5);
    (Product.countDocuments as jest.Mock).mockResolvedValue(50);
    (Order.aggregate as jest.Mock).mockResolvedValue([{ totalRevenue: 5000 }]);
    const q: any = { sort: jest.fn(), limit: jest.fn(), populate: jest.fn().mockResolvedValue([]) };
    q.sort.mockReturnValue(q);
    q.limit.mockReturnValue(q);
    (Order.find as jest.Mock).mockReturnValue(q);
    const res = mockRes();
    await getDashboard(mockReq(), res);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.stats.users).toBe(10);
    expect(payload.stats.orders).toBe(5);
    expect(payload.stats.products).toBe(50);
    expect(payload.stats.revenue).toBe(5000);
  });

  it('returns 0 revenue when no orders with revenue', async () => {
    (User.countDocuments as jest.Mock).mockResolvedValue(0);
    (Order.countDocuments as jest.Mock).mockResolvedValue(0);
    (Product.countDocuments as jest.Mock).mockResolvedValue(0);
    (Order.aggregate as jest.Mock).mockResolvedValue([]);
    const q: any = { sort: jest.fn(), limit: jest.fn(), populate: jest.fn().mockResolvedValue([]) };
    q.sort.mockReturnValue(q);
    q.limit.mockReturnValue(q);
    (Order.find as jest.Mock).mockReturnValue(q);
    const res = mockRes();
    await getDashboard(mockReq(), res);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.stats.revenue).toBe(0);
  });
});
