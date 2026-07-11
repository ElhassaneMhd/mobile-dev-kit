// Authentication API Service for React Native App
// Integrates with Spring Boot backend authentication endpoints

import * as SecureStore from 'expo-secure-store';
import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';
import type { UserResponse } from '../types/auth';

// =====================================================
// Types matching backend DTOs
// =====================================================

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone?: string;
  cin?: string;
}

// OTP Registration Types
export interface InitiateRegistrationRequest {
  email: string;
}

export interface InitiateRegistrationResponse {
  message: string;
  email: string;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  email: string;
  registrationToken: string;
  expiresInSeconds: number;
}

export interface CompleteRegistrationRequest {
  registrationToken: string;
  firstName: string;
  lastName: string;
  password: string;
  studentNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  role: string;
  emailVerified: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  cin?: string;
  emailVerified: boolean;
  enabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// =====================================================
// Secure Token Storage
// =====================================================

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'fsr_access_token',
  REFRESH_TOKEN: 'fsr_refresh_token',
  USER_DATA: 'fsr_user_data',
  BIOMETRIC_ENABLED: 'fsr_biometric_enabled',
  BIOMETRIC_CREDENTIALS: 'fsr_biometric_credentials',
  REMEMBER_ME: 'fsr_remember_me',
} as const;

class SecureTokenStorage {
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
    ]);
  }

  async setUserData(user: UserResponse): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  }

  async getUserData(): Promise<UserResponse | null> {
    const data = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  async clearUserData(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA);
  }

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEYS.BIOMETRIC_ENABLED, String(enabled));
  }

  async isBiometricEnabled(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(TOKEN_KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  }

  async saveBiometricCredentials(email: string, password: string): Promise<void> {
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(TOKEN_KEYS.BIOMETRIC_CREDENTIALS, credentials);
  }

  async getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
    const data = await SecureStore.getItemAsync(TOKEN_KEYS.BIOMETRIC_CREDENTIALS);
    return data ? JSON.parse(data) : null;
  }

  async clearBiometricCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.BIOMETRIC_CREDENTIALS);
  }

  async setRememberMe(remember: boolean): Promise<void> { 
    await SecureStore.setItemAsync(TOKEN_KEYS.REMEMBER_ME, String(remember));
  }

  async isRememberMe(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(TOKEN_KEYS.REMEMBER_ME);
    return value === 'true';
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      this.clearUserData(),
      // Note: We DON'T clear BIOMETRIC_ENABLED - it should persist across logouts
      // This matches behavior of Instagram, banking apps, etc.
      SecureStore.deleteItemAsync(TOKEN_KEYS.REMEMBER_ME),
    ]);
  }
}

// =====================================================
// Authentication Service
// =====================================================

class AuthService extends BaseApiService {
  private storage: SecureTokenStorage;

  constructor() {
    // Initialize with shared token storage
    super(defaultApiConfig, sharedTokenStorage);
    this.baseUrl = this.baseUrl + '/auth';
    this.storage = new SecureTokenStorage();

    console.log('🔧 [AUTH SERVICE] Initializing with base URL:', this.baseUrl);
    console.log('🌐 [AUTH SERVICE] Full API configuration:', {
      baseURL: this.baseUrl,
      timeout: this.timeout,
    });
  }

  // Override refresh tokens to call backend
  protected async refreshTokens(): Promise<boolean> {
    console.log('🔄 [AUTH SERVICE] Token refresh attempt');
    try {
      const refreshToken = await this.storage.getRefreshToken();
      if (!refreshToken) {
        console.error('❌ [AUTH SERVICE] No refresh token available');
        return false;
      }

      const response = await this.post<AuthResponse>('/refresh', { refreshToken }, false);
      
      if (response.success && response.data) {
        await this.storage.setTokens(response.data.accessToken, response.data.refreshToken);
        console.log('✅ [AUTH SERVICE] Token refresh successful');
        return true;
      }
      
      console.error('❌ [AUTH SERVICE] Token refresh failed:', response.error);
      return false;
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Token refresh error:', error);
      return false;
    }
  }

  // =====================================================
  // Authentication Methods
  // =====================================================

  /**
   * OTP Registration Flow - Step 1: Initiate Registration
   * Sends OTP to university email (@um5.ac.ma)
   */
  async initiateRegistration(data: InitiateRegistrationRequest): Promise<InitiateRegistrationResponse> {
    console.log('📧 [AUTH SERVICE] Initiate registration:', {
      url: `${this.baseUrl}/register/initiate`,
      email: data.email,
    });
    
    const response = await this.post<InitiateRegistrationResponse>('/register/initiate', data, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] Initiate registration failed:', response.error);
      throw response.error || { message: 'Failed to send verification code' };
    }

    console.log('✅ [AUTH SERVICE] OTP sent successfully');
    return response.data;
  }

  /**
   * OTP Registration Flow - Step 2: Verify OTP Code
   * Verifies the 6-digit OTP and returns registration token
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log('🔐 [AUTH SERVICE] Verify OTP:', {
      url: `${this.baseUrl}/register/verify-otp`,
      email: data.email,
    });
    
    const response = await this.post<VerifyOtpResponse>('/register/verify-otp', data, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] OTP verification failed:', response.error);
      throw response.error || { message: 'Invalid or expired OTP' };
    }

    console.log('✅ [AUTH SERVICE] OTP verified successfully');
    return response.data;
  }

  /**
   * OTP Registration Flow - Step 3: Complete Registration
   * Completes registration with token and returns JWT tokens
   */
  async completeRegistration(data: CompleteRegistrationRequest): Promise<AuthResponse> {
    console.log('✍️ [AUTH SERVICE] Complete registration:', {
      url: `${this.baseUrl}/register/complete`,
    });
    
    const response = await this.post<AuthResponse>('/register/complete', data, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] Complete registration failed:', response.error);
      throw response.error || { message: 'Registration failed' };
    }

    const authData = response.data;
    console.log('✅ [AUTH SERVICE] Registration completed successfully:', {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
    });

    // Store tokens
    await this.storage.setTokens(authData.accessToken, authData.refreshToken);
    
    // Fetch and store user profile (same as login)
    const { userService } = await import('./userService');
    const user = await userService.getProfile();
    if (user) {
      await this.storage.setUserData(user);
    }
    
    return authData;
  }

  /**
   * OTP Registration Flow - Resend OTP
   * Requests a new OTP code (60 second cooldown)
   */
  async resendOtp(data: InitiateRegistrationRequest): Promise<InitiateRegistrationResponse> {
    console.log('🔁 [AUTH SERVICE] Resend OTP:', {
      url: `${this.baseUrl}/register/resend-otp`,
      email: data.email,
    });
    
    const response = await this.post<InitiateRegistrationResponse>('/register/resend-otp', data, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] Resend OTP failed:', response.error);
      throw response.error || { message: 'Failed to resend verification code' };
    }

    console.log('✅ [AUTH SERVICE] OTP resent successfully');
    return response.data;
  }

  /**
   * Register a new user (Legacy - for admin use)
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('📝 [AUTH SERVICE] Register attempt:', {
      url: `${this.baseUrl}/register`,
      email: data.email,
      role: data.role,
    });
    
    const response = await this.post<AuthResponse>('/register', data, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] Registration failed:', {
        url: `${this.baseUrl}/register`,
        error: response.error,
      });
      throw response.error || { message: 'Registration failed' };
    }

    const authData = response.data;
    console.log('✅ [AUTH SERVICE] Registration successful:', {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
    });
    
    // Store tokens and user data
    await this.storage.setTokens(authData.accessToken, authData.refreshToken);
    const { userService } = await import('./userService');
    const user = await userService.getProfile();
    if (user) {
      await this.storage.setUserData(user);
    }
    
    return authData;
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 [AUTH SERVICE] Login attempt:', {
      url: `${this.baseUrl}/login`,
      email: credentials.email,
      rememberMe: credentials.rememberMe,
    });
    
    const response = await this.post<AuthResponse>('/login', credentials, false);
    
    if (!response.success || !response.data) {
      console.error('❌ [AUTH SERVICE] Login failed:', {
        url: `${this.baseUrl}/login`,
        email: credentials.email,
        error: response.error,
      });
      throw response.error || { message: 'Login failed' };
    }

    const authData = response.data;
    console.log('✅ [AUTH SERVICE] Login successful:', {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
      emailVerified: authData.emailVerified,
      tokenType: authData.tokenType,
      expiresIn: authData.expiresIn,
    });
    
    // Store tokens and remember me preference
    await this.storage.setTokens(authData.accessToken, authData.refreshToken);
    await this.storage.setRememberMe(credentials.rememberMe || false);
    
    // Fetch and store user profile
    const { userService } = await import('./userService');
    const user = await userService.getProfile();
    if (user) {
      await this.storage.setUserData(user);
    }
    
    return authData;
  }

  /**
   * Refresh access token (legacy method - use refreshTokens() instead)
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    console.log('🔄 [AUTH SERVICE] Token refresh attempt (legacy method)');
    const response = await this.post<AuthResponse>('/refresh', { refreshToken }, false);
    if (response.success && response.data) {
      return response.data;
    }
    throw response.error || { message: 'Token refresh failed' };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log('🚪 [AUTH SERVICE] Logout attempt:', {
      url: `${this.baseUrl}/logout`,
    });
    
    try {
      await this.post('/logout', {});
      console.log('✅ [AUTH SERVICE] Logout successful');
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Logout API error:', {
        url: `${this.baseUrl}/logout`,
        error: error,
      });
    } finally {
      await this.clearSession();
      console.log('🧹 [AUTH SERVICE] Session cleared');
    }
  }

  // =====================================================
  // Note: User profile methods have been moved to userService.ts
  // Use: import { userService } from '@/services/userService'
  // - userService.getProfile()
  // - userService.updateProfile(data)
  // - userService.uploadProfilePhoto(uri)
  // =====================================================

  // =====================================================
  // Password Management
  // =====================================================

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string } | null> {
    const response = await this.post<{ message: string }>('/change-password', data);
    return response.success && response.data ? response.data : null;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string } | null> {
    const response = await this.post<{ message: string }>('/forgot-password', { email }, false);
    return response.success && response.data ? response.data : null;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string } | null> {
    const response = await this.post<{ message: string }>('/reset-password', {
      token,
      newPassword,
      confirmPassword,
    }, false);
    return response.success && response.data ? response.data : null;
  }

  // =====================================================
  // Email Verification
  // =====================================================

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<{ message: string } | null> {
    const response = await this.post<{ message: string }>(`/verify-email?code=${code}`, {});
    return response.success && response.data ? response.data : null;
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ message: string } | null> {
    const user = await this.storage.getUserData();
    if (!user) {
      console.error('No user data found');
      return null;
    }
    
    const response = await this.post<{ message: string }>(`/resend-verification?email=${user.email}`, {});
    return response.success && response.data ? response.data : null;
  }

  // =====================================================
  // Session Management
  // =====================================================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.storage.getAccessToken();
    return !!token;
  }

  /**
   * Get cached user data
   */
  async getCachedUser(): Promise<UserResponse | null> {
    return await this.storage.getUserData();
  }

  /**
   * Clear session data
   */
  async clearSession(): Promise<void> {
    await this.storage.clearAll();
  }

  /**
   * Get biometric enabled status
   */
  async getBiometricEnabled(): Promise<boolean> {
    return await this.storage.isBiometricEnabled();
  }

  /**
   * Set biometric enabled status
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.storage.setBiometricEnabled(enabled);
  }

  /**Save biometric credentials for automatic login
   */
  async saveBiometricCredentials(email: string, password: string): Promise<void> {
    await this.storage.saveBiometricCredentials(email, password);
  }

  /**
   * Get stored biometric credentials
   */
  async getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
    return await this.storage.getBiometricCredentials();
  }

  /**
   * Clear biometric credentials
   */
  async clearBiometricCredentials(): Promise<void> {
    await this.storage.clearBiometricCredentials();
  }

  /**
   * 
   * Get stored access token
   */
  async getStoredAccessToken(): Promise<string | null> {
    return await this.storage.getAccessToken();
  }

  /**
   * Get stored refresh token
   */
  async getStoredRefreshToken(): Promise<string | null> {
    return await this.storage.getRefreshToken();
  }
}

export const authService = new AuthService();
export default authService;