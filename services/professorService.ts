import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';

// Types
export interface ProfessorDashboard {
  professor: {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    department: string;
    email: string;
    avatar: string | null;
  };
  stats: {
    modules: {
      total: number;
      activeThisSemester: number;
    };
    students: {
      total: number;
      atRiskAttendance: number;
      atRiskGrade: number;
    };
    attendance: {
      averageRate: number;
      trend: number;
      sessionsThisWeek: number;
      sessionsCompleted: number;
    };
    grades: {
      pendingEntry: number;
      pendingSubmission: number;
      averageClassGrade: number;
      trend: number;
    };
    pendingTasks: number;
  };
  todaySessions: TodaySession[];
  pendingTasks: PendingTask[];
  recommendationRequests: DashboardRecommendationRequest[];
  moduleStats: ModuleStat[];
  modulePerformance: ModulePerformance[];
  gradeDistribution: GradeDistribution[];
  weeklyActivity: WeeklyActivity[];
}

export interface TodaySession {
  id: string;
  startTime: string;
  endTime: string;
  module: {
    id: string;
    name: string;
    code: string;
    program: string;
  };
  room: string;
  building: string;
  enrolledCount: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  attendance: {
    present: number;
    late: number;
    absent: number;
  };
  completedAt: string | null;
}

export interface PendingTask {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  deadline: string | null;
  url: string;
}

export interface DashboardRecommendationRequest {
  id: string;
  student: {
    id: string;
    name: string;
    avatar: string | null;
  };
  module: string;
  purpose: 'JOB' | 'MASTERS' | 'PHD' | 'SCHOLARSHIP';
  requestedAt: string;
}

export interface ModuleStat {
  moduleId: string;
  moduleName: string;
  program: string;
  attendanceRate: number;
  averageGrade: number;
  atRiskCount: number;
}

export interface ModulePerformance {
  moduleCode: string;
  moduleName: string;
  attendanceRate: number;
  averageGrade: number;
  studentCount: number;
}

export interface GradeDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WeeklyActivity {
  week: string;
  sessions: number;
  avgAttendance: number;
  studentsPresent: number;
}

export interface Session {
  id: string;
  moduleCode: string;
  moduleName: string;
  title: string;
  type: 'CM' | 'TD' | 'TP';
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  group: string;
  status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  attendanceCount?: number;
  totalStudents?: number;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  program: string;
  semester: number;
  credits: number;
  enrolledCount: number;
  attendanceRate: number;
  averageGrade: number;
  sessionsCompleted: number;
  totalSessions: number;
  gradeStatus: {
    cc: string;
    tp: string;
    exam: string;
  };
  nextSession: any | null;
}

export interface ModuleDetail {
  module: {
    id: string;
    code: string;
    name: string;
    program: string;
    department: string;
    semester: number;
    credits: number;
    academicYear: string;
    coordinator: {
      name: string;
      email: string;
    };
    weights: {
      cc: number;
      tp: number;
      exam: number;
    };
  };
  stats: {
    enrolledCount: number;
    attendanceRate: number;
    averageGrade: number;
    sessionsCompleted: number;
    totalSessions: number;
    atRiskAttendance: number;
    atRiskGrade: number;
  };
  attendanceTrend: any[];
  students: Array<{
    id: string;
    name: string;
    cne: string;
    avatar: string | null;
    attendanceRate: number;
    grades: {
      cc: number;
      tp: number;
      exam: number;
      average: number;
    };
    atRisk: boolean;
  }>;
}

export interface QRCodeData {
  value: string;
  code: string;
  expiresAt: string;
  refreshInterval: number;
  sessionId: number;
  expirationMinutes: number | null;
  qrCodeImage: string;
}

export interface ActiveSession {
  session: {
    id: string;
    module: { 
      id: string;
      code: string; 
      name: string;
      program: string | null;
    };
    room: string;
    startedAt: string;
    windowEndsAt: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  };
  qrCode: {
    value: string;
    code: string;
    expiresAt: string;
    refreshInterval: number;
  };
  liveAttendance: {
    present: number;
    late: number;
    absent: number;
    total: number;
    rate: number;
  };
  recentScans: Array<{
    studentId: string;
    studentName: string;
    studentCode: string;
    scannedAt: string;
    status: 'PRESENT' | 'LATE';
  }>;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentCode: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  markedAt?: string;
  location?: { latitude: number; longitude: number };
}

export interface GradeType {
  type: 'CC' | 'TP' | 'EXAM';
  weight: number;
  label: string;
}

export interface GradeEntry {
  id: string;
  name: string;
  cne: string;
  grade?: number;
  note?: string;
}

export interface GradesData {
  module: {
    id: string;
    code: string;
    name: string;
    program: string;
  };
  gradeType: 'CC' | 'TP' | 'EXAM';
  status: string | null;
  deadline: string | null;
  lastSavedAt: string | null;
  students: GradeEntry[];
  summary: any | null;
}

export interface RecommendationRequest {
  id: string;
  student: {
    id: string;
    name: string;
    code: string;
    email: string;
  };
  module: {
    id: string;
    code: string;
    name: string;
  };
  purpose: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
}

export interface RecommendationsData {
  pending: RecommendationRequest[];
  approved: RecommendationRequest[];
  rejected: RecommendationRequest[];
}

/**
 * Professor Service - Handles all professor-related API calls
 */
class ProfessorServiceClass extends BaseApiService {
  private static readonly BASE_PATH = '/professors/me';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
  }

  // ============================================
  // Dashboard
  // ============================================
  async getDashboard(): Promise<ProfessorDashboard> {
    const response = await this.get<ProfessorDashboard>(`${ProfessorServiceClass.BASE_PATH}/dashboard`);
    return response.data!;
  }

  // ============================================
  // Modules
  // ============================================
  async getModules(): Promise<{ modules: Module[] }> {
    const response = await this.get<{ modules: Module[] }>(`${ProfessorServiceClass.BASE_PATH}/modules`);
    return response.data!;
  }

  async getModuleDetail(moduleId: string): Promise<ModuleDetail> {
    const response = await this.get<ModuleDetail>(`${ProfessorServiceClass.BASE_PATH}/modules/${moduleId}`);
    return response.data!;
  }

  // ============================================
  // Sessions
  // ============================================
  async getTodaySessions(): Promise<{ date: string; sessions: TodaySession[] }> {
    const response = await this.get<{ date: string; sessions: TodaySession[] }>(`${ProfessorServiceClass.BASE_PATH}/sessions/today`);
    return response.data!;
  }

  async getWeekSessions(startDate?: string): Promise<{ startDate: string; endDate: string; sessions: TodaySession[] }> {
    const url = startDate 
      ? `${ProfessorServiceClass.BASE_PATH}/sessions/week?start=${startDate}`
      : `${ProfessorServiceClass.BASE_PATH}/sessions/week`;
    const response = await this.get<{ startDate: string; endDate: string; sessions: TodaySession[] }>(url);
    return response.data!;
  }

  async getSessionHistory(): Promise<Session[]> {
    const response = await this.get<Session[]>(`${ProfessorServiceClass.BASE_PATH}/sessions/history`);
    return response.data!;
  }

  async getWeeklySchedule(): Promise<any> {
    const response = await this.get<any>(`${ProfessorServiceClass.BASE_PATH}/schedule`);
    return response.data!;
  }

  // ============================================
  // Session Management
  // ============================================
  async startSession(
    sessionId: string,
    location?: { latitude: number; longitude: number; accuracy?: number }
  ): Promise<{
    id: number;
    qrCode: string;
    qrCodeImage: string;
    qrExpiresAt: string;
    moduleCode: string;
    moduleName: string;
    startedAt: string;
    totalStudents: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
  }> {
    const requestBody = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      geofenceRadius: 500,
      qrExpirationMinutes: 15
    };
    const response = await this.post<{
      id: number;
      qrCode: string;
      qrCodeImage: string;
      qrExpiresAt: string;
      moduleCode: string;
      moduleName: string;
      startedAt: string;
      totalStudents: number;
      presentCount: number;
      lateCount: number;
      absentCount: number;
    }>(`/sessions/${sessionId}/start`, requestBody);
    return response.data!;
  }

  async getActiveSessions(): Promise<TodaySession[]> {
    // Get today's sessions and filter for ACTIVE status
    const todayData = await this.getTodaySessions();
    return todayData.sessions.filter(session => session.status === 'ACTIVE');
  }

  async getActiveSession(sessionId: string): Promise<ActiveSession> {
    const response = await this.get<ActiveSession>(`/sessions/${sessionId}/active`);
    return response.data!;
  }

  async getQRCode(sessionId: string): Promise<QRCodeData> {
    const response = await this.get<QRCodeData>(`/sessions/${sessionId}/qr`);
    return response.data!;
  }

  async refreshQRCode(
    sessionId: string,
    extendWindow: boolean = false
  ): Promise<QRCodeData> {
    const response = await this.post<QRCodeData>(`/sessions/${sessionId}/refresh-qr`, {
      extendWindow,
    });
    return response.data!;
  }

  async getLiveAttendance(sessionId: string): Promise<{
    total: number;
    scanned: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
    records: Array<{
      studentId: string;
      studentName: string;
      studentCode: string;
      scannedAt: string | null;
    }>;
  }> {
    const response = await this.get<{
      total: number;
      scanned: number;
      present: number;
      late: number;
      absent: number;
      rate: number;
      records: Array<{
        studentId: string;
        studentName: string;
        studentCode: string;
        scannedAt: string | null;
      }>;
    }>(`/sessions/${sessionId}/attendance`);
    return response.data!;
  }

  async endSession(sessionId: string): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/sessions/${sessionId}/end`);
    return response.data!;
  }

  async getSessionReport(sessionId: string): Promise<{
    session: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      module: {
        id: number;
        code: string;
        name: string;
        masterName: string;
      };
      room: string;
      duration: string;
    };
    summary: {
      present: number;
      late: number;
      absent: number;
      total: number;
      rate: number;
    };
    attendanceList: Array<{
      id: string;
      studentName: string;
      studentCode: string;
      status: string;
      scannedAt: string | null;
      justificationId: string | null;
    }>;
  }> {
    const response = await this.get<{
      session: {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        module: {
          id: number;
          code: string;
          name: string;
          masterName: string;
        };
        room: string;
        duration: string;
      };
      summary: {
        present: number;
        late: number;
        absent: number;
        total: number;
        rate: number;
      };
      attendanceList: Array<{
        id: string;
        studentName: string;
        studentCode: string;
        status: string;
        scannedAt: string | null;
        justificationId: string | null;
      }>;
    }>(`/sessions/${sessionId}/report`);
    return response.data!;
  }

  async updateAttendance(
    sessionId: string,
    studentId: string,
    status: 'PRESENT' | 'LATE' | 'ABSENT',
    note?: string
  ): Promise<{ message: string }> {
    const response = await this.put<{ message: string }>(
      `/sessions/${sessionId}/attendance/${studentId}`,
      { status, note }
    );
    return response.data!;
  }

  async exportSessionReport(sessionId: string): Promise<{ url: string; filename: string }> {
    const response = await this.get<{ url: string; filename: string }>(`/sessions/${sessionId}/report/pdf`);
    return response.data!;
  }

  // ============================================
  // Grades
  // ============================================
  async getGradesOverview(): Promise<any> {
    const response = await this.get<any>(`${ProfessorServiceClass.BASE_PATH}/grades`);
    return response.data!;
  }

  async getGradeEntry(
    moduleId: string,
    gradeType: 'CC' | 'TP' | 'EXAM'
  ): Promise<GradesData> {
    const response = await this.get<GradesData>(`${ProfessorServiceClass.BASE_PATH}/grades/${moduleId}/${gradeType}`);
    return response.data!;
  }

  async saveGradesDraft(
    moduleId: string,
    gradeType: 'CC' | 'TP' | 'EXAM',
    grades: GradeEntry[]
  ): Promise<{ message: string; lastSavedAt: string }> {
    const response = await this.put<{ message: string; lastSavedAt: string }>(`${ProfessorServiceClass.BASE_PATH}/grades/${moduleId}/${gradeType}`, {
      grades,
    });
    return response.data!;
  }

  async submitGrades(
    moduleId: string,
    gradeType: 'CC' | 'TP' | 'EXAM',
    grades: GradeEntry[]
  ): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(
      `${ProfessorServiceClass.BASE_PATH}/grades/${moduleId}/${gradeType}/submit`,
      { grades }
    );
    return response.data!;
  }

  async exportGradesTemplate(
    moduleId: string,
    gradeType: 'CC' | 'TP' | 'EXAM'
  ): Promise<{ url: string; filename: string }> {
    const response = await this.get<{ url: string; filename: string }>(
      `${ProfessorServiceClass.BASE_PATH}/grades/${moduleId}/${gradeType}/export`
    );
    return response.data!;
  }

  async importGrades(
    moduleId: string,
    gradeType: 'CC' | 'TP' | 'EXAM',
    grades: GradeEntry[]
  ): Promise<{ message: string; importedCount: number }> {
    const response = await this.post<{ message: string; importedCount: number }>(
      `${ProfessorServiceClass.BASE_PATH}/grades/${moduleId}/${gradeType}/import`,
      { grades }
    );
    return response.data!;
  }

  // ============================================
  // Recommendations
  // ============================================
  async getRecommendations(): Promise<RecommendationsData> {
    const response = await this.get<RecommendationsData>(`${ProfessorServiceClass.BASE_PATH}/recommendations`);
    return response.data!;
  }

  async getRecommendationDetail(requestId: string): Promise<RecommendationRequest> {
    const response = await this.get<RecommendationRequest>(`${ProfessorServiceClass.BASE_PATH}/recommendations/${requestId}`);
    return response.data!;
  }

  async approveRecommendation(
    requestId: string
  ): Promise<{ message: string; letterUrl: string }> {
    const response = await this.post<{ message: string; letterUrl: string }>(
      `${ProfessorServiceClass.BASE_PATH}/recommendations/${requestId}/approve`
    );
    return response.data!;
  }

  async rejectRecommendation(requestId: string): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`${ProfessorServiceClass.BASE_PATH}/recommendations/${requestId}/reject`);
    return response.data!;
  }

  async previewRecommendation(
    requestId: string,
    template: string = 'STANDARD'
  ): Promise<any> {
    const response = await this.get<any>(
      `${ProfessorServiceClass.BASE_PATH}/recommendations/${requestId}/preview?template=${template}`
    );
    return response.data!;
  }

  // ============================================
  // Reports
  // ============================================
  async getAttendanceReport(params: {
    moduleId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await this.get<any>(`${ProfessorServiceClass.BASE_PATH}/reports/attendance?${queryParams}`);
    return response.data!;
  }

  async getGradesReport(moduleId: string, gradeType: 'CC' | 'TP' | 'EXAM'): Promise<any> {
    const response = await this.get<any>(
      `${ProfessorServiceClass.BASE_PATH}/reports/grades/${moduleId}/${gradeType}`
    );
    return response.data!;
  }

  async exportAttendanceReportPDF(params: { moduleId?: string }): Promise<{
    url: string;
    filename: string;
  }> {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await this.get<{ url: string; filename: string }>(
      `${ProfessorServiceClass.BASE_PATH}/reports/attendance/pdf?${queryParams}`
    );
    return response.data!;
  }

  async exportAttendanceReportCSV(params: { moduleId?: string }): Promise<{
    url: string;
    filename: string;
  }> {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await this.get<{ url: string; filename: string }>(
      `${ProfessorServiceClass.BASE_PATH}/reports/attendance/csv?${queryParams}`
    );
    return response.data!;
  }
}

export const professorService = new ProfessorServiceClass();
