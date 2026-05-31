import { Request, Response } from 'express';

import * as AdminService from '../services/admin.service';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
  const result = await AdminService.fetchAllUsers(page, limit);
  res.json(result);
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
  const result = await AdminService.fetchAllOrders(page, limit);
  res.json(result);
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await AdminService.fetchDashboard();
  res.json(data);
};
