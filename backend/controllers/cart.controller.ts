import Joi from 'joi';
import { Request, Response } from 'express';

import * as CartService from '../services/cart.service';

export const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  size: Joi.string().trim().default('M')
});

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await CartService.fetchCart(req.user._id);
  res.json({ cart });
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await CartService.addItem(req.user._id, req.body);
  res.status(201).json({ message: 'Item added to cart', cart });
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const cart = await CartService.updateItem(req.user._id, req.params.itemId as string, req.body.quantity);
  res.json({ message: 'Cart quantity updated', cart });
};

export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  const cart = await CartService.removeItem(req.user._id, req.params.itemId as string);
  res.json({ message: 'Item removed from cart', cart });
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await CartService.emptyCart(req.user._id);
  res.json({ message: 'Cart cleared', cart });
};
