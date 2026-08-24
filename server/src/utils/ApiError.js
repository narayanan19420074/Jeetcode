// Central error type — every intentional failure in the app throws this,
// so the error middleware can format one consistent JSON shape for every
// route instead of each controller inventing its own error response.
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distinguishes "expected" errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden') { return new ApiError(403, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
  // 402, distinct from 403 forbidden — this is "pay to unlock", not a
  // role/permission failure. Lets the frontend distinguish "you can never
  // do this" from "you could do this if you upgraded" and route
  // accordingly (e.g. redirect to /pricing instead of showing a dead end).
  static paymentRequired(msg = 'Pro subscription required') { return new ApiError(402, msg); }
  static tooMany(msg = 'Too many requests') { return new ApiError(429, msg); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}
