import { getBlogs, getBlogBySlug, getCategories } from '../../controllers/blog.controller';
import Blog from '../../models/Blog';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/Blog', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    distinct: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockBlog = { _id: 'b1', title: 'Hello World', slug: 'hello-world', category: 'Tech' };

describe('getBlogs', () => {
  function setupBlogQuery(blogs: any[]) {
    const q: any = { sort: jest.fn(), skip: jest.fn(), limit: jest.fn(), select: jest.fn().mockResolvedValue(blogs) };
    q.sort.mockReturnValue(q);
    q.skip.mockReturnValue(q);
    q.limit.mockReturnValue(q);
    (Blog.find as jest.Mock).mockReturnValue(q);
  }

  it('returns paginated blogs with defaults', async () => {
    setupBlogQuery([mockBlog]);
    (Blog.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getBlogs(mockReq({ query: {} }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      blogs: [mockBlog],
      total: 1,
      page: 1,
      limit: 9,
    }));
  });

  it('applies category filter', async () => {
    setupBlogQuery([mockBlog]);
    (Blog.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getBlogs(mockReq({ query: { category: 'Tech' } }), res);
    const findArg = (Blog.find as jest.Mock).mock.calls[0][0];
    expect(findArg.category).toBe('Tech');
  });

  it('applies tag filter', async () => {
    setupBlogQuery([]);
    (Blog.countDocuments as jest.Mock).mockResolvedValue(0);
    const res = mockRes();
    await getBlogs(mockReq({ query: { tag: 'js' } }), res);
    const findArg = (Blog.find as jest.Mock).mock.calls[0][0];
    expect(findArg.tags).toEqual({ $in: ['js'] });
  });

  it('applies featured filter', async () => {
    setupBlogQuery([mockBlog]);
    (Blog.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getBlogs(mockReq({ query: { featured: 'true' } }), res);
    const findArg = (Blog.find as jest.Mock).mock.calls[0][0];
    expect(findArg.featured).toBe(true);
  });

  it('applies search filter', async () => {
    setupBlogQuery([mockBlog]);
    (Blog.countDocuments as jest.Mock).mockResolvedValue(1);
    const res = mockRes();
    await getBlogs(mockReq({ query: { search: 'Hello' } }), res);
    const findArg = (Blog.find as jest.Mock).mock.calls[0][0];
    expect(findArg.title).toEqual({ $regex: 'Hello', $options: 'i' });
  });
});

describe('getBlogBySlug', () => {
  it('throws 404 AppError when blog not found', async () => {
    (Blog.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(getBlogBySlug(mockReq({ params: { slug: 'unknown' } }), res))
      .rejects.toMatchObject({ statusCode: 404, message: 'Blog post not found' });
  });

  it('returns blog by slug', async () => {
    (Blog.findOne as jest.Mock).mockResolvedValue(mockBlog);
    const res = mockRes();
    await getBlogBySlug(mockReq({ params: { slug: 'hello-world' } }), res);
    expect(res.json).toHaveBeenCalledWith({ blog: mockBlog });
  });
});

describe('getCategories', () => {
  it('returns distinct blog categories', async () => {
    (Blog.distinct as jest.Mock).mockResolvedValue(['Tech', 'Lifestyle', 'News']);
    const res = mockRes();
    await getCategories(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ categories: ['Tech', 'Lifestyle', 'News'] });
  });
});
