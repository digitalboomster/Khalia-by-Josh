import { Router, Request, Response } from 'express';
import Joi from 'joi';
import authService from '@services/auth';
import authMiddleware, { requireKycLevel } from '@middleware/auth';
import { asyncHandler, KhaliaError } from '@middleware/errorHandler';
import logger from '@config/logger';

interface RequestWithId extends Request {
  id?: string;
}

interface RequestWithUser extends Request {
  id?: string;
  user?: any;
}

const router = Router();

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone_number: Joi.string()
    .pattern(/^(\+234|0)[789]\d{9}$/)
    .required(),
  password: Joi.string().min(12).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

/**
 * Middleware for validation
 */
const validate = (schema: Joi.ObjectSchema) => {
  return (req: RequestWithId, res: Response, next: any) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return next(
        new KhaliaError(
          error.details[0].message,
          400,
          'VALIDATION_ERROR',
          { field: error.details[0].context?.key },
        ),
      );
    }

    req.body = value;
    next();
  };
};

/**
 * POST /auth/register
 * Register new user with email and password
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req: RequestWithId, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          kyc_status: result.kyc_status,
          kyc_level: result.kyc_level,
          trust_score: result.trust_score,
        },
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      requestId: req.id,
    });

    // Set HTTP-only refresh cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }),
);

/**
 * POST /auth/login
 * Authenticate user, return JWT tokens
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: RequestWithId, res: Response) => {
    const result = await authService.login(req.body);

    // Set HTTP-only refresh cookie BEFORE sending response
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          kyc_status: result.kyc_status,
          kyc_level: result.kyc_level,
          trust_score: result.trust_score,
        },
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      requestId: req.id,
    });
  }),
);

/**
 * POST /auth/refresh
 * Refresh expired access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req: RequestWithId, res: Response) => {
    const result = await authService.refreshAccessToken(req.body.refresh_token);

    res.status(200).json({
      success: true,
      data: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      requestId: req.id,
    });
  }),
);

/**
 * POST /auth/logout
 * Revoke tokens, clear session
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req: RequestWithUser, res: Response) => {
    // TODO: Add token to blacklist (Redis)
    // For now, just clear the cookie

    res.clearCookie('refresh_token');

    logger.info('User logged out', {
      userId: req.user?.id,
      requestId: req.id,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
      requestId: req.id,
    });
  }),
);

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: RequestWithUser, res: Response) => {
    res.status(200).json({
      success: true,
      data: req.user,
      requestId: req.id,
    });
  }),
);

export default router;
