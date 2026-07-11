// Context-based state management to replace Redux
// Provides similar functionality to Redux with RTK Query using React Context
// Hodour - Student Authentication & State Management

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authService as AuthService } from '../services/auth';
import { userService } from '../services/userService';
import { BiometricAuth } from '../utils/biometric';
import { PushNotificationService } from '../utils/notifications';
import type { RegisterRequest, UserProfile } from '../services/auth';
import type {
  UserResponse,
  TokenResponse,
  UserLoginRequest,
  UserRegistrationRequest,
  PasswordChangeRequest
} from '../types/auth';
import type { 
  Student,
  StudentStats,
  Master,
  StudentLoginRequest,
  StudentRegistrationRequest,
  StudentAuthResponse,
} from '../types/fsr-student';

// State interfaces
export interface AuthState {
  user: UserResponse | null;
  student: Student | null;
  master: Master | null;
  stats: StudentStats | null;
  tokens: TokenResponse | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  pushToken: string | null;
}


export interface UserProfileState {
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  userProfile: UserProfileState;
}

// Action types
type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserResponse; student: Student | null; master: Master | null; stats: StudentStats | null; tokens?: TokenResponse | null } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_SET_BIOMETRIC'; payload: boolean }
  | { type: 'AUTH_SET_PUSH_TOKEN'; payload: string }
  | { type: 'AUTH_UPDATE_USER'; payload: UserResponse }
  | { type: 'AUTH_UPDATE_STUDENT'; payload: Student };


type UserProfileAction = 
  | { type: 'PROFILE_LOADING'; payload: boolean }
  | { type: 'PROFILE_SUCCESS'; payload: any }
  | { type: 'PROFILE_ERROR'; payload: string }
  | { type: 'PROFILE_CLEAR_ERROR' };

type AppAction = AuthAction | UserProfileAction | { type: 'RESET_APP' };

// Initial states
const initialAuthState: AuthState = {
  user: null,
  student: null,
  master: null,
  stats: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  pushToken: null,
};


const initialUserProfileState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const initialState: AppState = {
  auth: initialAuthState,
  userProfile: initialUserProfileState,
};

// Reducers
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        student: action.payload.student,
        master: action.payload.master,
        stats: action.payload.stats,
        tokens: action.payload.tokens || state.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialAuthState,
      };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_SET_BIOMETRIC':
      return { ...state, biometricEnabled: action.payload };
    case 'AUTH_SET_PUSH_TOKEN':
      return { ...state, pushToken: action.payload };
    case 'AUTH_UPDATE_USER':
      return { ...state, user: action.payload };
    case 'AUTH_UPDATE_STUDENT':
      return { ...state, student: action.payload };
    default:
      return state;
  }
};


const userProfileReducer = (state: UserProfileState, action: UserProfileAction): UserProfileState => {
  switch (action.type) {
    case 'PROFILE_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'PROFILE_SUCCESS':
      return { ...state, profile: action.payload, isLoading: false, error: null };
    case 'PROFILE_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'PROFILE_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'RESET_APP') {
    return initialState;
  }

  return {
    auth: authReducer(state.auth, action as AuthAction),
    userProfile: userProfileReducer(state.userProfile, action as UserProfileAction),
  };
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initialize auth state on app start
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      try {
        // Check if user is already authenticated
        const isAuth = await AuthService.isAuthenticated();
        
        if (isAuth) {
          // Get cached user data from secure storage
          const cachedUser = await AuthService.getCachedUser();
          if (cachedUser) {
            // Transform cached UserProfile to app state structure
            const user: UserResponse = {
              id: cachedUser.id,
              email: cachedUser.email,
              phone: cachedUser.phone || undefined,
              first_name: cachedUser.first_name,
              last_name: cachedUser.last_name,
              role: cachedUser.role.toLowerCase(),
              is_verified: cachedUser.email_verified,
              email_verified: cachedUser.email_verified,
              phone_verified: !!cachedUser.phone,
              preferred_language: 'fr',
              rating_average: null,
              rating_count: 0,
            };

            const student: Student = {
              id: cachedUser.id,
              user_id: cachedUser.id,
              master_id: 0,
              email: cachedUser.email,
              first_name: cachedUser.first_name,
              last_name: cachedUser.last_name,
              student_number: '',
              phone: cachedUser.phone,
              enrollment_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: {
                user,
                student,
                master: null,
                stats: null,
                tokens: null
              }
            });
          }
        }
        
        // Check biometric settings from AuthService
        const biometricEnabled = await AuthService.getBiometricEnabled();
        if (biometricEnabled) {
          dispatch({ type: 'AUTH_SET_BIOMETRIC', payload: true });
        }
        
        // Initialize push notifications
        const hasPermissions = await PushNotificationService.hasPermissions();
        if (hasPermissions) {
          const tokenData = await PushNotificationService.getPushToken();
          if (tokenData) {
            dispatch({ type: 'AUTH_SET_PUSH_TOKEN', payload: tokenData.token });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch({ type: 'AUTH_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app state
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

// Auth hooks (equivalent to Redux hooks)
export const useAuth = () => {
  const { state, dispatch } = useAppState();

  // Login with email and password
  const login = useCallback(async (credentials: StudentLoginRequest) => {
    console.log('🔐 [AUTH CONTEXT] Login action started:', { email: credentials.email });
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const response = await AuthService.login(credentials);
      console.log('✅ [AUTH CONTEXT] Login successful:', { 
        userId: response.userId, 
        email: response.email,
        role: response.role 
      });
      
      // Determine if user is a teacher/professor
      const isTeacher = response.role.toLowerCase() === 'enseignant' || 
                       response.role.toLowerCase() === 'teacher' || 
                       response.role.toLowerCase() === 'professor';
      
      // Only fetch profile for students, not for teachers
      let profile = null;
      if (!isTeacher) {
        profile = await userService.getProfile();
      }
      
      // Create user object from backend response
      const user: UserResponse = {
        id: response.userId,
        email: response.email,
        phone: profile?.phone,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: response.role.toLowerCase(),
        is_verified: response.emailVerified,
        email_verified: response.emailVerified,
        phone_verified: !!profile?.phone,
        preferred_language: 'fr',
        rating_average: null,
        rating_count: 0,
      };

      const tokens: TokenResponse = {
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
        token_type: response.tokenType,
        expires_in: response.expiresIn,
      };

      // Only create student object for actual students, not for teachers
      const student: Student | null = isTeacher ? null : {
        id: response.userId,
        user_id: response.userId,
        master_id: 0,
        email: response.email,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        student_number: '',
        phone: profile?.phone,
        enrollment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user,
          student,
          master: null, // Will be loaded later if needed
          stats: null,  // Will be loaded later if needed
          tokens 
        } 
      });
      
      return { success: true, role: response.role };
    } catch (error: any) {
      // Extract error message from ApiError object or Error instance
      const errorMessage = error?.message || (error instanceof Error ? error.message : 'Login failed');
      console.error('❌ [AUTH CONTEXT] Login failed:', {
        email: credentials.email,
        error,
        errorMessage,
        errorDetails: error,
      });
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Login with biometrics
  const loginWithBiometric = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      // Check if biometric is enabled
      const biometricEnabled = await AuthService.getBiometricEnabled();
      if (!biometricEnabled) {
        throw new Error('Biometric authentication is not enabled');
      }

      // Authenticate with biometrics
      const authResult = await BiometricAuth.authenticate(
        'Authenticate to login',
        'Cancel'
      );

      if (!authResult.success) {
        throw new Error(authResult.error || 'Biometric authentication failed');
      }

      // Try to restore session using refresh token
      const refreshToken = await AuthService.getStoredRefreshToken();
      if (!refreshToken) {
        // No valid session, disable biometric and ask user to login normally
        await AuthService.setBiometricEnabled(false);
        dispatch({ type: 'AUTH_SET_BIOMETRIC', payload: false });
        throw new Error('Session expired. Please login again to re-enable biometric authentication.');
      }

      // Refresh the session using the public method
      const refreshResponse = await AuthService.refreshToken(refreshToken);
      const profile = await userService.getProfile();

      if (!profile) {
        throw new Error('Failed to retrieve user profile');
      }

      // Transform response to app state format
      const student: Student = {
        id: refreshResponse.userId,
        user_id: refreshResponse.userId,
        master_id: 0,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        student_number: '',
        phone: profile.phone,
        enrollment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const userResponse: UserResponse = {
        id: refreshResponse.userId,
        email: profile.email,
        phone: profile.phone,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role.toLowerCase(),
        is_verified: profile.email_verified,
        email_verified: profile.email_verified,
        phone_verified: !!profile.phone,
        preferred_language: 'fr',
        rating_average: null,
        rating_count: 0,
      };

      const tokens: TokenResponse = {
        access_token: refreshResponse.accessToken,
        refresh_token: refreshResponse.refreshToken,
        token_type: refreshResponse.tokenType,
        expires_in: refreshResponse.expiresIn,
      };

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: userResponse,
          student,
          master: null,
          stats: null,
          tokens,
        },
      });

      return { success: true, role: profile.role };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Register new user - matching backend API
  const register = useCallback(async (userData: RegisterRequest) => {
    console.log('📝 [AUTH CONTEXT] Register action started:', {
      email: userData.email,
      role: userData.role,
    });
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const response = await AuthService.register(userData);
      console.log('✅ [AUTH CONTEXT] Registration successful:', {
        userId: response.userId,
        email: response.email,
        role: response.role,
      });
      
      // Transform backend response to app state
      const user: UserResponse = {
        id: response.userId,
        email: response.email,
        phone: userData.phone,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role.toLowerCase(),
        is_verified: response.emailVerified,
        email_verified: response.emailVerified,
        phone_verified: false,
        preferred_language: 'fr',
        rating_average: null,
        rating_count: 0,
      };

      const tokens: TokenResponse = {
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
        token_type: response.tokenType,
        expires_in: response.expiresIn,
      };

      const student: Student = {
        id: response.userId,
        user_id: response.userId,
        master_id: 0,
        email: response.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        student_number: '',
        phone: userData.phone,
        enrollment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          student,
          master: null,
          stats: null,
          tokens
        }
      });
      
      return { success: true };
    } catch (error: any) {
      // Extract error message from ApiError object or Error instance
      const errorMessage = error?.message || (error instanceof Error ? error.message : 'Registration failed');
      console.error('❌ [AUTH CONTEXT] Registration failed:', {
        email: userData.email,
        role: userData.role,
        error,
        errorMessage,
        errorDetails: error,
      });
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Logout
  const logout = useCallback(async () => {
    console.log('🚪 [AUTH CONTEXT] Logout action started');
    try {
      await AuthService.logout();
      console.log('✅ [AUTH CONTEXT] Logout successful');
      dispatch({ type: 'AUTH_LOGOUT' });
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Logout error:', { error });
      return { success: false, error: 'Logout failed' };
    }
  }, [dispatch]);

  // Enable/disable biometric authentication
  const toggleBiometric = useCallback(async (enable: boolean, credentials?: { email: string; password: string }) => {
    try {
      if (enable) {
        // Check if biometric hardware is available
        const availability = await BiometricAuth.checkAvailability();
        if (!availability.isAvailable) {
          throw new Error('Biometric authentication is not available on this device');
        }

        // If credentials provided (from login screen), save them
        if (credentials) {
          // Authenticate with biometrics first
          const authResult = await BiometricAuth.authenticate(
            'Authenticate to enable biometric login',
            'Cancel'
          );

          if (!authResult.success) {
            throw new Error(authResult.error || 'Biometric authentication failed');
          }

          // Save credentials securely (only when enabling from login)
          await AuthService.saveBiometricCredentials(credentials.email, credentials.password);
        }
        // If no credentials (already logged in), just enable the flag
        // Biometric will use refresh token for future logins
        
        // Enable biometric in auth service
        await AuthService.setBiometricEnabled(true);
        dispatch({ type: 'AUTH_SET_BIOMETRIC', payload: true });
      } else {
        // Disable biometric and clear credentials
        await AuthService.clearBiometricCredentials();
        await AuthService.setBiometricEnabled(false);
        dispatch({ type: 'AUTH_SET_BIOMETRIC', payload: false });
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle biometric';
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Change password
  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      await AuthService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword,
      });

      // Clear stored password credentials since password changed
      // Note: Biometric can still work with refresh token, but we clear saved password
      await AuthService.clearBiometricCredentials();

      dispatch({ type: 'AUTH_LOADING', payload: false });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Request password reset
  const forgotPassword = useCallback(async (email: string) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      await AuthService.forgotPassword(email);
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Reset password with code
  const resetPassword = useCallback(async (data: { code: string; newPassword: string }) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      await AuthService.resetPassword(data.code, data.newPassword, data.newPassword);
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  // Verify email
  const verifyEmail = useCallback(async (code: string) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      await AuthService.verifyEmail(code);
      
      // Update user state
      if (state.auth.user) {
        const updatedUser = { ...state.auth.user, email_verified: true };
        dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser });
      }
      
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch, state.auth.user]);

  // Update user profile
  const updateProfile = useCallback(async (data: Partial<Student>) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      // Transform Student fields to UserProfile format for API call
      const profileData = {
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
      };

      const updatedProfile = await userService.updateProfile(profileData);

      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      // Transform UserResponse back to Student format
      const updatedStudent: Student = {
        ...state.auth.student!,
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        phone: updatedProfile.phone,
        email: updatedProfile.email,
        updated_at: new Date().toISOString(),
      };

      // Update student state
      dispatch({ type: 'AUTH_UPDATE_STUDENT', payload: updatedStudent });

      // Update user state
      if (state.auth.user) {
        const updatedUser: UserResponse = {
          ...state.auth.user,
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          phone: updatedProfile.phone,
          email: updatedProfile.email,
        };
        dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser });
      }

      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true, data: updatedStudent };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch, state.auth.user, state.auth.student]);

  // Update profile photo
  const updateProfilePhoto = useCallback(async (photoUri: string) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const result = await userService.uploadProfilePhoto(photoUri);

      if (!result) {
        throw new Error('Photo upload not yet implemented');
      }

      // Update student state with new photo URL
      if (state.auth.student) {
        const updatedStudent: Student = {
          ...state.auth.student,
          profile_photo_url: result.photoUrl,
        };
        dispatch({ type: 'AUTH_UPDATE_STUDENT', payload: updatedStudent });
      }

      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Photo upload failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [dispatch, state.auth.student]);

  // Register push notification token
  const registerPushToken = useCallback(async (token: string) => {
    try {
      // Note: Backend push token registration not yet implemented
      dispatch({ type: 'AUTH_SET_PUSH_TOKEN', payload: token });
      return { success: true };
    } catch (error) {
      console.error('Failed to register push token:', error);
      return { success: false };
    }
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, [dispatch]);

  // Refresh auth state (useful after registration or manual token storage)
  const refreshAuthState = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      // Check if user is authenticated
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        // Get cached user data from secure storage
        const cachedUser = await AuthService.getCachedUser();
        if (cachedUser) {
          // Transform cached UserResponse to app state structure
          const user: UserResponse = {
            id: cachedUser.id,
            email: cachedUser.email,
            phone: cachedUser.phone,
            first_name: cachedUser.first_name,
            last_name: cachedUser.last_name,
            role: cachedUser.role.toLowerCase(),
            is_verified: cachedUser.email_verified,
            email_verified: cachedUser.email_verified,
            phone_verified: !!cachedUser.phone,
            preferred_language: 'fr',
            rating_average: null,
            rating_count: 0,
          };

          const student: Student = {
            id: cachedUser.id,
            user_id: cachedUser.id,
            master_id: 0,
            email: cachedUser.email,
            first_name: cachedUser.first_name,
            last_name: cachedUser.last_name,
            student_number: '',
            phone: cachedUser.phone,
            enrollment_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: {
              user,
              student,
              master: null,
              stats: null,
              tokens: null
            }
          });
        }
      }
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Failed to refresh auth state:', error);
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return { success: false };
    }
  }, [dispatch]);

  return {
    ...state.auth,
    login,
    loginWithBiometric,
    register,
    logout,
    toggleBiometric,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    updateProfilePhoto,
    registerPushToken,
    clearError,
    refreshAuthState,
  };
};





// User Profile hooks
export const useUserProfile = () => {
  const { state, dispatch } = useAppState();

  const getProfile = useCallback(async () => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      // TODO: Implement API call
      const profile = null;
      dispatch({ type: 'PROFILE_SUCCESS', payload: profile });
      return { success: true, data: profile };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (data: any) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      // TODO: Implement API call
      const updatedProfile = data;
      dispatch({ type: 'PROFILE_SUCCESS', payload: updatedProfile });
      return { success: true, data: updatedProfile };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'PROFILE_CLEAR_ERROR' });
  }, [dispatch]);

  return {
    ...state.userProfile,
    getProfile,
    updateProfile,
    clearError,
  };
};
