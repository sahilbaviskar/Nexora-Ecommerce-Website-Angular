import { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const isOperational = err instanceof AppError;
  const statusCode = isOperational ? err.statusCode : (res.statusCode === 200 ? 500 : res.statusCode);

  logger.error({ err, req: { method: req.method, url: req.originalUrl } }, 'Request error');

  res.status(statusCode).json({
    message: isOperational ? err.message : 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
