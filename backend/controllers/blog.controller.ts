import { Request, Response } from 'express';

import * as BlogService from '../services/blog.service';

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const result = await BlogService.listBlogs(req.query);
  res.json(result);
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  const blog = await BlogService.findBlog(req.params.slug as string);
  res.json({ blog });
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await BlogService.listCategories();
  res.json({ categories });
};
