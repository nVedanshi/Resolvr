/**
 * Express 4 does not forward rejected promises to the error handler, so every
 * async controller is wrapped once here instead of repeating try/catch.
 */
export function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}