// Student Self-Service API
// Handles all /students/me/* endpoints from StudentSelfServiceController

import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';
import type { AttendanceRecord } from './attendanceService';

// ============ Type Definitions ============

// Timetable types specific to student self-service API
export interface TimetableAttendance {
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'JUSTIFIED';
  scannedAt: string | null;
}

export interface TimetableSession {
  id: string;
  date: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  attendance: TimetableAttendance | null;
}

export interface TimetableModule {
  id: string;
  code: string;
  name: string;
  color: string;
}

export interface TimetableProfessor {
  id: string;
  name: string;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number; // 1=Monday, 2=Tuesday, ..., 7=Sunday
  startTime: string; // ISO datetime or time string
  endTime: string; // ISO datetime or time string
  module: TimetableModule;
  type: 'LECTURE' | 'TD' | 'TP' | 'EXAM';
  room: string;
  building: string;
  professor: TimetableProfessor;
  session: TimetableSession | null;
}

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  program: string;
  semester: number;
}

// ============ Grades Types ============

export interface GradeWeights {
  cc: number;
  tp: number;
  exam: number;
}

export interface ModuleGrades {
  cc: number | null;
  tp: number | null;
  exam: number | null;
  final: number | null;
}

export interface ModuleGrade {
  id: string;
  code: string;
  name: string;
  credits: number;
  professor: string;
  weights: GradeWeights;
  grades: ModuleGrades;
  status: string;
  hasRetake: boolean;
  retakeGrade: number | null;
}

export interface SemesterInfo {
  number: number;
  academicYear: string;
  average: number;
  mention: string | null;
  totalCredits: number;
  earnedCredits: number;
  modulesGraded: number;
  totalModules: number;
}

export interface CurrentGradesResponse {
  semester: SemesterInfo;
  modules: ModuleGrade[];
}

// ============ Transcript Types ============

export interface TranscriptStudent {
  id: string;
  fullName: string;
  cne: string;
  program: string;
  enrollmentDate: string;
}

export interface TranscriptOverall {
  totalCredits: number;
  earnedCredits: number;
  cumulativeAverage: number;
  standing: string;
}

export interface TranscriptModuleGrade {
  code: string;
  name: string;
  credits: number;
  cc: number | null;
  tp: number | null;
  exam: number | null;
  finalGrade: number;
  status: string;
}

export interface TranscriptSemester {
  number: number;
  academicYear: string;
  average: number;
  totalCredits: number;
  earnedCredits: number;
  status: string;
  modules: TranscriptModuleGrade[];
}

export interface TranscriptResponse {
  student: TranscriptStudent;
  overall: TranscriptOverall;
  semesters: TranscriptSemester[];
}

export interface TranscriptPdfResponse {
  url: string;
}

export interface AttendanceStats {
  rate: number;
  trend: number;
  totalSessions: number;
  attendedSessions: number;
}

export interface GradeStats {
  semesterAverage: number | null;
  trend: number;
  modulesWithGrades: number;
  totalModules: number;
}

export interface AbsenceStats {
  total: number;
  justified: number;
  unjustified: number;
  pending: number;
  isWarning: boolean;
}

export interface PendingRequestsCount {
  justifications: number;
  recommendations: number;
}

export interface DashboardStats {
  attendance: AttendanceStats;
  grades: GradeStats;
  absences: AbsenceStats;
  pendingRequests: PendingRequestsCount;
}

export interface TodayScheduleItem {
  id: string;
  time: string;
  endTime: string;
  moduleName: string;
  moduleCode: string;
  room: string;
  professorName: string;
  status: string;
  attendedAt: string | null;
}

export interface RecentGrade {
  id: string;
  moduleName: string;
  gradeType: string;
  grade: number;
  maxGrade: number;
  postedAt: string;
  isNew: boolean;
}

export interface PendingJustification {
  id: string;
  absenceDate: string;
  status: string;
  submittedAt: string;
}

export interface PendingRecommendation {
  id: string;
  moduleName: string;
  professorName: string;
  status: string;
  submittedAt: string;
}

export interface DashboardPendingRequests {
  justifications: PendingJustification[];
  recommendations: PendingRecommendation[];
}

export interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
}

export interface AttendanceByModule {
  moduleCode: string;
  moduleName: string;
  rate: number;
  isBelowThreshold: boolean;
}

export interface GradeTrend {
  semester: string;
  average: number;
}

export interface AttendanceTrend {
  week: string;
  present: number;
  late: number;
  justified: number;
  absent: number;
}

export interface ChartData {
  attendanceByModule: AttendanceByModule[];
  gradeTrend: GradeTrend[];
  attendanceTrend: AttendanceTrend[];
}

export interface StudentDashboard {
  student: StudentInfo;
  stats: DashboardStats;
  todaySchedule: TodayScheduleItem[];
  recentGrades: RecentGrade[];
  pendingRequests: DashboardPendingRequests;
  alerts: DashboardAlert[];
  chartData: ChartData;
}

export interface TimetableResponse {
  week: string;
  entries: TimetableEntry[];
}

export interface AttendanceOverview {
  summary: AttendanceSummary;
  byModule: ModuleAttendanceSummary[];
  calendar: AttendanceCalendarEntry[];
}

export interface AttendanceSummary {
  rate: number;
  present: number;
  late: number;
  justified: number;
  absent: number;
  total: number;
}

export interface ModuleAttendanceSummary {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  rate: number;
  attended: number;
  total: number;
  isBelowThreshold: boolean;
}

export interface AttendanceCalendarEntry {
  date: string;
  sessions: AttendanceCalendarSession[];
}

export interface AttendanceCalendarSession {
  id: string;
  moduleName: string;
  status: string;
}

export interface ModuleAttendanceSummary {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  rate: number;
  attended: number;
  absentCount: number;
  unjustifiedCount: number;
}

export interface AttendanceHistoryParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  moduleId?: number;
  status?: 'PRESENT' | 'LATE' | 'ABSENT';
}

export interface PagedResponse<T> {
  records: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface UnjustifiedAbsence {
  id: number;
  sessionId: number;
  moduleCode: string;
  moduleName: string;
  date: string;
  startTime: string;
  canJustify: boolean;
  daysRemaining?: number;
}

export interface JustificationsResponse {
  justifications: any[];
  hasUnjustifiedAbsences?: boolean;
}

// ============ Recommendations Types ============

export interface RecommendationModule {
  id: string;
  name: string;
  code: string;
}

export interface RecommendationProfessor {
  id: string;
  name: string;
}

export interface Recommendation {
  id: string;
  module: RecommendationModule;
  professor: RecommendationProfessor;
  purpose: string;
  language: "fr" | "en"; // Language selected for PDF generation
  companyName: string | null;
  additionalNotes: string | null;
  deadline: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  letterUrl: string | null; // DEPRECATED - use documentService instead
}

export interface RecommendationsResponse {
  pending: Recommendation[];
  approved: Recommendation[];
  rejected: Recommendation[];
}

export interface EligibleModuleProfessor {
  id: string;
  name: string;
}

export interface EligibleModule {
  id: string;
  name: string;
  code: string;
  professor: EligibleModuleProfessor;
  grade: number;
  attendanceRate: number;
  isEligible: boolean;
  ineligibilityReason: string | null;
  cooldownUntil: string | null;
  requestsThisSemester: number;
}

export interface EligibleModulesResponse {
  modules: EligibleModule[];
}

export interface RequestRecommendationDto {
  moduleId: string;
  purpose: string;
  language: "fr" | "en"; // Required - Language for PDF generation
  companyName?: string;
  additionalNotes?: string;
  deadline?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginSession {
  id: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  os: string;
  lastActive: string;
  location: string;
  isCurrent: boolean;
}

// ============ Service Implementation ============

class StudentSelfService extends BaseApiService {
  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
    this.baseUrl = this.baseUrl + '/students/me';
    console.log('✅ [STUDENT SERVICE] Initialized with shared token storage');
  }

  // ============ Dashboard & Overview ============

  async getDashboard(): Promise<StudentDashboard> {
    console.log('📊 [DASHBOARD] Fetching dashboard from:', `${this.baseUrl}/dashboard`);
    const response = await this.get<StudentDashboard>('/dashboard');
    console.log('📊 [DASHBOARD] Response:', { success: response.success, hasData: !!response.data, error: response.error });
    if (!response.data) {
      console.error('📊 [DASHBOARD] Failed:', response.error);
      throw new Error(response.error?.message || 'Failed to get dashboard');
    }
    return response.data;
  }

  async getTimetable(week?: string): Promise<TimetableResponse> {
    const endpoint = week ? `/timetable?week=${week}` : '/timetable';
    const response = await this.get<TimetableResponse>(endpoint);
    if (!response.data) throw new Error('Failed to get timetable');
    return response.data;
  }

  // ============ Attendance ============

  async getAttendanceOverview(): Promise<AttendanceOverview> {
    const response = await this.get<AttendanceOverview>('/attendance/overview');
    if (!response.data) throw new Error('Failed to get attendance overview');
    return response.data;
  }

  async getAttendanceHistory(params: AttendanceHistoryParams = {}): Promise<PagedResponse<AttendanceRecord>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.moduleId !== undefined) queryParams.append('moduleId', params.moduleId.toString());
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/attendance/history${queryString ? `?${queryString}` : ''}`;

    const response = await this.get<PagedResponse<AttendanceRecord>>(endpoint);
    if (!response.data) throw new Error('Failed to get attendance history');
    return response.data;
  }

  async getUnjustifiedAbsences(): Promise<UnjustifiedAbsence[]> {
    const response = await this.get<UnjustifiedAbsence[]>('/attendance/unjustified');
    return response.data || [];
  }

  // ============ Grades ============

  /**
   * Get current semester grades
   * GET /students/me/grades
   */
  async getCurrentGrades(semesterId?: number): Promise<CurrentGradesResponse> {
    const endpoint = semesterId ? `/grades?semesterId=${semesterId}` : '/grades';
    const response = await this.get<CurrentGradesResponse>(endpoint);
    if (!response.data) throw new Error('Failed to get current grades');
    return response.data;
  }

  /**
   * Get academic transcript
   * GET /students/me/grades/transcript
   */
  async getTranscript(academicYear?: string): Promise<TranscriptResponse> {
    const endpoint = academicYear ? `/grades/transcript?academicYear=${academicYear}` : '/grades/transcript';
    const response = await this.get<TranscriptResponse>(endpoint);
    if (!response.data) throw new Error('Failed to get transcript');
    return response.data;
  }

  /**
   * Download transcript as PDF
   * GET /students/me/grades/transcript/pdf
   * Returns URL to download PDF
   */
  async downloadTranscriptPdf(academicYear?: string): Promise<TranscriptPdfResponse> {
    const endpoint = academicYear ? `/grades/transcript/pdf?academicYear=${academicYear}` : '/grades/transcript/pdf';
    const response = await this.get<TranscriptPdfResponse>(endpoint);
    if (!response.data) throw new Error('Failed to download transcript PDF');

    // Convert relative URL to absolute URL
    if (response.data.url && response.data.url.startsWith('/')) {
      // Remove /api/v1/students/me from baseUrl to get the root URL
      const rootUrl = this.baseUrl.split('/api/v1')[0];
      response.data.url = `${rootUrl}${response.data.url}`;
    }

    return response.data;
  }

  // ============ Justifications ============

  async getMyJustifications(): Promise<JustificationsResponse> {
    const response = await this.get<JustificationsResponse>('/justifications');
    return response.data || { justifications: [] };
  }

  async submitJustification(data: FormData): Promise<any> {
    console.log('📤 [studentSelfService] Submitting justification...');
    console.log('📤 [studentSelfService] Using FormData with entries:');
    
    // Log FormData entries for debugging
    try {
      // @ts-ignore - FormData entries exist in React Native
      for (let pair of data.entries()) {
        console.log(`  ${pair[0]}: ${typeof pair[1] === 'object' ? JSON.stringify(pair[1]) : pair[1]}`);
      }
    } catch (e) {
      console.log('  (Could not enumerate FormData entries)');
    }
    
    const response = await this.postFormData<any>('/justifications', data);
    console.log('✅ [studentSelfService] Justification submitted successfully');
    if (!response.data) throw new Error('Failed to submit justification');
    return response.data;
  }

  async getJustificationDetails(id: number): Promise<any> {
    const response = await this.get<any>(`/justifications/${id}`);
    if (!response.data) throw new Error('Failed to get justification details');
    return response.data;
  }

  // Note: Document downloads are handled by documentService
  // Use: import { documentService } from '@/services';
  //      const { blob, filename } = await documentService.downloadDocument(id);

  // ============ Recommendations ============

  /**
   * Get all recommendations (pending, approved, rejected)
   * GET /students/me/recommendations
   */
  async getRecommendations(): Promise<RecommendationsResponse> {
    const response = await this.get<RecommendationsResponse>('/recommendations');
    if (!response.data) {
      return { pending: [], approved: [], rejected: [] };
    }
    return response.data;
  }

  /**
   * Get modules eligible for recommendation
   * GET /students/me/recommendations/eligible
   */
  async getEligibleModules(): Promise<EligibleModulesResponse> {
    const response = await this.get<EligibleModulesResponse>('/recommendations/eligible');
    if (!response.data) {
      return { modules: [] };
    }
    return response.data;
  }

  /**
   * Request a new recommendation letter
   * POST /students/me/recommendations
   */
  async requestRecommendation(data: RequestRecommendationDto): Promise<Recommendation> {
    const response = await this.post<Recommendation>('/recommendations', data);
    if (!response.data) throw new Error('Failed to request recommendation');
    return response.data;
  }

  /**
   * Download recommendation letter
   * @deprecated Use documentService.downloadRecommendationLetter() instead
   * The backend now returns PDF directly via /api/v1/documents/{id} endpoint
   */
  async downloadRecommendation(id: string): Promise<{ url: string }> {
    throw new Error('This method is deprecated. Use documentService.downloadRecommendationLetter() instead');
  }

  // ============ Account Management ============

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await this.put<void>('/password', data);
  }

  async getSessions(): Promise<{ sessions: LoginSession[] }> {
    const response = await this.get<{ sessions: LoginSession[] }>('/sessions');
    return response.data || { sessions: [] };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete<void>(`/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<void> {
    await this.delete<void>('/sessions');
  }
}

// Export singleton instance
export const studentSelfService = new StudentSelfService();
export default studentSelfService;
