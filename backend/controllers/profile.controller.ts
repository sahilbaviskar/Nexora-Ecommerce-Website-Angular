import Joi from 'joi';
import { Request, Response } from 'express';

import * as ProfileService from '../services/profile.service';

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  phone: Joi.string().trim().allow('').optional()
}).min(1);

export const addressSchema = Joi.object({
  type: Joi.string().valid('home', 'office', 'other').default('home'),
  fullName: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  addressLine1: Joi.string().trim().required(),
  addressLine2: Joi.string().trim().allow('').default(''),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  postalCode: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  isDefault: Joi.boolean().default(false)
});

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: req.user });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await ProfileService.updateProfile(req.user._id, req.body);
  res.json({ message: 'Profile updated', user });
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  const addresses = await ProfileService.listAddresses(req.user._id);
  res.json({ addresses });
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  const address = await ProfileService.createAddress(req.user._id, req.body);
  res.status(201).json({ message: 'Address added', address });
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  const address = await ProfileService.modifyAddress(req.user._id, req.params.id as string, req.body);
  res.json({ message: 'Address updated', address });
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  await ProfileService.removeAddress(req.user._id, req.params.id as string);
  res.json({ message: 'Address deleted' });
};
