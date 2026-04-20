import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';
import ledgerService from './ledger.js';
import { v4 as uuidv4 } from 'uuid';

class WalletService {
  /**
   * Create payment deposit URL (T070)
   * Integrates with Paystack/Flutterwave for payment collection
   */
  async createDepositLink(userId: string, amountNaira: number): Promise<any> {
    if (amountNaira < 1000 || amountNaira > 10000000) {
      throw new KhaliaError('Amount must be between ₦1,000 and ₦10,000,000', 400, 'INVALID_AMOUNT');
    }

    try {
      const user = await database.query('SELECT email, phone_number FROM users WHERE id = $1', [userId]);

      if (user.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      const transactionId = uuidv4();

      // Create transaction record
      await database.query(
        `INSERT INTO transactions (
          id, user_id, type, amount_naira, status, payment_gateway, 
          idempotency_key, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [transactionId, userId, 'deposit', amountNaira, 'pending', 'paystack', transactionId],
      );

      // In production, call Paystack API
      // Mock URL for MVP
      const paystackMockUrl = `https://checkout.paystack.com/paystack?reference=${transactionId}`;

      logger.info('Deposit link created', { userId, amountNaira, transactionId });

      return {
        transaction_id: transactionId,
        amount_naira: amountNaira,
        payment_url: paystackMockUrl,
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
        gateway: 'paystack',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Deposit link creation failed', { error, userId });
      throw new KhaliaError('Failed to create deposit link', 500, 'DEPOSIT_ERROR');
    }
  }

  /**
   * Handle deposit webhook (T071)
   * Called by payment provider after successful payment
   */
  async handleDepositWebhook(webhookData: any): Promise<any> {
    const { reference, status, amount } = webhookData;

    if (status !== 'success') {
      return { success: false, message: 'Payment failed' };
    }

    try {
      // Find transaction
      const transaction = await database.query(
        `SELECT id, user_id, amount_naira FROM transactions WHERE id = $1`,
        [reference],
      );

      if (transaction.rows.length === 0) {
        throw new KhaliaError('Transaction not found', 404, 'NOT_FOUND');
      }

      const tx = transaction.rows[0];
      const userId = tx.user_id;

      // Verify amount matches (in kobo from Paystack)
      const expectedAmount = Math.round(tx.amount_naira * 100);
      if (amount !== expectedAmount) {
        throw new KhaliaError('Amount mismatch', 400, 'AMOUNT_MISMATCH');
      }

      // Record ledger entries
      const transactionId = uuidv4();
      await ledgerService.recordTransaction(
        {
          debitCreditType: 'debit',
          accountType: 'wallet',
          amount: tx.amount_naira,
          userId,
          description: `Deposit via ${webhookData.gateway || 'payment gateway'}`,
        },
        {
          debitCreditType: 'credit',
          accountType: 'group_balance', // or fee_holding if taking fees
          amount: tx.amount_naira,
          description: `Deposit credit from user ${userId}`,
        },
        transactionId,
      );

      // Update transaction status
      await database.query(`UPDATE transactions SET status = $1, completed_at = NOW() WHERE id = $2`, [
        'completed',
        reference,
      ]);

      logger.info('Deposit webhook processed', { userId, amount: tx.amount_naira, transactionId });

      return {
        success: true,
        transaction_id: transactionId,
        amount: tx.amount_naira,
      };
    } catch (error: any) {
      logger.error('Webhook processing failed', { error, reference });
      throw new KhaliaError('Webhook processing failed', 500, 'WEBHOOK_ERROR');
    }
  }

  /**
   * Request withdrawal (T072)
   */
  async requestWithdrawal(userId: string, amountNaira: number): Promise<any> {
    if (amountNaira < 100 || amountNaira > 5000000) {
      throw new KhaliaError('Amount must be between ₦100 and ₦5,000,000', 400, 'INVALID_AMOUNT');
    }

    try {
      // Check balance
      const balance = await ledgerService.getAccountBalance(userId, 'wallet');

      if (balance < amountNaira) {
        throw new KhaliaError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      // Get user bank details
      const user = await database.query(
        `SELECT bank_account_number, bank_code, bank_account_name FROM users WHERE id = $1 AND bank_account_verified = true`,
        [userId],
      );

      if (user.rows.length === 0) {
        throw new KhaliaError('Bank account not verified', 400, 'BANK_NOT_VERIFIED');
      }

      const transactionId = uuidv4();

      // Create withdrawal transaction
      await database.query(
        `INSERT INTO transactions (
          id, user_id, type, amount_naira, status, payment_gateway, 
          idempotency_key, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [transactionId, userId, 'withdrawal', amountNaira, 'pending', 'bank_transfer', transactionId],
      );

      // Record ledger (hold in escrow until transfer completes)
      await ledgerService.recordTransaction(
        {
          debitCreditType: 'debit',
          accountType: 'wallet',
          amount: amountNaira,
          userId,
          description: `Withdrawal request`,
        },
        {
          debitCreditType: 'credit',
          accountType: 'escrow',
          amount: amountNaira,
          userId,
          description: `Withdrawal held in escrow`,
        },
        transactionId,
      );

      logger.info('Withdrawal request created', { userId, amountNaira, transactionId });

      return {
        transaction_id: transactionId,
        amount_naira: amountNaira,
        status: 'pending_approval',
        estimated_delivery: '2-3 business days',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Withdrawal request failed', { error, userId });
      throw new KhaliaError('Withdrawal request failed', 500, 'WITHDRAWAL_ERROR');
    }
  }

  /**
   * Execute withdrawal to bank (T073)
   * Called by admin or scheduled batch process
   */
  async executeWithdrawal(transactionId: string): Promise<any> {
    try {
      const transaction = await database.query(
        `SELECT user_id, amount_naira FROM transactions WHERE id = $1 AND type = $2 AND status = $3`,
        [transactionId, 'withdrawal', 'pending'],
      );

      if (transaction.rows.length === 0) {
        throw new KhaliaError('Transaction not found or already processed', 404, 'NOT_FOUND');
      }

      const tx = transaction.rows[0];

      // In production: Call bank transfer API (Flutterwave, etc.)
      // Mock successful transfer
      const bankTransferReference = `TRF${Date.now()}`;

      // Update transaction
      await database.query(
        `UPDATE transactions SET status = $1, gateway_reference = $2, completed_at = NOW() WHERE id = $3`,
        ['completed', bankTransferReference, transactionId],
      );

      logger.info('Withdrawal executed', { transactionId, amount: tx.amount_naira });

      return {
        success: true,
        transaction_id: transactionId,
        bank_reference: bankTransferReference,
        amount: tx.amount_naira,
        status: 'completed',
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Withdrawal execution failed', { error, transactionId });
      throw new KhaliaError('Withdrawal execution failed', 500, 'WITHDRAWAL_ERROR');
    }
  }

  /**
   * Get wallet balance (T074)
   */
  async getWalletBalance(userId: string): Promise<any> {
    try {
      const balance = await ledgerService.getAccountBalance(userId, 'wallet');

      // Get pending transactions
      const pendingResult = await database.query(
        `SELECT 
          COUNT(*) as pending_count,
          SUM(amount_naira) as pending_amount
        FROM transactions
        WHERE user_id = $1 AND status = 'pending'`,
        [userId],
      );

      const pending = pendingResult.rows[0];

      return {
        available_balance: balance,
        pending_transactions: pending.pending_count,
        held_amount: pending.pending_amount || 0,
        currency: 'NGN',
      };
    } catch (error: any) {
      logger.error('Balance fetch error', { error, userId });
      throw new KhaliaError('Failed to fetch wallet balance', 500, 'BALANCE_ERROR');
    }
  }

  /**
   * Get transaction details (T075)
   */
  async getTransactionDetails(transactionId: string, userId: string): Promise<any> {
    try {
      const result = await database.query(
        `SELECT 
          id, type, amount_naira, status, gateway_reference, 
          created_at, completed_at, payment_gateway
        FROM transactions 
        WHERE id = $1 AND user_id = $2`,
        [transactionId, userId],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('Transaction not found', 404, 'NOT_FOUND');
      }

      return {
        transaction: result.rows[0],
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Transaction details error', { error, transactionId });
      throw new KhaliaError('Failed to fetch transaction details', 500, 'TRANSACTION_ERROR');
    }
  }

  /**
   * List transactions (T076)
   */
  async listTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<any> {
    try {
      const result = await database.query(
        `SELECT 
          id, type, amount_naira, status, created_at, completed_at
        FROM transactions 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      return {
        transactions: result.rows,
        count: result.rows.length,
      };
    } catch (error: any) {
      logger.error('Transaction list error', { error, userId });
      throw new KhaliaError('Failed to list transactions', 500, 'LIST_ERROR');
    }
  }
}

export default new WalletService();
