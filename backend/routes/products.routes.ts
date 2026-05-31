import express from 'express';

import { protect, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getCollections,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  createProductSchema,
  updateProductSchema
} from '../controllers/products.controller';

const router = express.Router();

router.get('/collections', getCollections);
router.get('/', getProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, validate(createProductSchema), createProduct);
router.put('/:id', protect, adminOnly, validate(updateProductSchema), updateProduct);
router.delete('/bulk', protect, adminOnly, bulkDeleteProducts);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
