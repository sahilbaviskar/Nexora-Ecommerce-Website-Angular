import jwt from 'jsonwebtoken';

import User from '../models/User';
import { AppError } from '../utils/AppError';

function signToken(user: any): string {
  return jwt.sign(
    { userId: user._id.toString(), name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
}

function toPayload(user: any) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('User already exists', 409);
  const user = await User.create({ name, email, password });
  return { token: signToken(user), user: toPayload(user) };
}

export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', 401);
  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError('Invalid credentials', 401);
  return { token: signToken(user), user: toPayload(user) };
}
