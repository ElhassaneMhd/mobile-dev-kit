// Session Service - Real API implementation for sessions
// Connects to backend /api/v1/sessions endpoints

import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';

export interface SessionDetailResponse {
  id: number;
  module: {
    id: number;
    code: string;
    name: string;
  };
  enseignant: {
    id: number;
    firstName: string;
    lastName: string;
  };
  classroom: {
    id: number;
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
  };
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
  qrCodeToken?: string;
  qrCodeExpiresAt?: string;
  attendanceCount?: number;
}

export interface QRValidationResponse {
  id: number;
  // Flat structure - direct properties
  moduleId: number;
  moduleName: string;
  enseignantId: number;
  moduleCode: string;
  enseignantName: string;
  classroomId: number;
  classroomName: string;
  latitude: number;
  longitude: number;
  building?: string;
  geofenceRadius: number;

  // Time fields
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startedAt?: string;
  endedAt?: string;
  // Status
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
  // QR Code
  qrCode?: string;
  qrCodeImage?: string;
  qrExpired: boolean;
  qrExpiresAt?: string;
  qrRefreshCount?: number;
  // Attendance counts
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  // Timetable reference
  timetableEntryId: number;
  // Validation result
  valid?: boolean;
  message?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  startedByName?: string;
}

/**
 * Session Service - Handles all session-related API calls
 */
class SessionServiceClass extends BaseApiService {
  private static readonly BASE_PATH = '/sessions';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
  }

  /**
   * Get today's sessions for logged-in student
   */
  async getTodaySessionsForStudent(studentId: number): Promise<SessionDetailResponse[]> {
    try {
      const response = await this.get<SessionDetailResponse[]>(
        `${SessionServiceClass.BASE_PATH}/student/${studentId}/today`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      throw error;
    }
  }

  /**
   * Get all active sessions (for admin/coordinator view)
   */
  async getActiveSessions(): Promise<SessionDetailResponse[]> {
    try {
      const response = await this.get<SessionDetailResponse[]>(
        `${SessionServiceClass.BASE_PATH}/active`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  }

  /**
   * Validate QR code and get session details
   * Used by students before marking attendance
   */
  async validateQRCode(token: string): Promise<QRValidationResponse> {
    try {
      console.log('SessionService.validateQRCode called with token:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);
      
      if (!token || token === 'undefined' || token === 'null') {
        throw new Error('Invalid token provided to validateQRCode');
      }

      const url = `${SessionServiceClass.BASE_PATH}/validate-qr?token=${encodeURIComponent(token)}`;
      console.log('Calling API URL:', url);
      
      const response = await this.post<QRValidationResponse>(url);
      
      console.log('API Response:', response);
      
      if (!response.data) {
        // Check for error message from backend
        const errorMsg = (response as any).error?.message || 'Invalid or expired QR code';
        throw new Error(errorMsg);
      }
      return response.data;
    } catch (error) {
      console.error('Error validating QR code:', error);
      throw error;
    }
  }

  /**
   * Get session details by ID
   */
  async getSessionById(sessionId: number): Promise<SessionDetailResponse> {
    try {
      const response = await this.get<SessionDetailResponse>(
        `${SessionServiceClass.BASE_PATH}/${sessionId}`
      );
      if (!response.data) {
        throw new Error('Session not found');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  }

  /**
   * Format session time for display
   */
  formatSessionTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  /**
   * Check if session is currently active (within time window)
   */
  isSessionActive(session: SessionDetailResponse): boolean {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    
    return now >= start && now <= end && session.status === 'ACTIVE';
  }

  /**
   * Get time until session starts (in minutes)
   */
  getMinutesUntilSession(startTime: string): number {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();
    return Math.floor(diffMs / 60000);
  }

  /**
   * Get next upcoming session from list
   */
  getNextSession(sessions: SessionDetailResponse[]): SessionDetailResponse | null {
    const now = new Date();
    
    const upcomingSessions = sessions
      .filter(s => new Date(s.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  }
}

// Export singleton instance
export const SessionService = new SessionServiceClass();
