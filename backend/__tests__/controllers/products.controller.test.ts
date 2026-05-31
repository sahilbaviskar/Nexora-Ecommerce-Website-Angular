import {
  getCollections, getProducts, getProduct,
  createProduct, updateProduct, deleteProduct,
} from '../../controllers/products.controller';
import Product from '../../models/Product';
import Review from '../../models/Review';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: {
    distinct: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock('../../models/Review', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'uid1' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockProduct = { _id: 'p1', productId: 1, title: 'Shoes', price: 99, slug: 'shoes-1', stock: 50 };

describe('getCollections', () => {
  it('returns filtered collections', async () => {
    (Product.distinct as jest.Mock).mockResolvedValue(['trending', '', 'new-arrivals']);
    const res = mockRes();
    await getCollections(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ collections: ['trending', 'new-arrivals'] });
  });
});

describe('getProducts', () => {
  it('returns paginated products with defaults', async () => {
    const q: any = { sort: jest.fn(), skip: jest.fn(), limit: jest.fn().mockResolvedValue([mockProduct]) };
    q.sort.mockReturnValue(q);
    q.skip.mockReturnValue(q);
    (Product.find as jest.Mock).mockReturnValue(q);
    (Product.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getProducts(mockReq({ query: {} }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ items: [mockProduct], total: 1 }));
  });

  it('applies gender/category filter', async () => {
    const q: any = { sort: jest.fn(), skip: jest.fn(), limit: jest.fn().mockResolvedValue([]) };
    q.sort.mockReturnValue(q);
    q.skip.mockReturnValue(q);
    (Product.find as jest.Mock).mockReturnValue(q);
    (Product.countDocuments as jest.Mock).mockResolvedValue(0);
    const res = mockRes();
    await getProducts(mockReq({ query: { gender: 'men', page: '2', limit: '5' } }), res);
    const findCall = (Product.find as jest.Mock).mock.calls[0][0];
    expect(findCall.category).toBe('men');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 5 }));
  });
});

describe('getProduct', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(getProduct(mockReq({ params: { slug: 'unknown' } }), res))
      .rejects.toMatchObject({ statusCode: 404, message: 'Product not found' });
  });

  it('returns product with reviews', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    const rq: any = { populate: jest.fn(), sort: jest.fn().mockResolvedValue([]) };
    rq.populate.mockReturnValue(rq);
    (Review.find as jest.Mock).mockReturnValue(rq);
    const res = mockRes();
    await getProduct(mockReq({ params: { slug: 'shoes-1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ product: mockProduct, reviews: [] });
  });
});

describe('createProduct', () => {
  it('throws 409 AppError when productId already exists', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    const res = mockRes();
    await expect(createProduct(mockReq({ body: { productId: 1 } }), res))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates and returns product with 201', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    (Product.create as jest.Mock).mockResolvedValue(mockProduct);
    const res = mockRes();
    await createProduct(mockReq({ body: { productId: 99 } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ product: mockProduct }));
  });
});

describe('updateProduct', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(updateProduct(mockReq({ params: { id: '999' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns updated product', async () => {
    (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProduct);
    const res = mockRes();
    await updateProduct(mockReq({ params: { id: '1' }, body: { price: 120 } }), res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product updated', product: mockProduct });
  });
});

describe('deleteProduct', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOneAndDelete as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(deleteProduct(mockReq({ params: { id: '999' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('deletes product and its reviews', async () => {
    (Product.findOneAndDelete as jest.Mock).mockResolvedValue(mockProduct);
    (Review.deleteMany as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await deleteProduct(mockReq({ params: { id: '1' } }), res);
    expect(Review.deleteMany).toHaveBeenCalledWith({ product: mockProduct._id });
    expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
  });
});
