import { ZodError } from 'zod';
import { ApiError } from '../lib/ApiError.js';

// Returns the first validation message per field for the error response envelope.
function collectFieldErrors(error) {
  const fields = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }

  return fields;
}

/**
 * Single place where every error becomes the same JSON envelope:
 * { success: false, error: { code, message, fields } }
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid ticket data',
        fields: collectFieldErrors(error),
      },
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fields: error.fields ?? {},
      },
    });
  }

  if (error?.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found', fields: {} },
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON', fields: {} },
    });
  }

  console.error('[api] unhandled error', error);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side',
      fields: {},
    },
  });
}