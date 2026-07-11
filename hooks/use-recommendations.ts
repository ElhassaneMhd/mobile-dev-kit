import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentSelfService } from '@/services';
import type { RequestRecommendationDto } from '@/services';

// Query Keys
export const recommendationKeys = {
  all: ['recommendations'] as const,
  list: () => [...recommendationKeys.all, 'list'] as const,
  eligible: () => [...recommendationKeys.all, 'eligible'] as const,
};

/**
 * Fetch all recommendations
 */
export const useRecommendations = () => {
  return useQuery({
    queryKey: recommendationKeys.list(),
    queryFn: () => studentSelfService.getRecommendations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch eligible modules for recommendation request
 */
export const useEligibleModules = () => {
  return useQuery({
    queryKey: recommendationKeys.eligible(),
    queryFn: () => studentSelfService.getEligibleModules(),
    staleTime: 10 * 60 * 1000, // 10 minutes - eligibility rarely changes
  });
};

/**
 * Request new recommendation mutation
 */
export const useRequestRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestRecommendationDto) => studentSelfService.requestRecommendation(data),
    onSuccess: () => {
      // Invalidate recommendation queries
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
      // Also invalidate dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
