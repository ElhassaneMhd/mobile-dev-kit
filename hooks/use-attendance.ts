import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { AttendanceService, studentSelfService } from '@/services';
import type { MarkAttendanceRequest, AttendanceHistoryParams } from '@/services';

// Use the singleton service instance (exported from services/index.ts)

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  history: (params?: AttendanceHistoryParams) => [...attendanceKeys.all, 'history', params] as const,
  overview: () => [...attendanceKeys.all, 'overview'] as const,
  rate: (moduleId?: number) => [...attendanceKeys.all, 'rate', moduleId] as const,
  unjustified: () => [...attendanceKeys.all, 'unjustified'] as const,
  stats: () => [...attendanceKeys.all, 'stats'] as const,
};

/**
 * Fetch attendance overview
 */
export const useAttendanceOverview = () => {
  return useQuery({
    queryKey: attendanceKeys.overview(),
    queryFn: () => studentSelfService.getAttendanceOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch attendance history with pagination
 */
export const useAttendanceHistory = (params?: AttendanceHistoryParams) => {
  return useQuery({
    queryKey: attendanceKeys.history(params),
    queryFn: () => studentSelfService.getAttendanceHistory(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for attendance history
 */
export const useInfiniteAttendanceHistory = (params?: Omit<AttendanceHistoryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [...attendanceKeys.all, 'history-infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      studentSelfService.getAttendanceHistory({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.pagination.page + 1 < lastPage.pagination.totalPages;
      return hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch unjustified absences
 */
export const useUnjustifiedAbsences = () => {
  return useQuery({
    queryKey: attendanceKeys.unjustified(),
    queryFn: () => studentSelfService.getUnjustifiedAbsences(),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Mark attendance via QR scan mutation
 */
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkAttendanceRequest) => AttendanceService.markAttendance(data),
    onSuccess: () => {
      // Invalidate all attendance-related queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      // Also invalidate dashboard since it shows attendance stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
