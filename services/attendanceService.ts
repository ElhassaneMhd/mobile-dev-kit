// Attendance Service - Real API implementation for attendance marking
// Connects to backend attendance endpoints

import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { LIGHT_COLORS } from '@/constants/theme';
import { sharedTokenStorage } from './tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MarkAttendanceRequest {
  qrToken: string;
  latitude: number;
  longitude: number;
  biometricVerified?: boolean;
  sessionId?: number;
  scannedAt?: string;
}

export interface MarkAttendanceResponse {
  attendanceId: number;
  sessionId: number;
  studentId: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  scannedAt: string;
  scanLatitude: number;
  scanLongitude: number;
  biometricVerified: boolean;
  distanceFromClassroom: number;
  message: string;
  moduleName: string;
  moduleCode: string;
  classroomName: string;
  enseignantName: string;
}

export interface AttendanceHistory {
  id: number;
  sessionId: number;
  moduleName: string;
  teacherName: string;
  classroom: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT'| 'EXCUSED';
  markedAt: string;
  date: string;
  biometricVerified?: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  module: {
    id: string;
    name: string;
    code: string;
  };
  time: string;
  room: string;
  professor: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  scannedAt: string | null;
  canJustify: boolean;
  justificationId: string | null;
}

export interface AttendanceRateResponse {
  studentId: number;
  moduleId?: number;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // Percentage (0-100)
  moduleBreakdown?: {
    moduleCode: string;
    moduleName: string;
    rate: number;
    present: number;
    late: number;
    absent: number;
  }[];
}

export interface ModuleAttendanceStats {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  totalSessions: number;
  totalStudents: number;
  averageAttendanceRate: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  studentsAtRisk: { // Students with < 75% attendance
    studentId: number;
    studentName: string;
    rate: number;
  }[];
}

interface QueuedAttendance extends MarkAttendanceRequest {
  queuedAt: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'attendance_offline_queue';
const HISTORY_STORAGE_KEY = 'attendance_scan_history';
const MAX_HISTORY = 10;

/**
 * Attendance Service - Handles attendance marking and offline queue
 */
class AttendanceServiceClass extends BaseApiService {
  private static readonly BASE_PATH = '/attendance';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
  }

  /**
   * Mark attendance by scanning QR code
   */
  async markAttendance(request: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    try {
      const response = await this.post<MarkAttendanceResponse>(
        `${AttendanceServiceClass.BASE_PATH}/scan`,
        request
      );
      
      if (!response.data) {
        // Extract error message from API response
        const errorMessage = response.error?.message || response.error?.details || 'Failed to mark attendance';
        const error = new Error(errorMessage);
        (error as any).response = response; // Attach response for additional context
        throw error;
      }

      // Save to local history
      await this.addToHistory({
        id: response.data.attendanceId,
        sessionId: response.data.sessionId,
        moduleName: response.data.moduleName || 'Module',
        teacherName: response.data.enseignantName || 'Teacher',
        classroom: response.data.classroomName || 'Classroom',
        status: response.data.status,
        markedAt: response.data.scannedAt,
        date: new Date().toISOString(),
        biometricVerified: response.data.biometricVerified,
      });

      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Queue attendance for offline marking
   */
  async queueAttendance(request: MarkAttendanceRequest): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const queuedItem: QueuedAttendance = {
        ...request,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
      };
      
      queue.push(queuedItem);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queuing attendance:', error);
      throw error;
    }
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<QueuedAttendance[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  /**
   * Process offline queue when network is restored
   */
  async processOfflineQueue(): Promise<{ success: number; failed: number }> {
    const queue = await this.getOfflineQueue();
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await this.markAttendance(item);
        success++;
      } catch (error) {
        console.error('Failed to process queued attendance:', error);
        item.retryCount++;
        
        // Keep in queue if retry count < 3
        if (item.retryCount < 3) {
          failed++;
        }
      }
    }

    // Update queue with failed items
    const remainingQueue = queue.filter(item => item.retryCount < 3);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));

    return { success, failed };
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Get scan history (last 10 scans)
   */
  async getScanHistory(): Promise<AttendanceHistory[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scan history:', error);
      return [];
    }
  }

  /**
   * Add to scan history
   */
  private async addToHistory(item: AttendanceHistory): Promise<void> {
    try {
      const history = await this.getScanHistory();
      history.unshift(item); // Add to beginning
      
      // Keep only last 10
      const trimmedHistory = history.slice(0, MAX_HISTORY);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }

  /**
   * Clear scan history
   */
  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Validate if student is within classroom boundary (50m radius)
   */
  isWithinClassroomBoundary(
    studentLat: number,
    studentLon: number,
    classroomLat: number,
    classroomLon: number,
    radiusMeters: number = 50
  ): boolean {
    const distance = this.calculateDistance(
      studentLat,
      studentLon,
      classroomLat,
      classroomLon
    );
    return distance <= radiusMeters;
  }

  // ==================== NEW API ENDPOINTS ====================

  /**
   * Get attendance records for a specific session
   */
  async getAttendanceBySession(sessionId: number): Promise<AttendanceRecord[]> {
    try {
      const response = await this.get<AttendanceRecord[]>(
        `${AttendanceServiceClass.BASE_PATH}/session/${sessionId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error getting session attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance history for a student
   */
  async getAttendanceByStudent(studentId: number): Promise<AttendanceRecord[]> {
    try {
      // TODO: Remove mock data once backend is fully seeded
      if (USE_MOCK_ATTENDANCE_DATA) {
        console.log('📊 Using MOCK attendance data for studentId:', studentId);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        return MOCK_ATTENDANCE_RECORDS;
      }

      const response = await this.get<AttendanceRecord[]>(
        `${AttendanceServiceClass.BASE_PATH}/student/${studentId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error getting student attendance:', error);
      // Fallback to mock data on error
      if (USE_MOCK_ATTENDANCE_DATA) {
        console.log('⚠️ API failed, falling back to MOCK attendance data');
        return MOCK_ATTENDANCE_RECORDS;
      }
      throw error;
    }
  }

  /**
   * Get attendance rate for a student
   * @param studentId - Student ID
   * @param moduleId - Optional module ID to get rate for specific module
   */
  async getStudentAttendanceRate(
    studentId: number,
    moduleId?: number
  ): Promise<AttendanceRateResponse> {
    try {
      // TODO: Remove mock data once backend is fully seeded
      if (USE_MOCK_ATTENDANCE_DATA) {
        console.log('📊 Using MOCK attendance rate for studentId:', studentId);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { ...MOCK_ATTENDANCE_RATE, studentId, moduleId };
      }

      const params = moduleId ? `?moduleId=${moduleId}` : '';
      const response = await this.get<AttendanceRateResponse>(
        `${AttendanceServiceClass.BASE_PATH}/student/${studentId}/rate${params}`
      );
      return response.data!;
    } catch (error) {
      console.error('Error getting attendance rate:', error);
      // Fallback to mock data on error
      if (USE_MOCK_ATTENDANCE_DATA) {
        console.log('⚠️ API failed, falling back to MOCK attendance rate');
        return { ...MOCK_ATTENDANCE_RATE, studentId, moduleId };
      }
      throw error;
    }
  }

  /**
   * Get module attendance statistics
   */
  async getModuleStatistics(moduleId: number): Promise<ModuleAttendanceStats> {
    try {
      const response = await this.get<ModuleAttendanceStats>(
        `${AttendanceServiceClass.BASE_PATH}/module/${moduleId}/statistics`
      );
      return response.data!;
    } catch (error) {
      console.error('Error getting module statistics:', error);
      throw error;
    }
  }

  /**
   * Helper: Format attendance status for display
   */
  getStatusDisplay(status: string): { label: string; color: string } {
    switch (status) {
      case 'PRESENT':
        return { label: 'Present', color: LIGHT_COLORS.success.light };
      case 'LATE':
        return { label: 'Late', color: LIGHT_COLORS.warning.light };
      case 'ABSENT':
        return { label: 'Absent', color: LIGHT_COLORS.error.light };
      case 'EXCUSED':
        return { label: 'Excused', color: LIGHT_COLORS.primary.light };
      default:
        return { label: status, color: LIGHT_COLORS.text.gray };
    }
  }

  /**
   * Helper: Get risk level based on attendance rate
   */
  getRiskLevel(rate: number): { level: string; color: string; message: string } {
    if (rate >= 90) {
      return {
        level: 'Excellent',
        color: LIGHT_COLORS.success.light,
        message: 'Keep up the great work!',
      };
    } else if (rate >= 75) {
      return {
        level: 'Good',
        color: LIGHT_COLORS.primary.light,
        message: 'Doing well, maintain attendance',
      };
    } else if (rate >= 60) {
      return {
        level: 'Warning',
        color: LIGHT_COLORS.warning.light,
        message: 'Attendance below 75%, improve to avoid issues',
      };
    } else {
      return {
        level: 'Critical',
        color: LIGHT_COLORS.error.light,
        message: 'Urgent: Risk of academic consequences',
      };
    }
  }
}

// Mock data configuration
const USE_MOCK_ATTENDANCE_DATA = false;
const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [];
const MOCK_ATTENDANCE_RATE: AttendanceRateResponse = {
  studentId: 0,
  totalSessions: 0,
  presentCount: 0,
  lateCount: 0,
  absentCount: 0,
  excusedCount: 0,
  attendanceRate: 0,
};

// Export singleton instance
export const AttendanceService = new AttendanceServiceClass();
