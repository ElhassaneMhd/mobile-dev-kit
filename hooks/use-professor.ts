import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professorService } from '@/services';

// Query Keys for professor data
export const professorKeys = {
  all: ['professor'] as const,
  dashboard: () => [...professorKeys.all, 'dashboard'] as const,
  modules: () => [...professorKeys.all, 'modules'] as const,
  moduleDetail: (id: string) => [...professorKeys.all, 'module', id] as const,
  sessions: () => [...professorKeys.all, 'sessions'] as const,
  todaySessions: () => [...professorKeys.sessions(), 'today'] as const,
  weekSessions: (startDate?: string) => [...professorKeys.sessions(), 'week', startDate] as const,
  sessionHistory: () => [...professorKeys.sessions(), 'history'] as const,
  activeSessions: () => [...professorKeys.sessions(), 'active'] as const,
  activeSession: (id: string) => [...professorKeys.sessions(), 'active', id] as const,
  qrCode: (sessionId: string) => [...professorKeys.all, 'qr', sessionId] as const,
  liveAttendance: (sessionId: string) => [...professorKeys.all, 'attendance', 'live', sessionId] as const,
  recommendations: () => [...professorKeys.all, 'recommendations'] as const,
  recommendationDetail: (id: string) => [...professorKeys.recommendations(), id] as const,
  grades: () => [...professorKeys.all, 'grades'] as const,
  gradeEntry: (moduleId: string, evaluationType: string) => [...professorKeys.grades(), moduleId, evaluationType] as const,
  sessionReport: (sessionId: string) => [...professorKeys.all, 'report', sessionId] as const,
};

/**
 * Hook to fetch professor dashboard data
 */
export const useProfessorDashboard = () => {
  return useQuery({
    queryKey: professorKeys.dashboard(),
    queryFn: () => professorService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard shows live stats
  });
};

/**
 * Hook to fetch professor's modules
 */
export const useProfessorModules = () => {
  return useQuery({
    queryKey: professorKeys.modules(),
    queryFn: () => professorService.getModules(),
    staleTime: 10 * 60 * 1000, // 10 minutes - modules don't change often
  });
};

/**
 * Hook to fetch module detail
 */
export const useModuleDetail = (moduleId: string) => {
  return useQuery({
    queryKey: professorKeys.moduleDetail(moduleId),
    queryFn: () => professorService.getModuleDetail(moduleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!moduleId,
  });
};

/**
 * Hook to fetch today's sessions
 */
export const useTodaySessions = () => {
  return useQuery({
    queryKey: professorKeys.todaySessions(),
    queryFn: () => professorService.getTodaySessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

/**
 * Hook to fetch week sessions
 */
export const useWeekSessions = (startDate?: string) => {
  return useQuery({
    queryKey: professorKeys.weekSessions(startDate),
    queryFn: () => professorService.getWeekSessions(startDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch session history
 */
export const useSessionHistory = () => {
  return useQuery({
    queryKey: professorKeys.sessionHistory(),
    queryFn: () => professorService.getSessionHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch active sessions
 */
export const useActiveSessions = () => {
  return useQuery({
    queryKey: professorKeys.activeSessions(),
    queryFn: () => professorService.getActiveSessions(),
    staleTime: 30 * 1000, // 30 seconds - need real-time updates
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
  });
};

/**
 * Hook to fetch active session detail
 */
export const useActiveSession = (sessionId: string) => {
  return useQuery({
    queryKey: professorKeys.activeSession(sessionId),
    queryFn: () => professorService.getActiveSession(sessionId),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
    enabled: !!sessionId,
  });
};

/**
 * Hook to fetch QR code for a session
 */
export const useSessionQRCode = (sessionId: string) => {
  return useQuery({
    queryKey: professorKeys.qrCode(sessionId),
    queryFn: () => professorService.getQRCode(sessionId),
    staleTime: 30 * 1000, // 30 seconds - QR codes expire
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    enabled: !!sessionId,
  });
};

/**
 * Hook to fetch live attendance for a session
 */
export const useLiveAttendance = (sessionId: string) => {
  return useQuery({
    queryKey: professorKeys.liveAttendance(sessionId),
    queryFn: () => professorService.getLiveAttendance(sessionId),
    staleTime: 10 * 1000, // 10 seconds - live data
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    enabled: !!sessionId,
  });
};

/**
 * Hook to fetch professor's recommendations data
 */
export const useProfessorRecommendations = () => {
  return useQuery({
    queryKey: professorKeys.recommendations(),
    queryFn: () => professorService.getRecommendations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch recommendation detail
 */
export const useRecommendationDetail = (requestId: string) => {
  return useQuery({
    queryKey: professorKeys.recommendationDetail(requestId),
    queryFn: () => professorService.getRecommendationDetail(requestId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!requestId,
  });
};

/**
 * Mutation to start a session
 */
export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => professorService.startSession(sessionId),
    onSuccess: () => {
      // Invalidate all session-related queries
      queryClient.invalidateQueries({ queryKey: professorKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: professorKeys.dashboard() });
    },
  });
};

/**
 * Mutation to end a session
 */
export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => professorService.endSession(sessionId),
    onSuccess: () => {
      // Invalidate all session-related queries
      queryClient.invalidateQueries({ queryKey: professorKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: professorKeys.dashboard() });
    },
  });
};

/**
 * Mutation to approve a recommendation
 */
export const useApproveRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => professorService.approveRecommendation(requestId),
    onSuccess: () => {
      // Invalidate recommendations queries
      queryClient.invalidateQueries({ queryKey: professorKeys.recommendations() });
    },
  });
};

/**
 * Mutation to reject a recommendation
 */
export const useRejectRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => professorService.rejectRecommendation(requestId),
    onSuccess: () => {
      // Invalidate recommendations queries
      queryClient.invalidateQueries({ queryKey: professorKeys.recommendations() });
    },
  });
};

/**
 * Hook to fetch session attendance report
 */
export const useSessionReport = (sessionId: string) => {
  return useQuery({
    queryKey: professorKeys.sessionReport(sessionId),
    queryFn: () => professorService.getSessionReport(sessionId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!sessionId,
  });
};

/**
 * Hook to fetch grade entry for a module and evaluation type
 */
export const useGradeEntry = (moduleId: number, evaluationType: 'CC' | 'TP' | 'EXAM') => {
  return useQuery({
    queryKey: professorKeys.gradeEntry(String(moduleId), evaluationType),
    queryFn: () => professorService.getGradeEntry(String(moduleId), evaluationType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!moduleId,
  });
};

/**
 * Mutation to save grades draft
 */
export const useSaveGradesDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, evaluationType, grades }: { 
      moduleId: number; 
      evaluationType: 'CC' | 'TP' | 'EXAM'; 
      grades: any[] 
    }) => professorService.saveGradesDraft(String(moduleId), evaluationType, grades),
    onSuccess: (_, variables) => {
      // Invalidate the specific grade entry query
      queryClient.invalidateQueries({ 
        queryKey: professorKeys.gradeEntry(String(variables.moduleId), variables.evaluationType) 
      });
    },
  });
};

/**
 * Mutation to submit final grades
 */
export const useSubmitGrades = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, evaluationType, grades }: { 
      moduleId: number; 
      evaluationType: 'CC' | 'TP' | 'EXAM'; 
      grades: any[] 
    }) => professorService.submitGrades(String(moduleId), evaluationType, grades),
    onSuccess: (_, variables) => {
      // Invalidate the specific grade entry query and grades list
      queryClient.invalidateQueries({ queryKey: professorKeys.grades() });
      queryClient.invalidateQueries({ 
        queryKey: professorKeys.gradeEntry(String(variables.moduleId), variables.evaluationType) 
      });
    },
  });
};
