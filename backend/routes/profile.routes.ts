import express from 'express';

import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
  updateProfileSchema,
  addressSchema,
  changePasswordSchema
} from '../controllers/profile.controller';

const router = express.Router();

router.get('/', protect, getProfile);
router.patch('/', protect, validate(updateProfileSchema), updateProfile);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.patch('/addresses/:id', protect, validate(addressSchema), updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
