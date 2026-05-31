import Address from '../models/Address';
import User from '../models/User';
import { AppError } from '../utils/AppError';

export async function updateProfile(userId: any, data: any) {
  return User.findByIdAndUpdate(userId, data, { new: true, runValidators: true, select: '-password' });
}

export async function changePassword(userId: any, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw new AppError('Current password is incorrect', 401);
  user.password = newPassword;
  await user.save();
}

export async function listAddresses(userId: any) {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
}

export async function createAddress(userId: any, data: any) {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  return Address.create({ ...data, user: userId });
}

export async function modifyAddress(userId: any, addressId: string, data: any) {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError('Address not found', 404);
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  Object.assign(address, data);
  await address.save();
  return address;
}

export async function removeAddress(userId: any, addressId: string) {
  const deleted = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!deleted) throw new AppError('Address not found', 404);
}
