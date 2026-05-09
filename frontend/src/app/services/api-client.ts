/**
 * API Client - Centralized HTTP client for all backend API calls
 * Handles authentication, error handling, and response formatting
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  requestId?: string;
}

interface ApiError {
  code: string;
  message: string;
  status: number;
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: add auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.accessToken = null;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      },
    );

    // Load token from storage
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessToken = token;
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  protected async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    try {
      const response = await this.client({
        method,
        url: endpoint,
        data,
      });

      const apiResponse: ApiResponse<T> = response.data;

      if (!apiResponse.success) {
        const error: ApiError = {
          code: apiResponse.error?.code || 'UNKNOWN_ERROR',
          message: apiResponse.error?.message || 'An error occurred',
          status: response.status,
        };
        throw error;
      }

      return apiResponse.data as T;
    } catch (error: any) {
      if (error.code && error.message && error.status) {
        // Already formatted error
        throw error;
      }

      let apiError: ApiError;

      if (error.response) {
        const e = error.response.data?.error || {};
        apiError = {
          code: e.code || 'HTTP_ERROR',
          message: e.message || error.response.statusText,
          status: error.response.status,
        };
      } else if (error.request) {
        apiError = {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
          status: 0,
        };
      } else {
        apiError = {
          code: 'CLIENT_ERROR',
          message: error.message || 'An error occurred',
          status: 0,
        };
      }

      throw apiError;
    }
  }
}

export default new ApiClient();
