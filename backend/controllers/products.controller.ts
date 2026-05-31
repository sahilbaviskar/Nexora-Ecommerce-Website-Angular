import Joi from 'joi';
import { Request, Response } from 'express';

import * as ProductService from '../services/products.service';

export const createProductSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  image: Joi.string().trim().required(),
  images: Joi.array().items(Joi.string().trim()).default([]),
  category: Joi.string().trim().required(),
  subcategory: Joi.string().trim().required(),
  colors: Joi.array().items(Joi.string().trim()).default([]),
  collections: Joi.array().items(Joi.string().trim()).default([]),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  description: Joi.string().allow('').default(''),
  stock: Joi.number().integer().min(0).default(100)
});

export const updateProductSchema = createProductSchema.fork(['productId'], (field) => field.optional());

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  const collections = await ProductService.listCollections();
  res.json({ collections });
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const result = await ProductService.listProducts(req.query);
  res.json(result);
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const result = await ProductService.findProduct(req.params.slug as string);
  res.json(result);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductService.addProduct(req.body, req.user._id);
  res.status(201).json({ message: 'Product created', product });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductService.editProduct(Number(req.params.id), req.body);
  res.json({ message: 'Product updated', product });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await ProductService.removeProduct(Number(req.params.id));
  res.json({ message: 'Product deleted' });
};

export const bulkDeleteProducts = async (req: Request, res: Response): Promise<void> => {
  const ids: number[] = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'No product IDs provided' });
    return;
  }
  await Promise.all(ids.map(id => ProductService.removeProduct(Number(id))));
  res.json({ message: `${ids.length} product(s) deleted`, deleted: ids.length });
};
