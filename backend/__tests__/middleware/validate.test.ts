import { validate } from '../../middleware/validate';
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().min(2).required(),
  age: Joi.number().optional(),
});

const makeReqResNext = (body: any = {}, query: any = {}) => {
  const req: any = { body, params: {}, query };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('validate middleware', () => {
  it('calls next when body is valid', () => {
    const { req, res, next } = makeReqResNext({ name: 'Alice' });
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with errors when body is invalid', () => {
    const { req, res, next } = makeReqResNext({ name: 'A' }); // too short
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Validation failed', errors: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('strips unknown fields from body', () => {
    const { req, res, next } = makeReqResNext({ name: 'Alice', extra: 'field' });
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.extra).toBeUndefined();
    expect(req.body.name).toBe('Alice');
  });

  it('validates against query when target is "query"', () => {
    const { req, res, next } = makeReqResNext({}, { name: 'A' }); // too short
    validate(schema, 'query')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes valid query params', () => {
    const { req, res, next } = makeReqResNext({}, { name: 'Alice' });
    validate(schema, 'query')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
