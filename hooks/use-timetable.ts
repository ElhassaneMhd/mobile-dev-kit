import { useQuery } from '@tanstack/react-query';
import { TimetableService, studentSelfService } from '@/services';

// Use the singleton service instance (exported from services/index.ts)

// Query Keys
export const timetableKeys = {
  all: ['timetable'] as const,
  dashboard: () => [...timetableKeys.all, 'dashboard'] as const,
  weekly: (week?: string) => [...timetableKeys.all, 'weekly', week] as const,
  active: (studentId: number) => [...timetableKeys.all, 'active', studentId] as const,
  detail: (timetableId: number) => [...timetableKeys.all, 'detail', timetableId] as const,
  session: (sessionId: number) => [...timetableKeys.all, 'session', sessionId] as const,
};

/**
 * Fetch student's active timetable
 */
export const useActiveTimetable = (studentId: number) => {
  return useQuery({
    queryKey: timetableKeys.active(studentId),
    queryFn: () => TimetableService.getStudentActiveTimetable(studentId),
    staleTime: 30 * 60 * 1000, // 30 minutes - timetables don't change often
    enabled: !!studentId,
  });
};

/**
 * Fetch timetable detail with all entries
 */
export const useTimetableDetail = (timetableId: number) => {
  return useQuery({
    queryKey: timetableKeys.detail(timetableId),
    queryFn: () => TimetableService.getTimetableDetail(timetableId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!timetableId,
  });
};

/**
 * Fetch specific session from timetable
 * Combines active timetable + detail to find specific entry
 */
export const useSessionDetail = (studentId: number, sessionId: number) => {
  const { data: timetable } = useActiveTimetable(studentId);
  const { data: detail, isLoading, error } = useTimetableDetail(timetable?.id || 0);

  const session = detail?.entries.find(e => e.id === sessionId) || null;

  return {
    data: session,
    isLoading,
    error,
    timetable,
  };
};

/**
 * Fetch weekly schedule/timetable for a specific week
 * @param week - Optional week parameter (format: YYYY-Www, e.g., "2024-W12")
 */
export const useWeeklySchedule = (week?: string) => {
  return useQuery({
    queryKey: timetableKeys.weekly(week),
    queryFn: () => studentSelfService.getTimetable(week),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Fetch timetable from dashboard service
 * Note: Many timetable methods don't exist, use dashboard timetable instead
 */
export const useTimetableFromDashboard = () => {
  return useQuery({
    queryKey: timetableKeys.dashboard(),
    queryFn: () => studentSelfService.getTimetable(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
