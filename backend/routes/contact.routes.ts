import express from 'express';
import rateLimit from 'express-rate-limit';

import { validate } from '../middleware/validate';
import { submitContact, contactSchema } from '../controllers/contact.controller';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many messages sent, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/', contactLimiter, validate(contactSchema), submitContact);

export default router;
