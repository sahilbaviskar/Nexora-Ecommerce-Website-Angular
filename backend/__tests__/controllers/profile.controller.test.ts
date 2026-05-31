import {
  getProfile, updateProfile,
  getAddresses, addAddress, updateAddress, deleteAddress,
} from '../../controllers/profile.controller';
import User from '../../models/User';
import Address from '../../models/Address';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));
jest.mock('../../models/Address', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

const mockReq = (overrides: any = {}): any => ({
  body: {}, params: {}, query: {},
  user: { _id: 'userId123' },
  ...overrides,
});
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = { _id: 'userId123', name: 'Alice', email: 'a@x.com' };
const mockAddress: any = {
  _id: 'addr1', street: '1 Main', city: 'NY',
  isDefault: false,
  save: jest.fn().mockResolvedValue(true),
};

describe('getProfile', () => {
  it('returns the authenticated user from req.user', async () => {
    const res = mockRes();
    await getProfile(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ user: { _id: 'userId123' } });
  });
});

describe('updateProfile', () => {
  it('returns updated user', async () => {
    const updated = { ...mockUser, name: 'Bob' };
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
    const res = mockRes();
    await updateProfile(mockReq({ body: { name: 'Bob' } }), res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated', user: updated });
  });
});

describe('getAddresses', () => {
  it('returns sorted addresses for user', async () => {
    const addresses = [mockAddress];
    const q: any = { sort: jest.fn().mockResolvedValue(addresses) };
    (Address.find as jest.Mock).mockReturnValue(q);
    const res = mockRes();
    await getAddresses(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ addresses });
  });
});

describe('addAddress', () => {
  it('creates address without clearing defaults', async () => {
    (Address.create as jest.Mock).mockResolvedValue(mockAddress);
    const res = mockRes();
    await addAddress(mockReq({ body: { street: '1 Main', isDefault: false } }), res);
    expect(Address.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Address added', address: mockAddress });
  });

  it('clears other defaults when isDefault is true', async () => {
    (Address.updateMany as jest.Mock).mockResolvedValue({});
    (Address.create as jest.Mock).mockResolvedValue({ ...mockAddress, isDefault: true });
    const res = mockRes();
    await addAddress(mockReq({ body: { street: '2 St', isDefault: true } }), res);
    expect(Address.updateMany).toHaveBeenCalledWith({ user: 'userId123' }, { isDefault: false });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('updateAddress', () => {
  it('throws 404 AppError when address not found', async () => {
    (Address.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(updateAddress(mockReq({ params: { id: 'x' }, body: { street: 'New St' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('updates address and returns it', async () => {
    (Address.findOne as jest.Mock).mockResolvedValue(mockAddress);
    (Address.updateMany as jest.Mock).mockResolvedValue({});
    const res = mockRes();
    await updateAddress(mockReq({ params: { id: 'addr1' }, body: { street: 'New St', isDefault: false } }), res);
    expect(mockAddress.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Address updated' }));
  });
});

describe('deleteAddress', () => {
  it('throws 404 AppError when address not found', async () => {
    (Address.findOneAndDelete as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(deleteAddress(mockReq({ params: { id: 'x' } }), res))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('deletes address', async () => {
    (Address.findOneAndDelete as jest.Mock).mockResolvedValue(mockAddress);
    const res = mockRes();
    await deleteAddress(mockReq({ params: { id: 'addr1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Address deleted' });
  });
});
