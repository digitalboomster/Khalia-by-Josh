/**
 * KYC Service - Know Your Customer verification endpoints
 */

import apiClient from './api-client';

export interface KYCStatus {
  kyc_level: number;
  kyc_status: string;
  completion_percentage: number;
  next_step?: string;
  requirements: {
    email: boolean;
    phone: boolean;
    bvn: boolean;
    biometric: boolean;
    bank_account: boolean;
  };
  can_transact: boolean;
}

export interface BVNVerification {
  bvn: string;
  verified: boolean;
  kyc_level: number;
}

export interface BiometricVerification {
  verified: boolean;
  confidence_score: number;
  kyc_level: number;
}

export interface BankVerification {
  account_number: string;
  verified: boolean;
  kyc_level: number;
}

class KYCService {
  async verifyBVN(bvn: string): Promise<BVNVerification> {
    return apiClient.request<BVNVerification>('post', '/kyc/verify-bvn', { bvn });
  }

  async verifyBiometric(imageBase64: string): Promise<BiometricVerification> {
    return apiClient.request<BiometricVerification>('post', '/kyc/verify-biometric', {
      image: imageBase64,
    });
  }

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string,
    accountName: string,
  ): Promise<BankVerification> {
    return apiClient.request<BankVerification>('post', '/kyc/verify-bank', {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName,
    });
  }

  async getKYCStatus(): Promise<KYCStatus> {
    return apiClient.request<KYCStatus>('get', '/kyc/status');
  }

  isFullyVerified(status: KYCStatus): boolean {
    return status.kyc_level >= 5 && status.kyc_status === 'approved';
  }

  getNextRequiredStep(status: KYCStatus): string | null {
    const requirements = status.requirements;
    if (!requirements.email) return 'Email verification';
    if (!requirements.phone) return 'Phone verification';
    if (!requirements.bvn) return 'BVN verification';
    if (!requirements.biometric) return 'Facial recognition';
    if (!requirements.bank_account) return 'Bank account verification';
    return null;
  }
}

const kycService = new KYCService();
export { kycService };
export default kycService;
