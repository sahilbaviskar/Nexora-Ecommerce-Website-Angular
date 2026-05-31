import {
  getReviews, createReview, updateReview, deleteReview,
} from '../../controllers/reviews.controller';
import Review from '../../models/Review';
import Product from '../../models/Product';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Review', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    refreshProductRatings: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../models/Product', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'userId123', toString: () => 'userId123' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockProduct = { _id: 'prod1', title: 'Shoes' };
const mockReview: any = {
  _id: 'rev1',
  user: { toString: () => 'userId123' },
  product: 'prod1',
  rating: 4,
  comment: 'Good',
  save: jest.fn().mockResolvedValue(true),
};

describe('getReviews', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(getReviews(mockReq({ query: { product: 'unknown' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns reviews for product', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    const rq: any = { populate: jest.fn(), sort: jest.fn().mockResolvedValue([mockReview]) };
    rq.populate.mockReturnValue(rq);
    (Review.find as jest.Mock).mockReturnValue(rq);
    const res = mockRes();
    await getReviews(mockReq({ query: { product: 'shoes-1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ reviews: [mockReview] });
  });
});

describe('createReview', () => {
  it('throws 404 AppError when product not found', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(createReview(mockReq({ body: { productSlug: 'unknown', rating: 5, comment: 'Nice' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 409 AppError when user already reviewed the product', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    (Review.findOne as jest.Mock).mockResolvedValue(mockReview);
    const res = mockRes();
    await expect(createReview(mockReq({ body: { productSlug: 'shoes', rating: 5, comment: 'Again' } }), res))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates review and returns 201', async () => {
    (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
    (Review.findOne as jest.Mock).mockResolvedValue(null);
    (Review.create as jest.Mock).mockResolvedValue({ _id: 'newRev', rating: 5, comment: 'Great' });
    const res = mockRes();
    await createReview(mockReq({ body: { productSlug: 'shoes', rating: 5, comment: 'Great' } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Review added' }));
  });
});

describe('updateReview', () => {
  it('throws 404 AppError when review not found', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(updateReview(mockReq({ params: { id: 'x' }, body: { rating: 4, comment: 'Ok' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 AppError when user does not own review', async () => {
    const otherReview = { ...mockReview, user: { toString: () => 'otherId' }, save: jest.fn() };
    (Review.findById as jest.Mock).mockResolvedValue(otherReview);
    const res = mockRes();
    await expect(updateReview(mockReq({ params: { id: 'rev1' }, body: { rating: 3, comment: 'Meh' } }), res))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('updates review and refreshes ratings', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(mockReview);
    (Review.refreshProductRatings as jest.Mock).mockResolvedValue(undefined);
    const res = mockRes();
    await updateReview(mockReq({ params: { id: 'rev1' }, body: { rating: 3, comment: 'Updated' } }), res);
    expect(mockReview.save).toHaveBeenCalled();
    expect(Review.refreshProductRatings).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Review updated' }));
  });
});

describe('deleteReview', () => {
  it('throws 404 AppError when review not found', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(deleteReview(mockReq({ params: { id: 'x' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 AppError when user does not own review', async () => {
    const otherReview = { ...mockReview, user: { toString: () => 'otherId' } };
    (Review.findById as jest.Mock).mockResolvedValue(otherReview);
    const res = mockRes();
    await expect(deleteReview(mockReq({ params: { id: 'rev1' } }), res))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('deletes review', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(mockReview);
    (Review.findByIdAndDelete as jest.Mock).mockResolvedValue(mockReview);
    const res = mockRes();
    await deleteReview(mockReq({ params: { id: 'rev1' } }), res);
    expect(Review.findByIdAndDelete).toHaveBeenCalledWith('rev1');
    expect(res.json).toHaveBeenCalledWith({ message: 'Review deleted' });
  });
});
