// React Query Hooks - Central Export
// All custom hooks for data fetching and mutations

// Dashboard & Profile
export {
  useDashboard,
  useLoginSessions,
  useChangePassword,
  useRevokeSession,
  dashboardKeys,
} from './use-dashboard';

// Attendance
export {
  useAttendanceOverview,
  useAttendanceHistory,
  useInfiniteAttendanceHistory,
  useUnjustifiedAbsences,
  useMarkAttendance,
  attendanceKeys,
} from './use-attendance';

// Grades
export {
  useCurrentGrades,
  useTranscript,
  useTranscriptPdf,
  gradeKeys,
} from './use-grades';

// Justifications
export {
  useJustifications,
  useJustification,
  useSubmitJustification,
  justificationKeys,
} from './use-justifications';

// Recommendations
export {
  useRecommendations,
  useEligibleModules,
  useRequestRecommendation,
  recommendationKeys,
} from './use-recommendations';

// Timetable
export {
  useActiveTimetable,
  useTimetableDetail,
  useSessionDetail,
  useWeeklySchedule,
  useTimetableFromDashboard,
  timetableKeys,
} from './use-timetable';

// Professor (for professor portal)
export {
  useProfessorDashboard,
  useProfessorModules,
  useModuleDetail,
  useTodaySessions,
  useWeekSessions,
  useSessionHistory,
  useActiveSessions,
  useActiveSession,
  useSessionQRCode,
  useLiveAttendance,
  useProfessorRecommendations,
  useRecommendationDetail,
  useStartSession,
  useEndSession,
  useApproveRecommendation,
  useRejectRecommendation,
  useSessionReport,
  useGradeEntry,
  useSaveGradesDraft,
  useSubmitGrades,
  professorKeys,
} from './use-professor';

// Notifications
export {
  useUnreadCount,
  useNotifications,
  useInfiniteNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearReadNotifications,
  notificationKeys,
} from './use-notifications';

// Other existing hooks
export { useAppTheme } from './useAppTheme';
export { useAuth } from './useAuth';
export { useNetworkStatus } from './useNetworkStatus';
export { useLocationTracking } from './useLocationTracking';
export { useWebSocket } from './useWebSocket';
export { useUser } from './useUser';
export { useUserProfile } from './useUserProfile';
export { useFirstTimeLogin } from './useFirstTimeLogin';
export { useAppSection } from './useAppSection';
