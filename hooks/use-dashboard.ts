import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentSelfService } from '@/services';
import type { ChangePasswordDto } from '@/services/studentSelfService';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  sessions: () => [...dashboardKeys.all, 'sessions'] as const,
};

/**
 * Fetch student dashboard data
 * Includes: attendance, grades, absences, pending requests, today's schedule
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => studentSelfService.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Fetch active login sessions
 */
export const useLoginSessions = () => {
  return useQuery({
    queryKey: dashboardKeys.sessions(),
    queryFn: () => studentSelfService.getSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Change password mutation
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordDto) => studentSelfService.changePassword(data),
    onSuccess: () => {
      // Invalidate sessions after password change
      queryClient.invalidateQueries({ queryKey: dashboardKeys.sessions() });
    },
  });
};

/**
 * Revoke login session mutation
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => studentSelfService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.sessions() });
    },
  });
};
