import { ApiError } from '../utils/ApiError.js';

// Wraps a zod schema as Express middleware. Validates + coerces (e.g.
// query string "2" -> number 2) and replaces req[target] with the parsed,
// typed result — so controllers never re-validate or guess types.
//
// Express 5 made `req.query` a read-only getter (no more direct
// reassignment), so for query we mutate the existing object's keys in
// place instead of replacing the reference. body/params are still safely
// reassignable.
export const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors);
  }

  if (target === 'query') {
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, result.data);
  } else {
    req[target] = result.data;
  }
  next();
};
