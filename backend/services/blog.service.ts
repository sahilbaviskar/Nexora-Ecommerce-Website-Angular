import Blog from '../models/Blog';
import { AppError } from '../utils/AppError';

export interface BlogFilters {
  page?: any;
  limit?: any;
  category?: any;
  tag?: any;
  search?: any;
  featured?: any;
}

export async function listBlogs(filters: BlogFilters) {
  const { page = 1, limit = 9, category, tag, search, featured } = filters;
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);

  const query: Record<string, any> = {};
  if (category) query.category = category;
  if (tag) query.tags = { $in: [String(tag)] };
  if (featured === 'true') query.featured = true;
  if (search) query.title = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .select('-content'),
    Blog.countDocuments(query)
  ]);

  return { blogs, page: numericPage, limit: numericLimit, total, totalPages: Math.ceil(total / numericLimit) };
}

export async function findBlog(slug: string) {
  const blog = await Blog.findOne({ slug });
  if (!blog) throw new AppError('Blog post not found', 404);
  return blog;
}

export async function listCategories() {
  return Blog.distinct('category');
}
