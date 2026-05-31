import {
  getCart, addToCart, updateCartItem, removeCartItem, clearCart,
} from '../../controllers/cart.controller';
import Cart from '../../models/Cart';
import Product from '../../models/Product';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Cart', () => ({
  __esModule: true,
  default: {
    updateOne: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'userId123' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

function makeCart(items: any[] = []) {
  const cart: any = {
    items,
    totalAmount: 0,
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({ items: JSON.parse(JSON.stringify(items)), totalAmount: 0 }),
  };
  return cart;
}

function makeItemsArray(items: any[], foundItem: any) {
  const arr: any = [...items];
  arr.id = jest.fn().mockReturnValue(foundItem);
  return arr;
}

describe('getCart', () => {
  it('returns empty cart when no items', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = makeCart([]);
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await getCart(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ cart: { items: [], totalAmount: 0 } });
  });

  it('attaches stock info to cart items', async () => {
    const items = [{ productId: 1, title: 'Shoes', price: 99, quantity: 1 }];
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = makeCart(items);
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const mockStockData = [{ productId: 1, stock: 50 }];
    (Product.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(mockStockData) });
    const res = mockRes();
    await getCart(mockReq(), res);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.cart.items[0].stock).toBe(50);
  });
});

describe('addToCart', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(addToCart(mockReq({ body: { productId: 99 } }), res))
      .rejects.toMatchObject({ statusCode: 404, message: 'Product not found' });
  });

  it('throws 400 AppError when product is out of stock', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue({ productId: 1, stock: 0 });
    const res = mockRes();
    await expect(addToCart(mockReq({ body: { productId: 1, quantity: 1 } }), res))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('adds new item to cart', async () => {
    const product = { _id: 'pid1', productId: 1, stock: 10, title: 'Shoes', price: 99, image: '' };
    (Product.findOne as jest.Mock).mockResolvedValue(product);
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = { items: [], save: jest.fn().mockResolvedValue(true) };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await addToCart(mockReq({ body: { productId: 1, quantity: 1, size: 'M' } }), res);
    expect(cart.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('increases quantity when item already exists', async () => {
    const product = { _id: 'pid1', productId: 1, stock: 10, title: 'Shoes', price: 99, image: '' };
    (Product.findOne as jest.Mock).mockResolvedValue(product);
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const existingItem = { productId: 1, size: 'M', quantity: 2 };
    const cart = { items: [existingItem], save: jest.fn().mockResolvedValue(true) };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await addToCart(mockReq({ body: { productId: 1, quantity: 1, size: 'M' } }), res);
    expect(existingItem.quantity).toBe(3);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('updateCartItem', () => {
  it('throws 404 AppError when item not found in cart', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = { items: makeItemsArray([], null), save: jest.fn() };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await expect(updateCartItem(mockReq({ params: { itemId: 'i1' }, body: { quantity: 2 } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('updates item quantity', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const item: any = { quantity: 1, productId: 1 };
    const cart = { items: makeItemsArray([item], item), save: jest.fn().mockResolvedValue(true) };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    (Product.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ stock: 10 }) });
    const res = mockRes();
    await updateCartItem(mockReq({ params: { itemId: 'i1' }, body: { quantity: 3 } }), res);
    expect(item.quantity).toBe(3);
    expect(cart.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cart quantity updated' }));
  });
});

describe('removeCartItem', () => {
  it('throws 404 AppError when item not found', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = { items: makeItemsArray([], null), save: jest.fn() };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await expect(removeCartItem(mockReq({ params: { itemId: 'i1' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('removes item and saves cart', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const item: any = { deleteOne: jest.fn() };
    const cart = { items: makeItemsArray([item], item), save: jest.fn().mockResolvedValue(true) };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await removeCartItem(mockReq({ params: { itemId: 'i1' } }), res);
    expect(item.deleteOne).toHaveBeenCalled();
    expect(cart.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item removed from cart' }));
  });
});

describe('clearCart', () => {
  it('empties items and saves cart', async () => {
    (Cart.updateOne as jest.Mock).mockResolvedValue({});
    const cart = { items: [{ id: 1 }], save: jest.fn().mockResolvedValue(true) };
    (Cart.findOne as jest.Mock).mockResolvedValue(cart);
    const res = mockRes();
    await clearCart(mockReq(), res);
    expect(cart.items).toEqual([]);
    expect(cart.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cart cleared' }));
  });
});

