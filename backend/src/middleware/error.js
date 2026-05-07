export function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function globalErrorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    console.error("[error]", {
      message: err.message,
      stack: err.stack
    });
  }

  return res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(isProd ? {} : { stack: err.stack })
  });
}
