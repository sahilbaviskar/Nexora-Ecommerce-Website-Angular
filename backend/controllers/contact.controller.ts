import Joi from 'joi';
import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';

export const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  subject: Joi.string().trim().max(200).allow('').optional(),
  message: Joi.string().trim().min(10).max(2000).required()
});

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  await ContactMessage.create(req.body);
  res.status(201).json({ message: 'Your message has been received. We will get back to you shortly.' });
};
