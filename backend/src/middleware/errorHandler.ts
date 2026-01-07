import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  statusCode: number;
  stack?: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: ErrorResponse = {
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500
  };

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode: error.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = {
      message: 'Resource not found',
      statusCode: 404
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} already exists`,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = {
      message: messages,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  // Multer file type error
  if (err.message && err.message.includes('Unsupported file type')) {
    error = {
      message: err.message,
      statusCode: 400
    };
  }

  // Bad request errors
  if (err.statusCode === 400) {
    error = {
      message: err.message || 'Bad request',
      statusCode: 400
    };
  }

  // Not found errors
  if (err.statusCode === 404) {
    error = {
      message: err.message || 'Resource not found',
      statusCode: 404
    };
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`,
    statusCode: 404
  });
};

export default errorHandler;
