/**
 * User Service - Profile, trust score, and user data
 */

import apiClient from './api-client';

export interface TrustScoreBreakdown {
  overall_score: number;
  risk_level: string;
  factors: {
    on_time_payments: number;
    group_participation: number;
    disputes: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  kyc_level: number;
  kyc_status: string;
  trust_score: number;
  aml_risk_level: string;
  created_at: string;
  bvn_verified: boolean;
  phone_verified: boolean;
  bank_account_verified: boolean;
}

class UserService {
  async getUserProfile(): Promise<UserProfile> {
    return apiClient.request<UserProfile>('get', '/auth/me');
  }

  async getTrustScoreBreakdown(): Promise<TrustScoreBreakdown> {
    return apiClient.request<TrustScoreBreakdown>('get', '/trust-score');
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.request<UserProfile>('put', '/auth/me', updates);
  }
}

const userService = new UserService();
export { userService };
export default userService;
