// Timetable Service - Real API implementation for student timetable
// Handles personal schedule, upcoming sessions, and session details

import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';

export interface TimetableEntry {
  id: number;
  timetableId: number;
  moduleId: number;
  enseignantId: number;
  classroomId: number;
  dayOfWeek: number; // 1=Monday, 2=Tuesday, ..., 6=Saturday, 7=Sunday
  startTime: string; // "08:30:00"
  endTime: string; // "10:30:00"
  type: string; // 'COURSE' | 'TD' | 'TP'
  sessionType: 'COURSE' | 'TD' | 'TP'; // Keep for backward compatibility
  isRecurring: boolean;
  specificDate?: string; // ISO date for one-time sessions
  module: {
    id: number;
    code: string;
    name: string;
    credits: number;
  };
  professor: {
    id: number;
    name: string;
  };
  enseignant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }; // Keep for backward compatibility
  room: string;
  building: string;
  classroom: {
    id: number;
    name: string;
    building: string;
    capacity: number;
    floor: number;
    latitude?: number;
    longitude?: number;
  }; // Keep for backward compatibility
}

export interface Timetable {
  id: number;
  masterId: number;
  name: string;
  description?: string;
  academicYear: number;
  semester: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface TimetableDetail extends Timetable {
  entries: TimetableEntry[];
}

export interface WeeklySchedule {
  timetableId: number;
  weekStart: string;
  weekEnd: string;
  schedule: {
    [key: string]: TimetableEntry[]; // Key: MONDAY, TUESDAY, etc.
  };
}

export interface SessionInfo {
  entry: TimetableEntry;
  nextOccurrence?: string; // ISO datetime of next session
  countdown?: {
    hours: number;
    minutes: number;
    isToday: boolean;
  };
}

/**
 * Timetable Service - Handles student schedule operations
 */
class TimetableServiceClass extends BaseApiService {
  private static readonly BASE_PATH = '/timetables';
  private static readonly ENTRY_PATH = '/timetable-entries';
  private static readonly STUDENT_PATH = '/students';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
  }

  /**
   * Get student's active timetable (workaround - multi-step)
   * 1. Get student details to find masterId
   * 2. Get timetables by master
   * 3. Find PUBLISHED timetable for current date
   */
  async getStudentActiveTimetable(studentId: number): Promise<Timetable | null> {
    try {
      // Step 1: Get student to find masterId
      const studentResponse = await this.get<any>(`${TimetableServiceClass.STUDENT_PATH}/${studentId}`);
      const masterId = studentResponse.data?.masterId;

      if (!masterId) {
        console.warn('Student has no master program assigned');
        return null;
      }

      // Step 2: Get timetables for this master
      const timetablesResponse = await this.get<any>(
        `${TimetableServiceClass.BASE_PATH}/master/${masterId}?size=50`
      );
      
      const timetables = timetablesResponse.data?.content || [];
      const now = new Date();

      // Step 3: Find active published timetable
      const activeTimetable = timetables.find((t: Timetable) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return (
          t.status === 'PUBLISHED' &&
          now >= start &&
          now <= end
        );
      });

      return activeTimetable || null;
    } catch (error) {
      console.error('Error getting student active timetable:', error);
      return null;
    }
  }

  /**
   * Get timetable details with all entries
   */
  async getTimetableDetail(timetableId: number): Promise<TimetableDetail | null> {
    try {
      const response = await this.get<TimetableDetail>(
        `${TimetableServiceClass.BASE_PATH}/${timetableId}/detail`
      );
      return response.data || null;
    } catch (error) {
      console.error('Error getting timetable detail:', error);
      throw error;
    }
  }

  /**
   * Get weekly schedule view
   */
  async getWeeklySchedule(timetableId: number): Promise<WeeklySchedule> {
    try {
      const response = await this.get<WeeklySchedule>(
        `${TimetableServiceClass.BASE_PATH}/${timetableId}/weekly`
      );
      return response.data!;
    } catch (error) {
      console.error('Error getting weekly schedule:', error);
      throw error;
    }
  }

  /**
   * Get entries for a specific day
   */
  async getEntriesByDay(
    timetableId: number,
    dayOfWeek: string
  ): Promise<TimetableEntry[]> {
    try {
      const response = await this.get<TimetableEntry[]>(
        `${TimetableServiceClass.ENTRY_PATH}/timetable/${timetableId}/day/${dayOfWeek.toUpperCase()}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error getting entries by day:', error);
      throw error;
    }
  }

  /**
   * Get today's schedule for student
   */
  async getTodaySchedule(studentId: number): Promise<TimetableEntry[]> {
    try {
      // TODO: Remove mock data once backend is fully seeded
      if (USE_MOCK_TIMETABLE_DATA) {
        console.log('📅 Using MOCK timetable data for studentId:', studentId);
        await new Promise(resolve => setTimeout(resolve, 300));
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
        return MOCK_TIMETABLE_ENTRIES
          .filter(entry => entry.dayOfWeek === dayOfWeek)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      }

      const timetable = await this.getStudentActiveTimetable(studentId);
      if (!timetable) {
        return [];
      }

      const today = new Date();
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = dayNames[today.getDay()];

      const entries = await this.getEntriesByDay(timetable.id, dayOfWeek);

      // Sort by start time
      return entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    } catch (error) {
      console.error('Error getting today schedule:', error);
      // Fallback to mock data on error
      if (USE_MOCK_TIMETABLE_DATA) {
        console.log('⚠️ API failed, falling back to MOCK timetable data');
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
        return MOCK_TIMETABLE_ENTRIES
          .filter(entry => entry.dayOfWeek === dayOfWeek)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
      return [];
    }
  }

  /**
   * Get upcoming sessions (next N days)
   */
  async getUpcomingSessions(studentId: number, days: number = 7): Promise<SessionInfo[]> {
    try {
      const timetable = await this.getStudentActiveTimetable(studentId);
      if (!timetable) {
        return [];
      }

      const timetableDetail = await this.getTimetableDetail(timetable.id);
      if (!timetableDetail) {
        return [];
      }

      const now = new Date();
      const upcomingLimit = new Date();
      upcomingLimit.setDate(upcomingLimit.getDate() + days);

      const sessionInfos: SessionInfo[] = [];

      // For each entry, calculate next occurrence
      for (const entry of timetableDetail.entries) {
        const nextDate = this.calculateNextOccurrence(entry, now, upcomingLimit);
        if (nextDate) {
          sessionInfos.push({
            entry,
            nextOccurrence: nextDate.toISOString(),
            countdown: this.calculateCountdown(nextDate),
          });
        }
      }

      // Sort by next occurrence
      return sessionInfos.sort((a, b) => {
        const dateA = new Date(a.nextOccurrence!);
        const dateB = new Date(b.nextOccurrence!);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return [];
    }
  }

  /**
   * Calculate next occurrence of a recurring session
   */
  private calculateNextOccurrence(
    entry: TimetableEntry,
    from: Date,
    until: Date
  ): Date | null {
    // If specific date, check if it's in range
    if (entry.specificDate) {
      const specificDate = new Date(entry.specificDate + 'T' + entry.startTime);
      if (specificDate >= from && specificDate <= until) {
        return specificDate;
      }
      return null;
    }

    // For recurring entries, find next occurrence of dayOfWeek
    // entry.dayOfWeek is 1=Monday, 2=Tuesday, ..., 6=Saturday, 7=Sunday
    // JS getDay() is 0=Sunday, 1=Monday, ..., 6=Saturday
    // Convert entry.dayOfWeek to JS day format
    const targetDay = entry.dayOfWeek === 7 ? 0 : entry.dayOfWeek;
    const currentDay = from.getDay();
    
    // Calculate days until next occurrence
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) {
      daysUntil += 7;
    }
    if (daysUntil === 0) {
      // Check if time has passed today
      const [hours, minutes] = entry.startTime.split(':').map(Number);
      const sessionTimeToday = new Date(from);
      sessionTimeToday.setHours(hours, minutes, 0, 0);
      
      if (from > sessionTimeToday) {
        daysUntil = 7; // Next week
      }
    }

    const nextDate = new Date(from);
    nextDate.setDate(nextDate.getDate() + daysUntil);
    
    const [hours, minutes] = entry.startTime.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);

    if (nextDate <= until) {
      return nextDate;
    }

    return null;
  }

  /**
   * Calculate countdown to a session
   */
  private calculateCountdown(sessionDate: Date): {
    hours: number;
    minutes: number;
    isToday: boolean;
  } {
    const now = new Date();
    const diff = sessionDate.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const isToday = 
      sessionDate.getDate() === now.getDate() &&
      sessionDate.getMonth() === now.getMonth() &&
      sessionDate.getFullYear() === now.getFullYear();

    return { hours, minutes, isToday };
  }

  /**
   * Get entries by module
   */
  async getEntriesByModule(moduleId: number): Promise<TimetableEntry[]> {
    try {
      const response = await this.get<TimetableEntry[]>(
        `${TimetableServiceClass.ENTRY_PATH}/module/${moduleId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error getting entries by module:', error);
      throw error;
    }
  }

  /**
   * Format time for display (HH:MM)
   */
  formatTime(time: string): string {
    return time.substring(0, 5); // "08:30:00" -> "08:30"
  }

  /**
   * Get session type display
   */
  getSessionTypeDisplay(type: string): { label: string; color: string } {
    switch (type) {
      case 'COURSE':
        return { label: 'Cours', color: '#3B82F6' };
      case 'TD':
        return { label: 'TD', color: '#10B981' };
      case 'TP':
        return { label: 'TP', color: '#F59E0B' };
      default:
        return { label: type, color: '#6B7280' };
    }
  }

  /**
   * Get day name in French
   * @param day - Day number (1=Monday, 2=Tuesday, ..., 7=Sunday)
   */
  getDayName(day: number): string {
    const dayNames: { [key: number]: string } = {
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
      6: 'Samedi',
      7: 'Dimanche',
    };
    return dayNames[day] || `Day ${day}`;
  }
}

// Mock data configuration
const USE_MOCK_TIMETABLE_DATA = false;
const MOCK_TIMETABLE_ENTRIES: TimetableEntry[] = [];

// Export singleton instance
export const TimetableService = new TimetableServiceClass();
