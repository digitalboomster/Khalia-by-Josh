import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';

class TrustScoreService {
  /**
   * Calculate trust score (T086-T087)
   * Based on: contributions made, on-time payments, group participation
   */
  async calculateTrustScore(userId: string): Promise<number> {
    try {
      // Get payment history
      const contributions = await database.query(
        `SELECT 
          COUNT(*) as total_contributions,
          SUM(CASE WHEN paid_at <= due_date THEN 1 ELSE 0 END) as on_time_contributions,
          SUM(CASE WHEN paid_at > due_date THEN 1 ELSE 0 END) as late_contributions
        FROM contributions
        WHERE user_id = $1`,
        [userId],
      );

      const stats = contributions.rows[0];

      if (stats.total_contributions === 0) {
        // New user starts at 20%
        return 20;
      }

      const onTimeRate = stats.on_time_contributions / stats.total_contributions;
      const lateRate = stats.late_contributions / stats.total_contributions;

      // Base trust score: 20-100
      let score = 20;

      // Add points for on-time payments (up to 50)
      score += onTimeRate * 50;

      // Deduct points for late payments (up to 30)
      score -= lateRate * 30;

      // Get group participation bonus (up to 15)
      const groups = await database.query(
        `SELECT COUNT(*) as group_count FROM group_members WHERE user_id = $1`,
        [userId],
      );

      if (groups.rows[0].group_count >= 3) {
        score += 15;
      } else {
        score += groups.rows[0].group_count * 5;
      }

      // Get dispute/refund history (deduct if any)
      const disputes = await database.query(
        `SELECT COUNT(*) as dispute_count FROM disputes WHERE user_id = $1 AND status != $2`,
        [userId, 'resolved_favorable'],
      );

      score -= disputes.rows[0].dispute_count * 5;

      // Ensure score stays in 20-100 range
      score = Math.max(20, Math.min(100, Math.round(score)));

      return score;
    } catch (error: any) {
      logger.error('Trust score calculation error', { error, userId });
      throw new KhaliaError('Failed to calculate trust score', 500, 'TRUST_SCORE_ERROR');
    }
  }

  /**
   * Update user trust score
   */
  async updateTrustScore(userId: string): Promise<number> {
    try {
      const score = await this.calculateTrustScore(userId);

      await database.query(
        `UPDATE users SET trust_score = $1, updated_at = NOW() WHERE id = $2`,
        [score, userId],
      );

      logger.info('Trust score updated', { userId, score });

      return score;
    } catch (error: any) {
      logger.error('Trust score update error', { error, userId });
      throw error;
    }
  }

  /**
   * Get trust score breakdown
   */
  async getTrustScoreBreakdown(userId: string): Promise<any> {
    try {
      const user = await database.query(`SELECT trust_score FROM users WHERE id = $1`, [userId]);

      if (user.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      const contributions = await database.query(
        `SELECT 
          COUNT(*) as total_contributions,
          SUM(CASE WHEN paid_at <= due_date THEN 1 ELSE 0 END) as on_time,
          SUM(CASE WHEN paid_at > due_date THEN 1 ELSE 0 END) as late
        FROM contributions WHERE user_id = $1`,
        [userId],
      );

      const groups = await database.query(
        `SELECT COUNT(*) as group_count FROM group_members WHERE user_id = $1`,
        [userId],
      );

      return {
        overall_score: user.rows[0].trust_score,
        factors: {
          contributions: {
            total: contributions.rows[0].total_contributions,
            on_time: contributions.rows[0].on_time || 0,
            late: contributions.rows[0].late || 0,
          },
          group_participation: groups.rows[0].group_count,
        },
        score_range: '20-100',
        risk_level: this.calculateRiskLevel(user.rows[0].trust_score),
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Trust breakdown error', { error, userId });
      throw new KhaliaError('Failed to fetch trust score breakdown', 500, 'BREAKDOWN_ERROR');
    }
  }

  /**
   * Map score to risk level
   */
  private calculateRiskLevel(score: number): string {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'very_high';
  }
}

class AdminService {
  /**
   * Get system analytics (T088)
   */
  async getSystemAnalytics(): Promise<any> {
    try {
      // User statistics
      const users = await database.query(
        `SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN kyc_level >= 5 THEN 1 ELSE 0 END) as fully_verified,
          SUM(CASE WHEN aml_risk_level = 'high' THEN 1 ELSE 0 END) as high_risk_users
        FROM users`,
      );

      // Group statistics
      const groups = await database.query(
        `SELECT 
          COUNT(*) as total_groups,
          COUNT(DISTINCT creator_id) as active_creators,
          AVG(max_members) as avg_group_size
        FROM groups WHERE status = 'active'`,
      );

      // Financial statistics
      const financials = await database.query(
        `SELECT 
          SUM(amount_naira) as total_volume,
          COUNT(*) as transaction_count,
          AVG(amount_naira) as avg_transaction
        FROM transactions WHERE status = 'completed'`,
      );

      return {
        users: users.rows[0],
        groups: groups.rows[0],
        financials: financials.rows[0],
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Analytics error', { error });
      throw new KhaliaError('Failed to fetch analytics', 500, 'ANALYTICS_ERROR');
    }
  }

  /**
   * Manage users (approve/reject/flag) (T089)
   */
  async manageUserKYC(userId: string, action: 'approve' | 'reject' | 'flag', reason?: string): Promise<any> {
    try {
      const user = await database.query(`SELECT * FROM users WHERE id = $1`, [userId]);

      if (user.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      let newStatus = 'pending';
      if (action === 'approve') {
        newStatus = 'approved';
      } else if (action === 'reject') {
        newStatus = 'rejected';
      } else if (action === 'flag') {
        newStatus = 'flagged';
      }

      await database.query(
        `UPDATE users SET 
          kyc_status = $1, 
          aml_risk_level = CASE WHEN $2 = 'flag' THEN 'high' ELSE aml_risk_level END,
          updated_at = NOW()
        WHERE id = $3`,
        [newStatus, action, userId],
      );

      // Record audit
      await database.query(
        `INSERT INTO audit_logs (action, actor_type, resource_type, resource_id, description, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        ['kyc_' + action, 'admin', 'user', userId, reason || ''],
      );

      logger.info('User KYC managed', { userId, action, reason });

      return {
        user_id: userId,
        action,
        new_status: newStatus,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('KYC management error', { error, userId });
      throw new KhaliaError('Failed to manage user KYC', 500, 'MANAGEMENT_ERROR');
    }
  }

  /**
   * Approve/reject payouts (T090)
   */
  async managePayout(
    payoutId: string,
    action: 'approve' | 'reject' | 'release',
    adminId: string,
    reason?: string,
  ): Promise<any> {
    try {
      const payout = await database.query(`SELECT * FROM payouts WHERE id = $1`, [payoutId]);

      if (payout.rows.length === 0) {
        throw new KhaliaError('Payout not found', 404, 'NOT_FOUND');
      }

      let newStatus = 'pending';
      if (action === 'approve') {
        newStatus = 'approved';
      } else if (action === 'reject') {
        newStatus = 'rejected';
      } else if (action === 'release') {
        newStatus = 'released';
      }

      await database.query(
        `UPDATE payouts SET 
          status = $1, 
          approved_by = $2, 
          approved_at = NOW()
        WHERE id = $3`,
        [newStatus, adminId, payoutId],
      );

      logger.info('Payout managed', { payoutId, action, adminId });

      return {
        payout_id: payoutId,
        action,
        new_status: newStatus,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Payout management error', { error, payoutId });
      throw new KhaliaError('Failed to manage payout', 500, 'PAYOUT_ERROR');
    }
  }
}

export { TrustScoreService, AdminService };
export const trustScoreService = new TrustScoreService();
export const adminService = new AdminService();
