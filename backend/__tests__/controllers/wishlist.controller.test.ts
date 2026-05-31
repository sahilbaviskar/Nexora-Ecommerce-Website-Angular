import { getWishlist, addToWishlist, removeFromWishlist } from '../../controllers/wishlist.controller';
import Wishlist from '../../models/Wishlist';
import Product from '../../models/Product';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Wishlist', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
  },
}));
jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
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

const mockWishlist = { _id: 'w1', user: 'userId123', products: [] };
const mockProduct = { _id: 'p1', productId: 1, title: 'Shoes', slug: 'shoes' };

function makeWishlistQuery(resolveWith: any) {
  const q: any = { populate: jest.fn(), lean: jest.fn().mockResolvedValue(resolveWith) };
  q.populate.mockReturnValue(q);
  return q;
}

describe('getWishlist', () => {
  it('returns existing wishlist', async () => {
    (Wishlist.findOne as jest.Mock).mockReturnValue(makeWishlistQuery(mockWishlist));
    const res = mockRes();
    await getWishlist(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ wishlist: mockWishlist });
  });

  it('creates wishlist when none exists', async () => {
    (Wishlist.findOne as jest.Mock).mockReturnValue(makeWishlistQuery(null));
    const created = { _id: 'newW' };
    (Wishlist.create as jest.Mock).mockResolvedValue(created);
    (Wishlist.findById as jest.Mock).mockReturnValue(makeWishlistQuery(mockWishlist));
    const res = mockRes();
    await getWishlist(mockReq(), res);
    expect(Wishlist.create).toHaveBeenCalledWith({ user: 'userId123', products: [] });
    expect(res.json).toHaveBeenCalledWith({ wishlist: mockWishlist });
  });
});

describe('addToWishlist', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(addToWishlist(mockReq({ params: { productId: '99' } }), res))
      .rejects.toMatchObject({ statusCode: 404, message: 'Product not found' });
  });

  it('adds product to wishlist', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    (Wishlist.updateOne as jest.Mock).mockResolvedValue({});
    (Wishlist.findOne as jest.Mock).mockReturnValue(makeWishlistQuery(mockWishlist));
    const res = mockRes();
    await addToWishlist(mockReq({ params: { productId: '1' } }), res);
    expect(Wishlist.updateOne).toHaveBeenCalledWith(
      { user: 'userId123' },
      { $setOnInsert: { user: 'userId123' }, $addToSet: { products: mockProduct._id } },
      { upsert: true }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Added to wishlist', wishlist: mockWishlist });
  });
});

describe('removeFromWishlist', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(removeFromWishlist(mockReq({ params: { productId: '99' } }), res))
      .rejects.toMatchObject({ statusCode: 404, message: 'Product not found' });
  });

  it('removes product from wishlist', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    (Wishlist.updateOne as jest.Mock).mockResolvedValue({});
    (Wishlist.findOne as jest.Mock).mockReturnValue(makeWishlistQuery(mockWishlist));
    const res = mockRes();
    await removeFromWishlist(mockReq({ params: { productId: '1' } }), res);
    expect(Wishlist.updateOne).toHaveBeenCalledWith(
      { user: 'userId123' },
      { $pull: { products: mockProduct._id } },
      { upsert: true }
    );
    expect(res.json).toHaveBeenCalledWith({ message: 'Removed from wishlist', wishlist: mockWishlist });
  });
});
