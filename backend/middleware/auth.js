// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status}: ${message}`);

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

// Authentication middleware (placeholder)
export const authenticate = (req, res, next) => {
  // TODO: Implement authentication logic
  next();
};

export default errorHandler;
