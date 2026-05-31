import { protect, adminOnly } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

jest.mock('jsonwebtoken');
jest.mock('../../models/User', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

const mockReq = (overrides: any = {}): any => ({
  headers: {},
  user: undefined,
  ...overrides,
});

const mockRes = (): any => {
  const res: any = { statusCode: 200 };
  res.status = jest.fn().mockImplementation((c: number) => { res.statusCode = c; return res; });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('protect middleware', () => {
  const mockUser = { _id: 'user1', role: 'user', name: 'Alice' };

  it('returns 401 when Authorization header is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with Bearer', async () => {
    const req = mockReq({ headers: { authorization: 'Basic abc123' } });
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when jwt.verify throws', async () => {
    const req = mockReq({ headers: { authorization: 'Bearer bad.token' } });
    const res = mockRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, invalid token' });
  });

  it('returns 401 when user is not found in DB', async () => {
    const req = mockReq({ headers: { authorization: 'Bearer valid.token' } });
    const res = mockRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user1' });
    (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, user not found' });
  });

  it('sets req.user and calls next on valid token', async () => {
    const req = mockReq({ headers: { authorization: 'Bearer valid.token' } });
    const res = mockRes();
    const next = jest.fn();
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user1' });
    (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    await protect(req, res, next);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('adminOnly middleware', () => {
  it('returns 403 when req.user is missing', () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is not admin', () => {
    const req = mockReq({ user: { role: 'user' } });
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user is admin', () => {
    const req = mockReq({ user: { role: 'admin' } });
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
