import { useQuery } from '@tanstack/react-query';
import { studentSelfService } from '@/services';

// Query Keys
export const gradeKeys = {
  all: ['grades'] as const,
  current: () => [...gradeKeys.all, 'current'] as const,
  transcript: () => [...gradeKeys.all, 'transcript'] as const,
  transcriptPdf: () => [...gradeKeys.all, 'transcript-pdf'] as const,
};

/**
 * Fetch current semester grades
 */
export const useCurrentGrades = () => {
  return useQuery({
    queryKey: gradeKeys.current(),
    queryFn: () => studentSelfService.getCurrentGrades(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch full transcript
 */
export const useTranscript = () => {
  return useQuery({
    queryKey: gradeKeys.transcript(),
    queryFn: () => studentSelfService.getTranscript(),
    staleTime: 10 * 60 * 1000, // 10 minutes - transcript rarely changes
  });
};

/**
 * Fetch transcript PDF URL
 */
export const useTranscriptPdf = () => {
  return useQuery({
    queryKey: gradeKeys.transcriptPdf(),
    queryFn: () => studentSelfService.downloadTranscriptPdf(),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Only fetch when manually triggered
  });
};
