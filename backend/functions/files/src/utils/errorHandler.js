// backend/functions/files/src/utils/errorHandler.js
// Centralized Error Handling Middleware for AstroAI Backend

const logger = require('./logger');

/**
 * Custom Error Class for Application Errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Handler Middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error
  logger.logError(err, req);

  // Default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || 'INTERNAL_ERROR';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
    code = 'RESOURCE_NOT_FOUND';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
    code = 'DUPLICATE_VALUE';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation Error: ${errors.join(', ')}`;
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again';
    statusCode = 401;
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired. Please log in again';
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
  }

  // Sequelize errors (PostgreSQL)
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    message = `Validation Error: ${errors.join(', ')}`;
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    message = 'Duplicate field value entered';
    statusCode = 400;
    code = 'DUPLICATE_VALUE';
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    message = 'Foreign key constraint error';
    statusCode = 400;
    code = 'FOREIGN_KEY_ERROR';
  }

  // Firebase errors
  if (err.code?.startsWith('auth/')) {
    statusCode = 401;
    code = 'AUTH_ERROR';
    
    switch (err.code) {
      case 'auth/invalid-credential':
        message = 'Invalid credentials';
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-exists':
        message = 'Email already registered';
        statusCode = 400;
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        statusCode = 400;
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        statusCode = 400;
        break;
      default:
        message = 'Authentication error';
    }
  }

  // Rate limit errors
  if (err.name === 'RateLimitError') {
    message = 'Too many requests. Please try again later';
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
    },
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = err;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async Handler Wrapper
 * Eliminates need for try-catch in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * For undefined routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Validation Error Helper
 */
const validationError = (errors) => {
  const message = errors.map((err) => err.message).join(', ');
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Unauthorized Error Helper
 */
const unauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden Error Helper
 */
const forbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Not Found Error Helper
 */
const notFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Conflict Error Helper
 */
const conflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409, 'CONFLICT');
};

/**
 * Bad Request Error Helper
 */
const badRequestError = (message = 'Bad request') => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

/**
 * Internal Server Error Helper
 */
const internalError = (message = 'Internal server error') => {
  return new AppError(message, 500, 'INTERNAL_ERROR');
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound,
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  badRequestError,
  internalError,
};