import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';
import ledgerService from './ledger.js';
import { v4 as uuidv4 } from 'uuid';

interface GroupCreationPayload {
  name: string;
  description: string;
  contribution_amount_naira: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  max_members: number;
  payout_order: 'round_robin' | 'manual' | 'need_based' | 'lottery';
  is_shariah_compliant: boolean;
}

class GroupsService {
  /**
   * Create group (T077)
   */
  async createGroup(creatorId: string, payload: GroupCreationPayload): Promise<any> {
    // Validate inputs
    if (!payload.name || payload.name.length < 3 || payload.name.length > 100) {
      throw new KhaliaError('Group name must be 3-100 characters', 400, 'VALIDATION_ERROR');
    }

    if (payload.contribution_amount_naira < 1000 || payload.contribution_amount_naira > 1000000) {
      throw new KhaliaError('Contribution amount must be ₦1,000 - ₦1,000,000', 400, 'VALIDATION_ERROR');
    }

    if (payload.max_members < 3 || payload.max_members > 100) {
      throw new KhaliaError('Group must have 3-100 members', 400, 'VALIDATION_ERROR');
    }

    try {
      const groupId = uuidv4();
      const now = new Date();

      // Create group
      await database.query(
        `INSERT INTO groups (
          id, creator_id, name, description, 
          contribution_amount_naira, frequency, max_members, 
          payout_order, is_shariah_compliant, 
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          groupId,
          creatorId,
          payload.name,
          payload.description,
          payload.contribution_amount_naira,
          payload.frequency,
          payload.max_members,
          payload.payout_order,
          payload.is_shariah_compliant,
          'active',
          now,
        ],
      );

      // Add creator as member with admin role
      await database.query(
        `INSERT INTO group_members (group_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, $4)`,
        [groupId, creatorId, 'creator', now],
      );

      logger.info('Group created', { groupId, creatorId, groupName: payload.name });

      return {
        group_id: groupId,
        name: payload.name,
        status: 'active',
        members: 1,
        member_role: 'creator',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Group creation failed', { error, creatorId });
      throw new KhaliaError('Failed to create group', 500, 'GROUP_ERROR');
    }
  }

  /**
   * Get group details (T078)
   */
  async getGroupDetails(groupId: string): Promise<any> {
    try {
      const groupResult = await database.query(`SELECT * FROM groups WHERE id = $1`, [groupId]);

      if (groupResult.rows.length === 0) {
        throw new KhaliaError('Group not found', 404, 'NOT_FOUND');
      }

      const group = groupResult.rows[0];

      // Get members
      const membersResult = await database.query(
        `SELECT u.id, u.first_name, u.last_name, gm.role, gm.individual_trust_score FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at ASC`,
        [groupId],
      );

      // Get pending contributions for current cycle
      const contributionsResult = await database.query(
        `SELECT status, COUNT(*) as count FROM contributions
         WHERE group_id = $1 AND cycle = (SELECT MAX(cycle) FROM contributions WHERE group_id = $2)
         GROUP BY status`,
        [groupId, groupId],
      );

      return {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          contribution_amount_naira: group.contribution_amount_naira,
          frequency: group.frequency,
          max_members: group.max_members,
          current_members: membersResult.rows.length,
          payout_order: group.payout_order,
          is_shariah_compliant: group.is_shariah_compliant,
          status: group.status,
          created_at: group.created_at,
        },
        members: membersResult.rows,
        contributions: contributionsResult.rows,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Group details error', { error, groupId });
      throw new KhaliaError('Failed to fetch group details', 500, 'GROUP_ERROR');
    }
  }

  /**
   * Join group (T079)
   */
  async joinGroup(userId: string, groupId: string): Promise<any> {
    try {
      // Verify group exists
      const group = await database.query(`SELECT * FROM groups WHERE id = $1`, [groupId]);

      if (group.rows.length === 0) {
        throw new KhaliaError('Group not found', 404, 'NOT_FOUND');
      }

      // Check member count
      const memberCount = await database.query(
        `SELECT COUNT(*) as count FROM group_members WHERE group_id = $1`,
        [groupId],
      );

      if (memberCount.rows[0].count >= group.rows[0].max_members) {
        throw new KhaliaError('Group is full', 400, 'GROUP_FULL');
      }

      // Check if already member
      const existing = await database.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId],
      );

      if (existing.rows.length > 0) {
        throw new KhaliaError('Already a member of this group', 400, 'ALREADY_MEMBER');
      }

      // Add as member
      await database.query(
        `INSERT INTO group_members (group_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, NOW())`,
        [groupId, userId, 'member'],
      );

      logger.info('User joined group', { userId, groupId });

      return {
        success: true,
        group_id: groupId,
        role: 'member',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Join group error', { error, userId, groupId });
      throw new KhaliaError('Failed to join group', 500, 'JOIN_ERROR');
    }
  }

  /**
   * List user groups (T080)
   */
  async listUserGroups(userId: string): Promise<any> {
    try {
      const result = await database.query(
        `SELECT g.*, gm.role, 
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM groups g
         JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = $1
         ORDER BY g.created_at DESC`,
        [userId],
      );

      return {
        groups: result.rows,
        count: result.rows.length,
      };
    } catch (error: any) {
      logger.error('List groups error', { error, userId });
      throw new KhaliaError('Failed to list groups', 500, 'LIST_ERROR');
    }
  }

  /**
   * Start contribution cycle (T081)
   */
  async startContributionCycle(groupId: string, creatorId: string): Promise<any> {
    try {
      // Verify creator
      const creator = await database.query(
        `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3`,
        [groupId, creatorId, 'creator'],
      );

      if (creator.rows.length === 0) {
        throw new KhaliaError('Only creator can start cycles', 403, 'FORBIDDEN');
      }

      const cycleId = uuidv4();
      const now = new Date();

      // Get group details
      const group = await database.query(`SELECT * FROM groups WHERE id = $1`, [groupId]);
      const groupData = group.rows[0];

      // Calculate next due date based on frequency
      const dueDate = this.calculateNextDueDate(now, groupData.frequency);

      // Create cycle
      await database.query(
        `INSERT INTO contribution_cycles (id, group_id, cycle_number, status, due_date, created_at)
         VALUES ($1, $2, (SELECT COALESCE(MAX(cycle_number), 0) + 1 FROM contribution_cycles WHERE group_id = $2), $3, $4, $5)`,
        [cycleId, groupId, 'active', dueDate, now],
      );

      // Create contributions for each member
      const members = await database.query(
        `SELECT user_id FROM group_members WHERE group_id = $1`,
        [groupId],
      );

      for (const member of members.rows) {
        await database.query(
          `INSERT INTO contributions (id, group_id, user_id, cycle_id, amount_naira, due_date, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [uuidv4(), groupId, member.user_id, cycleId, groupData.contribution_amount_naira, dueDate, 'pending'],
        );
      }

      logger.info('Contribution cycle started', { groupId, cycleId });

      return {
        cycle_id: cycleId,
        status: 'active',
        due_date: dueDate,
        members_count: members.rows.length,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Cycle start error', { error, groupId });
      throw new KhaliaError('Failed to start contribution cycle', 500, 'CYCLE_ERROR');
    }
  }

  /**
   * Record contribution payment (T082)
   */
  async recordContribution(userId: string, groupId: string, cycleId: string): Promise<any> {
    try {
      // Get contribution record
      const contribution = await database.query(
        `SELECT * FROM contributions WHERE group_id = $1 AND user_id = $2 AND cycle_id = $3`,
        [groupId, userId, cycleId],
      );

      if (contribution.rows.length === 0) {
        throw new KhaliaError('Contribution not found', 404, 'NOT_FOUND');
      }

      const contrib = contribution.rows[0];

      // Check balance
      const wallet = await database.query(
        `SELECT COALESCE(
          (SELECT SUM(amount_naira) FROM ledger_entries 
           WHERE user_id = $1 AND account_type = 'wallet' AND debit_credit_type = 'debit') -
          (SELECT SUM(amount_naira) FROM ledger_entries 
           WHERE user_id = $1 AND account_type = 'wallet' AND debit_credit_type = 'credit')
        , 0) as balance`,
        [userId],
      );

      if (parseFloat(wallet.rows[0].balance) < contrib.amount_naira) {
        throw new KhaliaError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      const transactionId = uuidv4();

      // Record ledger transaction
      await ledgerService.recordTransaction(
        {
          debitCreditType: 'debit',
          accountType: 'wallet',
          amount: contrib.amount_naira,
          userId,
          description: `Contribution to ${groupId}`,
        },
        {
          debitCreditType: 'credit',
          accountType: 'group_holding',
          amount: contrib.amount_naira,
          groupId,
          description: `Contribution from ${userId}`,
        },
        transactionId,
      );

      // Mark contribution as paid
      await database.query(
        `UPDATE contributions SET status = $1, paid_at = NOW() WHERE id = $2`,
        ['paid', contrib.id],
      );

      logger.info('Contribution recorded', { userId, groupId, amount: contrib.amount_naira });

      return {
        contribution_id: contrib.id,
        amount: contrib.amount_naira,
        status: 'paid',
        transaction_id: transactionId,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Contribution record error', { error, userId, groupId });
      throw new KhaliaError('Failed to record contribution', 500, 'CONTRIBUTION_ERROR');
    }
  }

  /**
   * Calculate next payout (T083)
   */
  async calculateNextPayout(groupId: string): Promise<any> {
    try {
      // Get group details
      const group = await database.query(`SELECT * FROM groups WHERE id = $1`, [groupId]);
      const groupData = group.rows[0];

      // Get all contributions for current cycle
      const contributions = await database.query(
        `SELECT u.id, u.first_name, u.last_name, COUNT(*) as paid_contributions
         FROM contributions c
         JOIN users u ON c.user_id = u.id
         WHERE c.group_id = $1 AND c.status = 'paid'
         GROUP BY u.id, u.first_name, u.last_name`,
        [groupId],
      );

      // Determine recipient based on payout order
      let recipient = null;
      if (groupData.payout_order === 'round_robin') {
        // Get next member in rotation
        recipient = await this.getNextPayoutRecipient(groupId, 'round_robin');
      } else if (groupData.payout_order === 'lottery') {
        // Random selection
        recipient = contributions.rows[Math.floor(Math.random() * contributions.rows.length)];
      } else if (groupData.payout_order === 'need_based') {
        // Select member with lowest balance
        recipient = await this.getLowBalanceMember(groupId);
      }

      return {
        group_id: groupId,
        total_collected: contributions.rows.length * groupData.contribution_amount_naira,
        recipients_count: contributions.rows.length,
        suggested_recipient: recipient,
        payout_order: groupData.payout_order,
      };
    } catch (error: any) {
      logger.error('Payout calculation error', { error, groupId });
      throw new KhaliaError('Failed to calculate payout', 500, 'PAYOUT_ERROR');
    }
  }

  /**
   * Process payout (T084)
   */
  async processPayout(groupId: string, recipientId: string, creatorId: string): Promise<any> {
    try {
      // Verify creator
      const creator = await database.query(
        `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND (role = $3 OR role = $4)`,
        [groupId, creatorId, 'creator', 'admin'],
      );

      if (creator.rows.length === 0) {
        throw new KhaliaError('Unauthorized', 403, 'FORBIDDEN');
      }

      // Get group and cycle
      const group = await database.query(`SELECT * FROM groups WHERE id = $1`, [groupId]);
      const groupData = group.rows[0];

      const cycle = await database.query(
        `SELECT id FROM contribution_cycles WHERE group_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [groupId],
      );

      const payoutId = uuidv4();

      // Create payout record
      await database.query(
        `INSERT INTO payouts (id, group_id, recipient_id, cycle_id, amount_naira, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [payoutId, groupId, recipientId, cycle.rows[0].id, groupData.contribution_amount_naira * 2, 'pending'], // 2x members = total collection
      );

      logger.info('Payout processed', { payoutId, groupId, recipientId });

      return {
        payout_id: payoutId,
        recipient_id: recipientId,
        amount: groupData.contribution_amount_naira * 2,
        status: 'pending',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Payout processing error', { error, groupId });
      throw new KhaliaError('Failed to process payout', 500, 'PAYOUT_ERROR');
    }
  }

  /**
   * Leave group (T085)
   */
  async leaveGroup(userId: string, groupId: string): Promise<any> {
    try {
      // Check if member
      const member = await database.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId],
      );

      if (member.rows.length === 0) {
        throw new KhaliaError('Not a member of this group', 400, 'NOT_MEMBER');
      }

      // Check active cycles
      const activeCycles = await database.query(
        `SELECT COUNT(*) as count FROM contributions 
         WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,
        [groupId, userId],
      );

      if (activeCycles.rows[0].count > 0) {
        throw new KhaliaError('Cannot leave group with pending contributions', 400, 'PENDING_CONTRIBUTIONS');
      }

      // Remove from group
      await database.query(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [groupId, userId]);

      logger.info('User left group', { userId, groupId });

      return {
        success: true,
        group_id: groupId,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Leave group error', { error, userId, groupId });
      throw new KhaliaError('Failed to leave group', 500, 'LEAVE_ERROR');
    }
  }

  /**
   * Helper: Calculate next due date based on frequency
   */
  private calculateNextDueDate(fromDate: Date, frequency: string): Date {
    const next = new Date(fromDate);
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }

  /**
   * Helper: Get next payout recipient (round robin)
   */
  private async getNextPayoutRecipient(groupId: string, strategy: string): Promise<any> {
    const result = await database.query(
      `SELECT u.id, u.first_name, u.last_name FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC
       LIMIT 1`,
      [groupId],
    );
    return result.rows[0];
  }

  /**
   * Helper: Get member with lowest balance
   */
  private async getLowBalanceMember(groupId: string): Promise<any> {
    const result = await database.query(
      `SELECT u.id, u.first_name, u.last_name,
              COALESCE(
                (SELECT SUM(amount_naira) FROM ledger_entries 
                 WHERE user_id = u.id AND debit_credit_type = 'debit') -
                (SELECT SUM(amount_naira) FROM ledger_entries 
                 WHERE user_id = u.id AND debit_credit_type = 'credit')
              , 0) as balance
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY balance ASC
       LIMIT 1`,
      [groupId],
    );
    return result.rows[0];
  }
}

export default new GroupsService();
