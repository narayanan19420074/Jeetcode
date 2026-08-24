// express-mongo-sanitize reassigns `req.query`, which Express 5 made a
// read-only getter — that package throws on every request under Express 5.
// This does the same job (strip Mongo operator keys like `$where` or
// dotted paths from user input) by mutating each object's keys IN PLACE
// instead of replacing the object reference, which works under both
// Express 4 and 5.
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    const value = obj[key];
    if (value && typeof value === 'object') {
      sanitizeInPlace(value);
    }
  }
}

export function mongoSanitizeSafe(req, res, next) {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query); // mutated in place — never reassigned
  next();
}
