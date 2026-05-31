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

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required()
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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
  const { devResetUrl } = await AuthService.forgotPassword(req.body.email, frontendUrl);
  res.json({
    message: 'If that email is registered, a reset link has been sent.',
    ...(devResetUrl ? { devResetUrl } : {})
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  await AuthService.resetPassword(req.body.token, req.body.password);
  res.json({ message: 'Password reset successfully. You can now log in.' });
};
