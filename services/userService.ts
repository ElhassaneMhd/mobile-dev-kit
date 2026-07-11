// User Service - Minimal version for student profile only
import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';
import type { UserResponse } from '../types/auth';

/**
 * User Service Class
 * Handles user profile operations for students
 *
 * NOTE: This service only includes student-facing endpoints.
 * Admin/coordinator endpoints have been removed as mobile app is student-only.
 */
class UserServiceClass extends BaseApiService {
  private static BASE_PATH = '/users';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
    console.log('👤 [USER SERVICE] Initializing with base URL:', this.baseUrl + UserServiceClass.BASE_PATH);
  }

  /**
   * Get current user profile
   * GET /users/profile
   *
   * Used by: auth.ts (after login/register), profile.tsx, AppStateContext.tsx
   */
  async getProfile(): Promise<UserResponse | null> {
    try {
      console.log('👤 [USER SERVICE] Getting profile');
      const response = await this.get<UserResponse>(`${UserServiceClass.BASE_PATH}/profile`);

      if (response.success && response.data) {
        console.log('👤 [USER SERVICE] Profile fetched successfully');
        return response.data;
      }

      console.warn('👤 [USER SERVICE] Failed to fetch profile:', response.error);
      return null;
    } catch (error) {
      console.error('👤 [USER SERVICE] Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * PUT /users/profile
   *
   * Used by: AppStateContext.tsx
   */
  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string }): Promise<UserResponse | null> {
    try {
      console.log('👤 [USER SERVICE] Updating profile');
      const response = await this.put<UserResponse>(`${UserServiceClass.BASE_PATH}/profile`, data);

      if (response.success && response.data) {
        console.log('👤 [USER SERVICE] Profile updated successfully');
        return response.data;
      }

      console.warn('👤 [USER SERVICE] Failed to update profile:', response.error);
      return null;
    } catch (error) {
      console.error('👤 [USER SERVICE] Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile photo
   * POST /users/profile/photo
   *
   * Used by: AppStateContext.tsx
   */
  async uploadProfilePhoto(photoUri: string): Promise<{ photoUrl: string } | null> {
    try {
      console.log('👤 [USER SERVICE] Uploading profile photo');
      const response = await this.post<{ photoUrl: string }>(`${UserServiceClass.BASE_PATH}/profile/photo`, { photoUri });

      if (response.success && response.data) {
        console.log('👤 [USER SERVICE] Photo uploaded successfully');
        return response.data;
      }

      console.warn('👤 [USER SERVICE] Failed to upload photo:', response.error);
      return null;
    } catch (error) {
      console.error('👤 [USER SERVICE] Error uploading photo:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserServiceClass();
export type { UserResponse };
