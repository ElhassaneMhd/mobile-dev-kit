// Shared Token Storage for all API services
// Uses expo-secure-store for secure token persistence

import * as SecureStore from 'expo-secure-store';
import type { TokenStorage } from './BaseApiService';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'fsr_access_token',
  REFRESH_TOKEN: 'fsr_refresh_token',
  USER_DATA: 'fsr_user_data',
} as const;

/**
 * Secure token storage implementation using expo-secure-store
 * This is a shared singleton instance used by all API services
 */
class SecureTokenStorage implements TokenStorage {
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        console.log('✅ [TOKEN STORAGE] Retrieved access token');
      } else {
        console.log('⚠️ [TOKEN STORAGE] No access token found');
      }
      return token;
    } catch (error) {
      console.error('❌ [TOKEN STORAGE] Failed to get access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('❌ [TOKEN STORAGE] Failed to get refresh token:', error);
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      console.log('✅ [TOKEN STORAGE] Tokens stored successfully');
    } catch (error) {
      console.error('❌ [TOKEN STORAGE] Failed to store tokens:', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
      console.log('✅ [TOKEN STORAGE] Tokens cleared');
    } catch (error) {
      console.error('❌ [TOKEN STORAGE] Failed to clear tokens:', error);
      throw error;
    }
  }
}

// Export singleton instance - shared across all services
export const sharedTokenStorage = new SecureTokenStorage();
export default sharedTokenStorage;
