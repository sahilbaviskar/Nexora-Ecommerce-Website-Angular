import { Request, Response } from 'express';

import * as WishlistService from '../services/wishlist.service';

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const wishlist = await WishlistService.fetchWishlist(req.user._id);
  res.json({ wishlist });
};

export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  const wishlist = await WishlistService.addToWishlist(req.user._id, Number(req.params.productId));
  res.status(201).json({ message: 'Added to wishlist', wishlist });
};

export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  const wishlist = await WishlistService.removeFromWishlist(req.user._id, Number(req.params.productId));
  res.json({ message: 'Removed from wishlist', wishlist });
};
