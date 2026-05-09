import express, { Router, Request, Response } from 'express';
import Joi from 'joi';
import kycService from '@services/kyc';
import walletService from '@services/wallet';
import groupsService from '@services/groups';
import { trustScoreService, adminService } from '@services/trust-and-admin';
import notificationsService from '@services/notifications';
import authMiddleware from '@middleware/auth';
import { KhaliaError } from '@middleware/errorHandler';

const router = Router();

// Helper: Async handler wrapper
const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============ KYC ROUTES (T059-T063) ============

/**
 * POST /api/v1/kyc/verify-bvn
 * Initiate BVN verification
 */
router.post(
  '/kyc/verify-bvn',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      bvn: Joi.string().required().pattern(/^\d{11}$/),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await kycService.verifyBVN({
      userId: (req as any).user.id,
      bvn: value.bvn,
    });

    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/kyc/verify-biometric
 * Submit facial recognition for biometric verification
 */
router.post(
  '/kyc/verify-biometric',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      biometric_image_base64: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await kycService.verifyBiometric({
      userId: (req as any).user.id,
      biometricImageBase64: value.biometric_image_base64,
    });

    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/kyc/verify-bank
 * Verify bank account
 */
router.post(
  '/kyc/verify-bank',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      account_number: Joi.string().required(),
      account_name: Joi.string().required(),
      bank_code: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await kycService.verifyBankAccount({
      userId: (req as any).user.id,
      accountNumber: value.account_number,
      accountName: value.account_name,
      bankCode: value.bank_code,
    });

    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/kyc/status
 * Get KYC verification status
 */
router.get(
  '/kyc/status',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await kycService.getKYCStatus((req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

// ============ WALLET ROUTES (T070-T076) ============

/**
 * POST /api/v1/wallet/deposit
 * Create deposit/payment link
 */
router.post(
  '/wallet/deposit',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      amount_naira: Joi.number().required().min(1000),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await walletService.createDepositLink((req as any).user.id, value.amount_naira);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/wallet/webhook/deposit
 * Handle payment provider webhook
 */
router.post(
  '/wallet/webhook/deposit',
  asyncHandler(async (req: Request, res: Response) => {
    // Verify webhook signature (in production)
    const result = await walletService.handleDepositWebhook(req.body);
    res.json({ success: result.success });
  }),
);

/**
 * POST /api/v1/wallet/withdraw
 * Request withdrawal
 */
router.post(
  '/wallet/withdraw',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      amount_naira: Joi.number().required().min(100),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await walletService.requestWithdrawal((req as any).user.id, value.amount_naira);
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/wallet/balance
 * Get wallet balance
 */
router.get(
  '/wallet/balance',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await walletService.getWalletBalance((req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/wallet/transactions
 * List transactions
 */
router.get(
  '/wallet/transactions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;
    const result = await walletService.listTransactions(
      (req as any).user.id,
      parseInt(limit as string),
      parseInt(offset as string),
    );
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/wallet/transactions/:id
 * Get transaction details
 */
router.get(
  '/wallet/transactions/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await walletService.getTransactionDetails(req.params.id, (req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

// ============ GROUPS ROUTES (T077-T085) ============

/**
 * POST /api/v1/groups
 * Create group
 */
router.post(
  '/groups',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      name: Joi.string().required().min(3).max(100),
      description: Joi.string().required().max(500),
      contribution_amount_naira: Joi.number().required().min(1000),
      frequency: Joi.string().valid('weekly', 'biweekly', 'monthly').required(),
      max_members: Joi.number().required().min(3).max(100),
      payout_order: Joi.string().valid('round_robin', 'manual', 'need_based', 'lottery').required(),
      is_shariah_compliant: Joi.boolean().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await groupsService.createGroup((req as any).user.id, value);
    res.status(201).json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/groups/:id
 * Get group details
 */
router.get(
  '/groups/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.getGroupDetails(req.params.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/groups
 * List user's groups
 */
router.get(
  '/groups',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.listUserGroups((req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/groups/:id/join
 * Join group
 */
router.post(
  '/groups/:id/join',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.joinGroup((req as any).user.id, req.params.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/groups/:id/leave
 * Leave group
 */
router.post(
  '/groups/:id/leave',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.leaveGroup((req as any).user.id, req.params.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/groups/:id/start-cycle
 * Start contribution cycle
 */
router.post(
  '/groups/:id/start-cycle',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.startContributionCycle(req.params.id, (req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/groups/:id/contribute
 * Record contribution
 */
router.post(
  '/groups/:id/contribute',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      cycle_id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await groupsService.recordContribution((req as any).user.id, req.params.id, value.cycle_id);
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /api/v1/groups/:id/payout-info
 * Calculate next payout
 */
router.get(
  '/groups/:id/payout-info',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await groupsService.calculateNextPayout(req.params.id);
    res.json({ success: true, data: result });
  }),
);

// ============ TRUST SCORE ROUTES (T086-T087) ============

/**
 * GET /api/v1/trust-score
 * Get user's trust score
 */
router.get(
  '/trust-score',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await trustScoreService.getTrustScoreBreakdown((req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

// ============ NOTIFICATIONS ROUTES (T091-T094) ============

/**
 * GET /api/v1/notifications
 * Get user's notifications
 */
router.get(
  '/notifications',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;
    const result = await notificationsService.getUserNotifications(
      (req as any).user.id,
      parseInt(limit as string),
      parseInt(offset as string),
    );
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.post(
  '/notifications/:id/read',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAsRead(req.params.id, (req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.post(
  '/notifications/read-all',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAllAsRead((req as any).user.id);
    res.json({ success: true, data: result });
  }),
);

// ============ ADMIN ROUTES (T088-T090) ============

/**
 * GET /api/v1/admin/analytics
 * Get system analytics
 */
router.get(
  '/admin/analytics',
  authMiddleware,
  async (req: Request, res: Response, next: any) => {
    try {
      // Check if admin (middleware)
      if (!(req as any).user.is_admin) {
        throw new KhaliaError('Unauthorized', 403, 'FORBIDDEN');
      }

      const result = await adminService.getSystemAnalytics();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/v1/admin/users/:id/kyc
 * Manage user KYC status
 */
router.post(
  '/admin/users/:id/kyc',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!(req as any).user.is_admin) {
      throw new KhaliaError('Unauthorized', 403, 'FORBIDDEN');
    }

    const schema = Joi.object({
      action: Joi.string().valid('approve', 'reject', 'flag').required(),
      reason: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await adminService.manageUserKYC(req.params.id, value.action, value.reason);
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /api/v1/admin/payouts/:id
 * Manage payout status
 */
router.post(
  '/admin/payouts/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!(req as any).user.is_admin) {
      throw new KhaliaError('Unauthorized', 403, 'FORBIDDEN');
    }

    const schema = Joi.object({
      action: Joi.string().valid('approve', 'reject', 'release').required(),
      reason: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new KhaliaError(error.message, 400, 'VALIDATION_ERROR');

    const result = await adminService.managePayout(req.params.id, value.action, (req as any).user.id, value.reason);
    res.json({ success: true, data: result });
  }),
);

export default router;
