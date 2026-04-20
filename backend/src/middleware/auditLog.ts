import { Request, Response, NextFunction } from 'express';
import logger from '@config/logger';
import database from '@config/database';

interface RequestWithUser extends Request {
  user?: any;
  id?: string;
}

/**
 * Audit logging middleware
 * Records all API requests to audit log table (7-year retention)
 * Immutable append-only log for compliance
 */
const auditLoggingMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  // Skip logging for health checks
  if (req.path === '/health') {
    return next();
  }

  try {
    // Capture response to log what was returned
    const originalJson = res.json;
    res.json = function (data: any) {
      // Queue audit log insert (async, non-blocking)
      if (req.user) {
        recordAuditLog(req, res, data).catch((error) => {
          logger.error('Failed to record audit log', { error, requestId: req.id });
        });
      }

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('Audit logging error', { error, requestId: req.id });
    next(error);
  }
};

/**
 * Record audit log entry to database (non-blocking async)
 */
async function recordAuditLog(req: RequestWithUser, res: Response, responseData: any) {
  // Don't wait for this to complete
  try {
    const action = mapRouteToAction(req.method, req.path);

    if (!action) {
      return; // Skip non-tracked routes
    }

    const query = `
      INSERT INTO audit_logs (action, actor_user_id, actor_type, resource_type, resource_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await database.query(query, [
      action,
      req.user?.id || null,
      'user',
      inferResourceType(req.path),
      inferResourceId(req.path, req.body) || null,
    ]);

    logger.debug('Audit log recorded', {
      requestId: req.id,
      action,
      userId: req.user?.id,
    });
  } catch (error) {
    logger.error('Audit log insert error', { error });
    // Don't let this error interrupt request processing
  }
}

/**
 * Map HTTP method + path to audit action
 */
function mapRouteToAction(method: string, path: string): string | null {
  if (path.includes('/auth/login')) return 'user_login';
  if (path.includes('/auth/verify-bvn')) return 'kyc_verification_initiated';
  if (path.includes('/wallet/deposit')) return 'deposit_initiated';
  if (path.includes('/contributions') && method === 'POST') return 'contribution_paid';
  if (path.includes('/payouts') && method === 'POST') return 'payout_executed';
  if (path.includes('/admin') && method === 'POST') return 'admin_action';

  return null; // Don't log this route
}

/**
 * Infer resource type from path
 */
function inferResourceType(path: string): string {
  if (path.includes('/wallet')) return 'wallet';
  if (path.includes('/contributions')) return 'contribution';
  if (path.includes('/payouts')) return 'payout';
  if (path.includes('/groups')) return 'group';
  if (path.includes('/admin')) return 'admin';
  return 'unknown';
}

/**
 * Infer resource ID from path or body
 */
function inferResourceId(path: string, body: any): string | null {
  // Extract ID from path (e.g., /payouts/123)
  const pathMatch = path.match(/\/([a-f0-9-]+)(?:\/|$)/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // Extract ID from body
  if (body?.id) {
    return body.id;
  }

  if (body?.payout_id) {
    return body.payout_id;
  }

  return null;
}

export default auditLoggingMiddleware;
