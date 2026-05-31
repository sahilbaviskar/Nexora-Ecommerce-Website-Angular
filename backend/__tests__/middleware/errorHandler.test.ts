import { notFound, errorHandler } from '../../middleware/errorHandler';

const mockReq = (url = '/api/test'): any => ({ originalUrl: url });

const mockRes = (): any => {
  const res: any = { statusCode: 200 };
  res.status = jest.fn().mockImplementation((c: number) => { res.statusCode = c; return res; });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('notFound middleware', () => {
  it('responds with 404 and route message', () => {
    const req = mockReq('/api/missing');
    const res = mockRes();
    notFound(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Route not found: /api/missing' });
  });
});

describe('errorHandler middleware', () => {
  const next = jest.fn();

  it('uses 500 when res.statusCode is 200', () => {
    const res = mockRes();
    res.statusCode = 200;
    errorHandler(new Error('Oops'), mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
  });

  it('preserves existing non-200 status code', () => {
    const res = mockRes();
    res.statusCode = 422;
    errorHandler(new Error('Unprocessable'), mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('hides stack in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    const err: any = new Error('Prod err');
    err.stack = 'stack trace here';
    errorHandler(err, mockReq(), res, next);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.stack).toBeUndefined();
    process.env.NODE_ENV = originalEnv;
  });

  it('includes stack in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const res = mockRes();
    const err: any = new Error('Dev err');
    err.stack = 'stack trace here';
    errorHandler(err, mockReq(), res, next);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.stack).toBe('stack trace here');
    process.env.NODE_ENV = originalEnv;
  });

  it('uses "Internal server error" when err.message is missing', () => {
    const res = mockRes();
    errorHandler({}, mockReq(), res, next);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Internal server error');
  });
});
