import Joi from 'joi';
import { Request, Response } from 'express';

import * as AuthService from '../services/auth.service';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  const result = await AuthService.registerUser(req.body.name, req.body.email, req.body.password);
  res.status(201).json({ message: 'User created', ...result });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await AuthService.authenticateUser(req.body.email, req.body.password);
  res.json({ message: 'Login successful', ...result });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: req.user });
};
