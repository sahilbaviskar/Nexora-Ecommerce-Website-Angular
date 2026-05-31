import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { AppError } from '../utils/AppError';
import { sendPasswordResetEmail } from '../utils/mailer';

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

export async function forgotPassword(email: string, frontendUrl: string): Promise<{ devResetUrl?: string }> {
  const user = await User.findOne({ email });
  // Always return success to avoid revealing registered emails
  if (!user) return {};

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  const devUrl = await sendPasswordResetEmail(email, resetUrl);
  return devUrl ? { devResetUrl: devUrl } : {};
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() }
  });
  if (!user) throw new AppError('This reset link is invalid or has expired.', 400);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
}
