// User Profile hooks for Hodour
// Provides basic user profile management using auth service

import { useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { userService } from '../services/userService';

export const useUser = () => {
  const { state, dispatch } = useAppState();

  // Profile Management
  const getProfile = useCallback(async (forceRefresh = false) => {
    // Check if we already have user data from auth context
    const authUser = state.auth.user;
    if (!forceRefresh && authUser) {
      return { success: true, data: authUser };
    }

    // Return cached data if available and not forcing refresh
    if (!forceRefresh && state.userProfile.profile && !state.userProfile.isLoading) {
      return { success: true, data: state.userProfile.profile };
    }

    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      // Use user service to get current user profile
      // Note: Profile is typically returned with auth token
      const response = await userService.getProfile();
      if (response) {
        dispatch({ type: 'PROFILE_SUCCESS', payload: response });
        return { success: true, data: response };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: 'Failed to fetch profile' });
      return { success: false, error: 'Failed to fetch profile' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.userProfile.profile, state.userProfile.isLoading, state.auth.user]);

  const updateProfile = useCallback(async (profileData: any) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      // Note: Backend might not have a separate profile update endpoint
      // This may need to be implemented when backend adds profile management
      console.warn('Profile update not yet implemented in backend');

      // For now, just update local state
      const updatedUser = { ...state.auth.user, ...profileData };
      dispatch({ type: 'PROFILE_SUCCESS', payload: updatedUser });

      // Note: Not dispatching AUTH_SUCCESS as we're only updating profile, not auth state
      // The profile state is managed separately in userProfile reducer

      return { success: true, data: updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.auth.user, state.auth.tokens]);

  const clearError = useCallback(() => {
    dispatch({ type: 'PROFILE_CLEAR_ERROR' });
  }, [dispatch]);

  return {
    // State
    ...state.userProfile,
    profile: state.auth.user || state.userProfile.profile,
    // Profile Actions
    getProfile,
    updateProfile,
    // Utility Actions
    clearError,
  };
};

// Alias for backward compatibility
export const useUserProfile = useUser;
