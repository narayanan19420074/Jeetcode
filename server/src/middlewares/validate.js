import { ApiError } from '../utils/ApiError.js';

// Wraps a zod schema as Express middleware. Validates + coerces (e.g.
// query string "2" -> number 2) and replaces req[target] with the parsed,
// typed result — so controllers never re-validate or guess types.
//
// Express 5's req.query is a GETTER that re-parses the raw query string
// from scratch on every single access — it is not cached on the request.
// That means mutating the object returned by one `req.query` access (e.g.
// deleting keys, Object.assign) has no effect on the NEXT access, which
// triggers the getter again and returns a brand-new object parsed fresh
// from the URL — silently discarding any correction we made (this is
// exactly why `limit` was arriving at the controller as the string "20"
// instead of the coerced number 20, crashing MongoDB's $limit stage).
//
// Fix: shadow the prototype's getter with an own, writable, PLAIN DATA
// property on this specific `req` object. Own properties take precedence
// over inherited getters, so every later `req.query` read on this same
// request returns our coerced data instead of re-triggering the parser.
// This only affects this one request — the shared getter on Express's
// request prototype is untouched, so every other request still parses
// normally.
export const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors);
  }

  if (target === 'query') {
    Object.defineProperty(req, 'query', {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } else {
    req[target] = result.data;
  }
  next();
};
