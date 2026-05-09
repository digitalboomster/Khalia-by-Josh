import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

interface LedgerEntry {
  debitCreditType: 'debit' | 'credit';
  accountType: 'wallet' | 'escrow' | 'group_holding' | 'group_balance' | 'fee_holding';
  amount: number; // in Naira
  userId?: string;
  groupId?: string;
  transactionId?: string;
  description: string;
}

class LedgerService {
  /**
   * Record double-entry transaction (T064)
   * Every transaction must have a debit AND credit entry that balance
   */
  async recordTransaction(
    debitEntry: LedgerEntry,
    creditEntry: LedgerEntry,
    transactionId: string,
  ): Promise<{ success: boolean; ledgerEntries: string[] }> {
    // Validate that debit and credit amounts match
    if (debitEntry.amount !== creditEntry.amount) {
      throw new KhaliaError('Debit and credit amounts must match', 400, 'LEDGER_IMBALANCE');
    }

    const client = await database.pool.connect();
    try {
      await client.query('BEGIN');

      const debitId = uuidv4();
      const creditId = uuidv4();
      const timestamp = new Date();

      // Insert debit entry
      await client.query(
        `INSERT INTO ledger_entries (
          id, transaction_id, debit_credit_type, account_type, 
          amount_naira, user_id, group_id, description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          debitId,
          transactionId,
          'debit',
          debitEntry.accountType,
          debitEntry.amount,
          debitEntry.userId,
          debitEntry.groupId,
          debitEntry.description,
          timestamp,
        ],
      );

      // Insert credit entry
      await client.query(
        `INSERT INTO ledger_entries (
          id, transaction_id, debit_credit_type, account_type, 
          amount_naira, user_id, group_id, description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          creditId,
          transactionId,
          'credit',
          creditEntry.accountType,
          creditEntry.amount,
          creditEntry.userId,
          creditEntry.groupId,
          creditEntry.description,
          timestamp,
        ],
      );

      // Update balance caches (denormalized for fast queries)
      if (debitEntry.userId) {
        await this.updateAccountBalanceCache(client, debitEntry.userId, 'debit');
      }
      if (creditEntry.userId) {
        await this.updateAccountBalanceCache(client, creditEntry.userId, 'credit');
      }

      await client.query('COMMIT');

      logger.info('Ledger transaction recorded', {
        transactionId,
        debitAmount: debitEntry.amount,
        accountTypes: `${debitEntry.accountType} → ${creditEntry.accountType}`,
      });

      return {
        success: true,
        ledgerEntries: [debitId, creditId],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Ledger transaction failed', { error, transactionId });
      throw new KhaliaError('Failed to record ledger transaction', 500, 'LEDGER_ERROR');
    } finally {
      client.release();
    }
  }

  /**
   * Get account balance (T065)
   */
  async getAccountBalance(
    userId: string,
    accountType: 'wallet' | 'escrow' | 'group_holding' = 'wallet',
  ): Promise<number> {
    try {
      const result = await database.query(
        `SELECT 
          COALESCE(
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND account_type = $2 AND debit_credit_type = 'debit') -
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND account_type = $2 AND debit_credit_type = 'credit')
          , 0) as balance
        FROM users WHERE id = $1`,
        [userId, accountType],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      return parseFloat(result.rows[0].balance) || 0;
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Balance query error', { error, userId });
      throw new KhaliaError('Failed to fetch account balance', 500, 'BALANCE_ERROR');
    }
  }

  /**
   * Reconcile ledger (T066)
   * Verify that all debits = credits for period
   */
  async reconcileLedger(periodStart: Date, periodEnd: Date): Promise<any> {
    try {
      // Check all transactions balance
      const result = await database.query(
        `SELECT 
          transaction_id,
          SUM(CASE WHEN debit_credit_type = 'debit' THEN amount_naira ELSE 0 END) as total_debits,
          SUM(CASE WHEN debit_credit_type = 'credit' THEN amount_naira ELSE 0 END) as total_credits
        FROM ledger_entries
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY transaction_id
        HAVING 
          SUM(CASE WHEN debit_credit_type = 'debit' THEN amount_naira ELSE 0 END) !=
          SUM(CASE WHEN debit_credit_type = 'credit' THEN amount_naira ELSE 0 END)`,
        [periodStart, periodEnd],
      );

      const isBalanced = result.rows.length === 0;

      if (!isBalanced) {
        logger.error('Ledger reconciliation failed - imbalances found', {
          imbalances: result.rows.length,
        });
      }

      // Record reconciliation result
      await database.query(
        `INSERT INTO ledger_reconciliations (period_start, period_end, is_balanced, checked_at)
         VALUES ($1, $2, $3, NOW())`,
        [periodStart, periodEnd, isBalanced],
      );

      return {
        is_balanced: isBalanced,
        imbalance_count: result.rows.length,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        imbalances: result.rows,
      };
    } catch (error: any) {
      logger.error('Reconciliation error', { error });
      throw new KhaliaError('Ledger reconciliation failed', 500, 'RECONCILIATION_ERROR');
    }
  }

  /**
   * Get transaction history (T067)
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      const result = await database.query(
        `SELECT 
          l.id, l.transaction_id, l.debit_credit_type, l.account_type,
          l.amount_naira, l.description, l.created_at,
          t.status as transaction_status
        FROM ledger_entries l
        LEFT JOIN transactions t ON l.transaction_id = t.id
        WHERE l.user_id = $1
        ORDER BY l.created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Transaction history error', { error, userId });
      throw new KhaliaError('Failed to fetch transaction history', 500, 'HISTORY_ERROR');
    }
  }

  /**
   * Get statement (T068)
   */
  async getStatement(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      // Get all transactions for period
      const transactionsResult = await database.query(
        `SELECT 
          created_at, amount_naira, debit_credit_type, description
        FROM ledger_entries
        WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
        ORDER BY created_at ASC`,
        [userId, startDate, endDate],
      );

      // Calculate opening and closing balances
      const openingBalanceResult = await database.query(
        `SELECT 
          COALESCE(
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND created_at < $2 AND debit_credit_type = 'debit') -
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND created_at < $2 AND debit_credit_type = 'credit')
          , 0) as balance`,
        [userId, startDate],
      );

      const openingBalance = parseFloat(openingBalanceResult.rows[0].balance) || 0;

      // Calculate closing balance
      const closingBalanceResult = await database.query(
        `SELECT 
          COALESCE(
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND created_at <= $2 AND debit_credit_type = 'debit') -
            (SELECT SUM(amount_naira) FROM ledger_entries 
             WHERE user_id = $1 AND created_at <= $2 AND debit_credit_type = 'credit')
          , 0) as balance`,
        [userId, endDate],
      );

      const closingBalance = parseFloat(closingBalanceResult.rows[0].balance) || 0;

      return {
        statement_period: {
          start_date: startDate,
          end_date: endDate,
        },
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        transactions: transactionsResult.rows,
        transaction_count: transactionsResult.rows.length,
      };
    } catch (error: any) {
      logger.error('Statement generation error', { error, userId });
      throw new KhaliaError('Failed to generate statement', 500, 'STATEMENT_ERROR');
    }
  }

  /**
   * Internal helper: Update account balance cache
   */
  private async updateAccountBalanceCache(
    client: any,
    userId: string,
    operation: 'debit' | 'credit',
  ): Promise<void> {
    // This updates denormalized balance fields on users table for fast queries
    // In production, this could be offloaded to a background job
    try {
      await client.query(
        `UPDATE users SET cached_wallet_balance = (
          SELECT COALESCE(SUM(amount_naira), 0) FROM ledger_entries
          WHERE user_id = $1 AND account_type = 'wallet'
        )
        WHERE id = $1`,
        [userId],
      );
    } catch (error) {
      logger.warn('Cache update failed', { error, userId });
    }
  }
}

export default new LedgerService();
