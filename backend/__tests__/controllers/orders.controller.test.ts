import {
  createOrder, getUserOrders, getOrder, updateOrderStatus,
} from '../../controllers/orders.controller';
import Order from '../../models/Order';
import Product from '../../models/Product';
import Cart from '../../models/Cart';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Order', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    updateOne: jest.fn(),
  },
}));
jest.mock('../../models/Cart', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'userId123', name: 'Alice' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockProduct = { productId: 1, stock: 100, title: 'Shoes', price: 99, images: [] };
const mockOrder = {
  _id: 'orderId1',
  user: { toString: () => 'userId123' },
  status: 'pending',
  items: [{ productId: 1, quantity: 2, title: 'Shoes', price: 99 }],
  save: jest.fn().mockResolvedValue(true),
};

describe('createOrder', () => {
  it('creates order with items from request', async () => {
    (Product.find as jest.Mock).mockResolvedValue([mockProduct]);
    (Order.create as jest.Mock).mockResolvedValue(mockOrder);
    (Product.updateOne as jest.Mock).mockResolvedValue({});
    (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await createOrder(mockReq({
      body: {
        items: [{ productId: 1, quantity: 1, title: 'Shoes', price: 99, image: '' }],
        shippingAddress: { street: '1 Main', city: 'NY', state: 'NY', zip: '10001', country: 'US' },
        paymentMethod: 'card',
      },
    }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(Product.updateOne).toHaveBeenCalledWith(
      { productId: 1 },
      { $inc: { stock: -1 } }
    );
  });

  it('throws when product not found during order', async () => {
    (Product.find as jest.Mock).mockResolvedValue([]);
    await expect(
      createOrder(mockReq({
        body: {
          items: [{ productId: 99, quantity: 1, title: 'Ghost', price: 50 }],
          shippingAddress: {},
          paymentMethod: 'card',
        },
      }), mockRes())
    ).rejects.toThrow('Product not found for productId 99');
  });

  it('throws 400 AppError when stock is insufficient', async () => {
    const lowStock = { ...mockProduct, stock: 1, title: 'LowShoes' };
    (Product.find as jest.Mock).mockResolvedValue([lowStock]);
    const res = mockRes();
    await expect(createOrder(mockReq({
      body: {
        items: [{ productId: 1, quantity: 5, title: 'LowShoes', price: 99 }],
        shippingAddress: {},
        paymentMethod: 'card',
      },
    }), res)).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('Insufficient stock') });
  });

  it('throws 400 AppError when cart is empty', async () => {
    const emptyCart = { items: [] };
    (Cart.findOne as jest.Mock).mockResolvedValue(emptyCart);
    const res = mockRes();
    await expect(createOrder(mockReq({ body: { shippingAddress: {}, paymentMethod: 'card' } }), res))
      .rejects.toMatchObject({ statusCode: 400, message: 'No cart items found to place order' });
  });

  it('creates order from cart items', async () => {
    const cart = {
      items: [{ productId: 1, quantity: 2, title: 'Shoes', price: 99, image: '' }],
    };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    (Product.find as jest.Mock).mockResolvedValue([mockProduct]);
    (Order.create as jest.Mock).mockResolvedValue(mockOrder);
    (Product.updateOne as jest.Mock).mockResolvedValue({});
    (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await createOrder(mockReq({ body: { shippingAddress: {}, paymentMethod: 'card' } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('throws 400 AppError when cart stock is insufficient', async () => {
    const cart = { items: [{ productId: 1, quantity: 200, title: 'Shoes', price: 99 }] };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    (Product.find as jest.Mock).mockResolvedValue([{ ...mockProduct, stock: 5 }]);
    const res = mockRes();
    await expect(createOrder(mockReq({ body: { shippingAddress: {}, paymentMethod: 'card' } }), res))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('getUserOrders', () => {
  it('returns list of orders for user', async () => {
    const q: any = { sort: jest.fn().mockResolvedValue([mockOrder]) };
    (Order.find as jest.Mock).mockReturnValue(q);
    const res = mockRes();
    await getUserOrders(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ orders: [mockOrder] });
  });
});

describe('getOrder', () => {
  it('throws 404 AppError when order not found', async () => {
    (Order.findById as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(getOrder(mockReq({ params: { id: 'none' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 AppError when order belongs to another user', async () => {
    const otherOrder = { ...mockOrder, user: { toString: () => 'otherId' } };
    (Order.findById as jest.Mock).mockResolvedValue(otherOrder);
    const res = mockRes();
    await expect(getOrder(mockReq({ params: { id: 'orderId1' } }), res))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('returns order for its owner', async () => {
    (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
    const res = mockRes();
    await getOrder(mockReq({ params: { id: 'orderId1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ order: mockOrder });
  });
});

describe('updateOrderStatus', () => {
  it('throws 404 AppError when order not found', async () => {
    (Order.findById as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(updateOrderStatus(mockReq({ params: { id: 'x' }, body: { status: 'shipped' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('updates order status to shipped', async () => {
    const order = { ...mockOrder, status: 'pending', save: jest.fn().mockResolvedValue(true) };
    (Order.findById as jest.Mock).mockResolvedValue(order);
    const res = mockRes();
    await updateOrderStatus(mockReq({ params: { id: 'orderId1' }, body: { status: 'shipped' } }), res);
    expect(order.status).toBe('shipped');
    expect(order.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Order updated' }));
  });

  it('restores stock when order is cancelled', async () => {
    const order = {
      _id: 'orderId1',
      status: 'pending',
      items: [{ productId: 1, quantity: 3, title: 'Shoes' }],
      save: jest.fn().mockResolvedValue(true),
    };
    (Order.findById as jest.Mock).mockResolvedValue(order);
    (Product.updateOne as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await updateOrderStatus(mockReq({ params: { id: 'orderId1' }, body: { status: 'cancelled' } }), res);
    expect(Product.updateOne).toHaveBeenCalledWith(
      { productId: 1 },
      { $inc: { stock: 3 } }
    );
  });

  it('does NOT restore stock when order is already cancelled', async () => {
    const order = {
      _id: 'orderId1',
      status: 'cancelled',
      items: [{ productId: 1, quantity: 3, title: 'Shoes' }],
      save: jest.fn().mockResolvedValue(true),
    };
    (Order.findById as jest.Mock).mockResolvedValue(order);
    (Product.updateOne as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await updateOrderStatus(mockReq({ params: { id: 'orderId1' }, body: { status: 'cancelled' } }), res);
    expect(Product.updateOne).not.toHaveBeenCalled();
  });
});
