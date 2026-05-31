import express from 'express';

import { getBlogs, getBlogBySlug, getCategories } from '../controllers/blog.controller';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

export default router;
