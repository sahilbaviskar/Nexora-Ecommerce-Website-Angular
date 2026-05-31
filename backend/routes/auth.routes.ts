import express from 'express';
import rateLimit from 'express-rate-limit';

import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  signup, login, getMe,
  forgotPassword, resetPassword,
  signupSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema
} from '../controllers/auth.controller';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
