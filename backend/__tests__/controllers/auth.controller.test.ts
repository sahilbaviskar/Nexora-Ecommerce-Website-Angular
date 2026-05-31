import { signup, login, getMe } from '../../controllers/auth.controller';
import User from '../../models/User';
import { AppError } from '../../utils/AppError';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
}));

jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockReq = (body: any = {}): any => ({ body });
const mockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('signup', () => {
  it('throws 409 AppError when email already exists', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ email: 'x@x.com' });
    const res = mockRes();
    await expect(signup(mockReq({ name: 'Bob', email: 'x@x.com', password: 'pass123' }), res))
      .rejects.toMatchObject({ statusCode: 409, message: 'User already exists' });
  });

  it('creates user and returns 201 with token', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const newUser = { _id: 'id1', name: 'Alice', email: 'alice@x.com', role: 'user' };
    (User.create as jest.Mock).mockResolvedValue(newUser);
    const res = mockRes();
    await signup(mockReq({ name: 'Alice', email: 'alice@x.com', password: 'pass123' }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mock-token', message: 'User created' }));
  });
});

describe('login', () => {
  it('throws 401 AppError when user is not found', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const res = mockRes();
    await expect(login(mockReq({ email: 'no@x.com', password: 'pass' }), res))
      .rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
  });

  it('throws 401 AppError when password is wrong', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });
    const res = mockRes();
    await expect(login(mockReq({ email: 'u@x.com', password: 'wrong' }), res))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns token on successful login', async () => {
    const user = { _id: 'id1', name: 'Alice', email: 'u@x.com', role: 'user', comparePassword: jest.fn().mockResolvedValue(true) };
    (User.findOne as jest.Mock).mockResolvedValue(user);
    const res = mockRes();
    await login(mockReq({ email: 'u@x.com', password: 'correct' }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mock-token', message: 'Login successful' }));
  });
});

describe('getMe', () => {
  it('returns the authenticated user', async () => {
    const user = { _id: 'id1', name: 'Alice' };
    const req: any = { user };
    const res = mockRes();
    await getMe(req, res);
    expect(res.json).toHaveBeenCalledWith({ user });
  });
});
