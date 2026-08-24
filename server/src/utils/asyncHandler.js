// Wraps async controllers so a rejected promise reaches Express's error
// handler instead of crashing the process or hanging the request. Avoids
// try/catch boilerplate in every single controller.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
