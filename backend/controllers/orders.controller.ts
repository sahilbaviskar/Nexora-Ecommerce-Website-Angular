import Joi from 'joi';
import { Request, Response } from 'express';

import * as OrderService from '../services/orders.service';

// ── Validation schemas ─────────────────────────────────────────────────────────

const addressSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  addressLine1: Joi.string().trim().required(),
  addressLine2: Joi.string().trim().allow('').default(''),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  postalCode: Joi.string().trim().required(),
  country: Joi.string().trim().required()
});

export const createOrderSchema = Joi.object({
  paymentMethod: Joi.string().valid('COD', 'CARD', 'UPI').required(),
  shippingAddress: addressSchema.required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
        size: Joi.string().trim().default('M')
      })
    )
    .optional()
});

export const statusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').optional()
});

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.placeOrder(req.user._id, req.body);
  res.status(201).json({ message: 'Order placed successfully', order });
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = await OrderService.listUserOrders(req.user._id);
  res.json({ orders });
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.fetchOrder(req.params.id as string, req.user._id, req.user.role);
  res.json({ order });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.changeOrderStatus(req.params.id as string, req.body);
  res.json({ message: 'Order updated', order });
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderService.cancelUserOrder(req.params.id as string, req.user._id);
  res.json({ message: 'Order cancelled', order });
};

export const bulkUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !status) {
    res.status(400).json({ message: 'ids and status are required' });
    return;
  }
  await Promise.all(ids.map(id => OrderService.changeOrderStatus(id as string, { status })));
  res.json({ message: `${ids.length} order(s) updated to "${status}"`, updated: ids.length });
};
