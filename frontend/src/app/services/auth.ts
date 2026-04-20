/**
 * Auth Service - Authentication API endpoints
 * Handles user login, registration, profile fetching
 */

import apiClient from './api-client';

export interface User {
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
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('post', '/auth/register', payload);
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>('post', '/auth/login', payload);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>('post', '/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response;
  }

  async getProfile(): Promise<User> {
    return apiClient.request<User>('get', '/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.request('post', '/auth/logout', {});
    } finally {
      apiClient.clearTokens();
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    apiClient.setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export default new AuthService();
