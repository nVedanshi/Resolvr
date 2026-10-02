// Returns the standard 404 envelope for any route the API does not expose.
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `No route matches ${req.method} ${req.originalUrl}`,
      fields: {},
    },
  });
}