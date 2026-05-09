/**
 * Wallet Service - Payment and wallet operations
 */

import apiClient from './api-client';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  currency: string;
  gateway_reference?: string;
  created_at: string;
  completed_at?: string;
}

export interface WalletBalance {
  available_balance: number;
  pending_transactions: number;
  held_amount: number;
  currency: string;
  
}

export interface DepositLinkResponse {
  transaction_id: string;
  payment_url: string;
  expires_at: string;
}

export interface WithdrawalRequest {
  amount: number;
  bank_account_id?: string;
}

class WalletService {
  async createDepositLink(amountNaira: number): Promise<DepositLinkResponse> {
    return apiClient.request<DepositLinkResponse>('post', '/wallet/deposit', {
      amount_naira: amountNaira,
    });
  }

  async getBalance(): Promise<WalletBalance> {
    return apiClient.request<WalletBalance>('get', '/wallet/balance');
  }

  async listTransactions(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    return apiClient.request<{ transactions: Transaction[]; total: number }>('get', '/wallet/transactions', {
      headers: {
        query: `?limit=${limit}&offset=${offset}`,
      },
    });
  }

  async getTransactionDetails(transactionId: string): Promise<Transaction> {
    return apiClient.request<Transaction>('get', `/wallet/transactions/${transactionId}`);
  }

  async requestWithdrawal(payload: WithdrawalRequest): Promise<Transaction> {
    return apiClient.request<Transaction>('post', '/wallet/withdraw', payload);
  }

  async handleDepositCallback(callbackData: any): Promise<void> {
    // This is typically called when returning from payment gateway
    // The backend webhook handler will process the payment
    // We just need to verify the transaction status
    const transactionId = callbackData.reference || callbackData.transaction_id;
    if (transactionId) {
      return this.getTransactionDetails(transactionId).then(() => {});
    }
  }
}

const walletService = new WalletService();
export { walletService };
export default walletService;
