import { Request, Response, NextFunction } from 'express';
import logger from '@config/logger';

interface RequestWithId extends Request {
  id?: string;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handler middleware
 * Catches all errors and returns standardized response
 */
const errorHandlerMiddleware = (
  error: ApiError,
  req: RequestWithId,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  // Log error
  logger.error('API Error', {
    requestId: req.id,
    status,
    code,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    details: error.details,
  });

  // Send error response
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: error.details || {},
    },
    requestId: req.id,
  });
};

/**
 * Async error wrapper
 * Use this to wrap async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom API error class
 */
export class KhaliaError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(message: string, status: number = 500, code: string = 'ERROR', details?: any) {
    super(message);
    this.name = 'KhaliaError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default errorHandlerMiddleware;
