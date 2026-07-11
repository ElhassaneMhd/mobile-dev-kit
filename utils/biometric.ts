/**
 * Biometric Authentication Utility
 * Handles fingerprint and Face ID authentication for the app
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCheckResult {
  isAvailable: boolean;
  biometryType: 'fingerprint' | 'facial' | 'iris' | 'none';
  hasHardware: boolean;
  isEnrolled: boolean;
}

export class BiometricAuth {
  /**
   * Check if biometric authentication is available on device
   */
  static async checkAvailability(): Promise<BiometricCheckResult> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometryType: 'fingerprint' | 'facial' | 'iris' | 'none' = 'none';

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = 'facial';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometryType = 'iris';
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        biometryType,
        hasHardware,
        isEnrolled,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        biometryType: 'none',
        hasHardware: false,
        isEnrolled: false,
      };
    }
  }

  /**
   * Get biometric type name for display
   */
  static getBiometricTypeName(type: 'fingerprint' | 'facial' | 'iris' | 'none'): string {
    switch (type) {
      case 'facial':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case 'iris':
        return 'Iris Recognition';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(
    promptMessage?: string,
    cancelLabel?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const availability = await this.checkAvailability();

      if (!availability.isAvailable) {
        return {
          success: false,
          error: availability.hasHardware
            ? 'No biometric credentials enrolled'
            : 'Biometric authentication not available',
        };
      }

      const biometricName = this.getBiometricTypeName(availability.biometryType);
      const defaultPrompt = `Authenticate with ${biometricName}`;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || defaultPrompt,
        cancelLabel: cancelLabel || 'Cancel',
        disableDeviceFallback: false, // Allow PIN/Pattern fallback
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication error',
      };
    }
  }

  /**
   * Prompt user to enable biometric authentication
   */
  static async promptEnableBiometric(): Promise<boolean> {
    const availability = await this.checkAvailability();
    return availability.isAvailable;
  }

  /**
   * Get biometric capability message for UI
   */
  static async getCapabilityMessage(): Promise<string> {
    const availability = await this.checkAvailability();

    if (!availability.hasHardware) {
      return 'Your device does not support biometric authentication.';
    }

    if (!availability.isEnrolled) {
      const typeName = this.getBiometricTypeName(availability.biometryType);
      return `Please enroll ${typeName} in your device settings first.`;
    }

    return '';
  }
}

export default BiometricAuth;
