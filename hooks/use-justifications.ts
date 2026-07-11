import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JustificationService, studentSelfService } from '@/services';
import type { CreateJustificationRequest, JustificationStatus } from '@/services';

// Use the singleton service instance (exported from services/index.ts)

// Query Keys
export const justificationKeys = {
  all: ['justifications'] as const,
  list: (status?: JustificationStatus) => [...justificationKeys.all, 'list', status] as const,
  detail: (id: number) => [...justificationKeys.all, 'detail', id] as const,
  disciplinary: () => [...justificationKeys.all, 'disciplinary'] as const,
};

/**
 * Fetch all justifications with optional status filter
 */
export const useJustifications = (status?: JustificationStatus) => {
  return useQuery({
    queryKey: justificationKeys.list(status),
    queryFn: () => JustificationService.getMyJustifications(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch single justification details
 */
export const useJustification = (id: number) => {
  return useQuery({
    queryKey: justificationKeys.detail(id),
    queryFn: () => JustificationService.getMyJustificationDetails(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only fetch if id is provided
  });
};

/**

 * Submit new justification mutation
 */
/**
 * Submit a new justification
 */
export const useSubmitJustification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => studentSelfService.submitJustification(data),
    onSuccess: () => {
      // Invalidate all justification queries
      queryClient.invalidateQueries({ queryKey: justificationKeys.all });
      // Also invalidate attendance and dashboard
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
