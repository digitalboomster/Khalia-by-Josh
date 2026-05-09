import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '@config/logger';
import { KhaliaError } from './errorHandler.js';

interface RequestWithUser extends Request {
  user?: any;
  id?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  kyc_level: number;
  iat: number;
  exp: number;
}

/**
 * JWT Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header or cookies
    let token: string | null = null;

    // Check Authorization header
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check HTTP-only cookie
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new KhaliaError('Missing authentication token', 401, 'AUTH_REQUIRED');
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      kyc_level: decoded.kyc_level,
    };

    logger.debug('User authenticated', {
      requestId: req.id,
      userId: decoded.userId,
      email: decoded.email,
    });

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired', { requestId: req.id });
      return next(new KhaliaError('Token expired', 401, 'TOKEN_EXPIRED'));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT verification failed', { requestId: req.id, error: error.message });
      return next(new KhaliaError('Invalid token', 401, 'INVALID_TOKEN'));
    }

    if (error instanceof KhaliaError) {
      return next(error);
    }

    logger.error('Authentication error', { requestId: req.id, error });
    return next(new KhaliaError('Authentication failed', 401, 'AUTH_ERROR'));
  }
};

/**
 * Role-based access control middleware
 */
export const requireKycLevel = (minLevel: number) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new KhaliaError('User not authenticated', 401, 'AUTH_REQUIRED'));
    }

    if ((req.user.kyc_level || 0) < minLevel) {
      return next(
        new KhaliaError(
          `Requires KYC level ${minLevel}`,
          403,
          'INSUFFICIENT_KYC',
          { required: minLevel, current: req.user.kyc_level },
        ),
      );
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new KhaliaError('User not authenticated', 401, 'AUTH_REQUIRED'));
  }

  // TODO: Check if user has admin role from database
  if (!req.user.is_admin) {
    return next(new KhaliaError('Admin access required', 403, 'INSUFFICIENT_PERMISSIONS'));
  }

  next();
};

export default authMiddleware;
