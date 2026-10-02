/**
 * Application level error. Anything thrown with this class is considered
 * expected and is rendered with its status code, error code and field errors.
 */
export class ApiError extends Error {
  // Carries the HTTP status, error code and per-field details for the response envelope.
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  // Builds a 400 response describing invalid client input.
  static badRequest(message, fields) {
    return new ApiError(400, 'VALIDATION_ERROR', message, fields);
  }

  // Builds a 404 response for a ticket that does not exist.
  static notFound(message = 'Ticket not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  // Builds a 500 response for unexpected server side failures.
  static internal(message = 'Something went wrong on our side') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}