// Base API Service for React Native App
// Provides common functionality for all API services

import { parseError, isRetryableError } from '../utils/errorUtils';

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  details?: string;
  field?: string;
  code?: string;
  statusCode?: number;
}

export interface RequestOptions {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Token storage interface (can be implemented with AsyncStorage later)
export interface TokenStorage {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  setTokens(accessToken: string, refreshToken: string): Promise<void> | void;
  clearTokens(): Promise<void> | void;
}

// In-memory token storage (default implementation)
class InMemoryTokenStorage implements TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export class BaseApiService {
  protected baseUrl: string;
  protected timeout: number;
  protected defaultHeaders: Record<string, string>;
  protected tokenStorage: TokenStorage;
  private defaultRetryOptions: RequestOptions = {
    retry: true,
    maxRetries: 3,
    retryDelay: 1000, // 1 second initial delay
  };

  constructor(config: ApiConfig, tokenStorage?: TokenStorage) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 10000; // 10 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };
    this.tokenStorage = tokenStorage || new InMemoryTokenStorage();
    console.log('🔧 [BASE API SERVICE] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Make HTTP request with automatic token handling and error management
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true,
    requestOptions: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const retryOptions = { ...this.defaultRetryOptions, ...requestOptions };
    let lastError: any;

    for (let attempt = 0; attempt <= (retryOptions.maxRetries || 0); attempt++) {
      try {
        const url = this.buildUrl(endpoint);
        const headers = await this.buildHeaders(options.headers, requiresAuth);

        const fetchOptions: RequestInit = {
          ...options,
          headers,
          signal: this.createTimeoutSignal(),
        };

        let response = await fetch(url, fetchOptions);

        // Handle token refresh for 401/403 errors (backend returns 403 for expired tokens)
        if ((response.status === 401 || response.status === 403) && requiresAuth && !endpoint.includes('/refresh')) {
          const refreshed = await this.refreshTokens();
          if (refreshed) {
            // Retry with new token
            const newHeaders = await this.buildHeaders(options.headers, requiresAuth);
            response = await fetch(url, {
              ...fetchOptions,
              headers: newHeaders,
            });
          }
        }

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (!retryOptions.retry || !isRetryableError(error)) {
          return this.handleError(error);
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= (retryOptions.maxRetries || 0)) {
          return this.handleError(error);
        }

        // Wait before retrying with exponential backoff
        const delay = (retryOptions.retryDelay || 1000) * Math.pow(2, attempt);
        console.log(`🔄 [RETRY] Attempt ${attempt + 1}/${retryOptions.maxRetries} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    return this.handleError(lastError);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  /**
   * POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  /**
   * PUT request
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }

  /**
   * PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  /**
   * POST request with FormData (for file uploads)
   */
  protected async postFormData<T>(
    endpoint: string,
    formData: FormData,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const accessToken = requiresAuth ? await this.getAccessToken() : null;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const requestOptions: RequestInit = {
        method: 'POST',
        headers,
        body: formData,
        signal: this.createTimeoutSignal(),
      };

      let response = await fetch(url, requestOptions);

      // Handle token refresh for 401/403 errors (backend returns 403 for expired tokens)
      if ((response.status === 401 || response.status === 403) && requiresAuth && !endpoint.includes('/refresh')) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          const newToken = await this.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }
          response = await fetch(url, {
            ...requestOptions,
            headers,
          });
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Build complete URL
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Build request headers with authentication
   */
  private async buildHeaders(
    customHeaders?: HeadersInit,
    requiresAuth: boolean = true
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(customHeaders as Record<string, string>),
    };

    // Add authorization header if required and token exists
    if (requiresAuth) {
      const accessToken = await this.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  /**
   * Create timeout signal for requests
   */
  private createTimeoutSignal(): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller.signal;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {
          success: response.ok,
          data: undefined as T,
        };
      }

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        return {
          success: true,
          data,
        };
      } else {
        return {
          success: false,
          error: this.parseError(data, response.status),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to parse response',
          details: error instanceof Error ? error.message : 'Unknown error',
          statusCode: response.status,
        },
      };
    }
  }

  /**
   * Handle request errors (network, timeout, etc.)
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('🚨 [API ERROR]:', error);

    // Use our error utility to parse the error
    const appError = parseError(error);

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: {
          message: appError.userMessage,
          details: 'La requete a pris trop de temps',
          code: 'TIMEOUT',
        },
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: {
          message: appError.userMessage,
          details: 'Impossible de se connecter au serveur. Verifiez votre connexion internet.',
          code: 'NETWORK_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: appError.userMessage,
        details: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        code: appError.type,
        statusCode: appError.statusCode,
      },
    };
  }

  /**
   * Parse error from API response
   */
  private parseError(data: any, statusCode: number): ApiError {
    // FastAPI error format with validation errors
    if (data && typeof data === 'object') {
      let message = data.detail || data.message || 'An error occurred';
      let details = data.details || data.description;
      
      // Handle validation errors with field_errors
      if (data.details && data.details.field_errors) {
        const fieldErrors = data.details.field_errors;
        const errorMessages = [];
        
        for (const [field, errors] of Object.entries(fieldErrors)) {
          if (Array.isArray(errors) && errors.length > 0) {
            // Extract the actual error message, removing "Value error," prefix if present
            const cleanError = errors[0].replace(/^Value error, /, '');
            errorMessages.push(cleanError);
          }
        }
        
        if (errorMessages.length > 0) {
          message = errorMessages.join('. ');
          details = JSON.stringify(fieldErrors);
        }
      }
      
      return {
        message,
        details,
        field: data.field,
        code: data.code || data.error_code,
        statusCode,
      };
    }

    // Fallback for other formats
    return {
      message: typeof data === 'string' ? data : 'An error occurred',
      statusCode,
    };
  }

  /**
   * Get access token from storage
   */
  protected async getAccessToken(): Promise<string | null> {
    try {
      return await this.tokenStorage.getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  protected async getRefreshToken(): Promise<string | null> {
    try {
      return await this.tokenStorage.getRefreshToken();
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Store tokens
   */
  protected async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await this.tokenStorage.setTokens(accessToken, refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  protected async clearTokens(): Promise<void> {
    try {
      await this.tokenStorage.clearTokens();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Refresh access token using the auth service
   */
  protected async refreshTokens(): Promise<boolean> {
    try {
      console.log('🔄 [BASE API] Attempting token refresh...');

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.error('❌ [BASE API] No refresh token available');
        return false;
      }

      // Construct the auth refresh URL by removing any service-specific paths
      const authBaseUrl = this.baseUrl.split('/api/v1')[0] + '/api/v1/auth';

      // Call the refresh endpoint directly
      const response = await fetch(`${authBaseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('❌ [BASE API] Token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.accessToken && data.refreshToken) {
        await this.storeTokens(data.accessToken, data.refreshToken);
        console.log('✅ [BASE API] Token refresh successful');
        return true;
      }

      console.error('❌ [BASE API] Invalid refresh response');
      return false;
    } catch (error) {
      console.error('❌ [BASE API] Token refresh error:', error);
      return false;
    }
  }

  /**
   * Set token storage implementation
   */
  public setTokenStorage(tokenStorage: TokenStorage): void {
    this.tokenStorage = tokenStorage;
  }

  /**
   * Update base configuration
   */
  public updateConfig(config: Partial<ApiConfig>): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.timeout) this.timeout = config.timeout;
    if (config.headers) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        ...config.headers,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

import ENV from '../env';

// Default configuration
export const defaultApiConfig: ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || ENV.API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default BaseApiService;