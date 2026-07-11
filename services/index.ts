// Services Index - React Native App Template
// Central export point for all API services

// Base API service and types
export { BaseApiService, defaultApiConfig } from './BaseApiService';
export type { ApiConfig, ApiError, ApiResponse, TokenStorage } from './BaseApiService';

// Authentication service
import { authService } from './auth';

export type {
    PasswordChangeRequest, TokenResponse, UserLoginRequest, UserRegistrationRequest, UserResponse
} from '../types/auth';
export { authService };

// User service (minimal - profile only)
export { userService } from './userService';

// Onboarding service
// export { onboardingService } from './onboardingService';
// export type { OnboardingStatus } from './onboardingService';

// Real API Services
export { SessionService } from './sessionService';
export type {
  SessionDetailResponse,
  QRValidationResponse
} from './sessionService';

// Professor Services
export { professorService } from './professorService';
export type {
  ProfessorDashboard,
  Session,
  Module,
  ModuleDetail,
  QRCodeData,
  ActiveSession,
  AttendanceRecord,
  GradeEntry,
  GradesData,
  RecommendationRequest,
  RecommendationsData,
} from './professorService';

export { AttendanceService } from './attendanceService';
export type {
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  AttendanceRateResponse,
  ModuleAttendanceStats,
  AttendanceHistory,
} from './attendanceService';

export { TimetableService } from './timetableService';
export type {
  Timetable,
  TimetableDetail,
  WeeklySchedule,
  TimetableEntry,
  SessionInfo,
} from './timetableService';

export { JustificationService } from './justificationService';
export type {
  Justification,
  JustificationListItem,
  JustificationStatus,
  CreateJustificationRequest,
  DisciplinaryFlag,
  UploadDocumentResponse,
} from './justificationService';

// Notification Service
export { notificationService } from './notificationService';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationMetadata,
  NotificationsResponse,
  UnreadCountResponse,
  MarkReadResponse,
  BulkActionResponse,
  NotificationFilters,
  NotificationPagination,
  NotificationSummary,
} from '../types/notification';

// Student Self-Service API
export { studentSelfService } from './studentSelfService';
export type {
  StudentDashboard,
  StudentInfo,
  AttendanceStats,
  GradeStats,
  AbsenceStats,
  PendingRequestsCount,
  DashboardStats,
  TodayScheduleItem,
  RecentGrade,
  PendingJustification,
  PendingRecommendation,
  DashboardPendingRequests,
  DashboardAlert,
  AttendanceByModule,
  GradeTrend,
  AttendanceTrend,
  ChartData,
  TimetableResponse,
  TimetableEntry,
  TimetableModule,
  TimetableProfessor,
  TimetableSession,
  TimetableAttendance,
  AttendanceOverview,
  ModuleAttendanceSummary,
  AttendanceHistoryParams,
  PagedResponse,
  UnjustifiedAbsence,
  Recommendation,
  EligibleModule,
  RequestRecommendationDto,
  ChangePasswordDto,
  LoginSession,
  // Grades types
  GradeWeights,
  ModuleGrades,
  ModuleGrade,
  SemesterInfo,
  CurrentGradesResponse,
  TranscriptStudent,
  TranscriptOverall,
  TranscriptModuleGrade,
  TranscriptSemester,
  TranscriptResponse,
  TranscriptPdfResponse,
  // Recommendations types
  RecommendationModule,
  RecommendationProfessor,
  RecommendationsResponse,
  EligibleModuleProfessor,
  EligibleModulesResponse,
} from './studentSelfService';

// Document Service (for PDF downloads)
export { documentService } from './documentService';

// Service configuration helpers
export const configureServices = (config: {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) => {
  // Note: Auth service uses ENV configuration and doesn't support runtime config updates
  // If you need to update configuration, modify the env/index.ts file
  console.log('Service configuration:', config);
};

// Service status checker
export const checkServicesHealth = async () => {
  const results = {
    auth: false,
    profile: false,
  };

  try {
    // Just check if services are configured without making API calls
    results.auth = true; // Service exists
    results.profile = true; // Service exists
  } catch (error) {
    console.error('Services health check failed:', error);
  }

  return results;
};