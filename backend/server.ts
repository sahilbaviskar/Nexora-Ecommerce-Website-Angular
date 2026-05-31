import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import { notFound, errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import reviewsRoutes from './routes/reviews.routes';
import cartRoutes from './routes/cart.routes';
import ordersRoutes from './routes/orders.routes';
import wishlistRoutes from './routes/wishlist.routes';
import profileRoutes from './routes/profile.routes';
import adminRoutes from './routes/admin.routes';
import blogRoutes from './routes/blog.routes';
import contactRoutes from './routes/contact.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200'
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer(): Promise<void> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }

  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error(error, 'Failed to start server');
  process.exit(1);
});
