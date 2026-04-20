import { Request, Response, NextFunction } from 'express';
import logger from '@config/logger';

interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

/**
 * Request logging middleware
 * Logs incoming requests and outgoing responses
 */
const requestLoggingMiddleware = (req: RequestWithId, res: Response, next: NextFunction) => {
  // Record start time
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalJson = res.json;
  res.json = function (data: any) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;

    // Log outgoing response
    logger.info('Outgoing response', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      success: res.statusCode >= 200 && res.statusCode < 300,
    });

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
};

export default requestLoggingMiddleware;
