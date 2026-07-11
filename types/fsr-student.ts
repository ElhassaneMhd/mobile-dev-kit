// FSR Attendance System - Student Types
// Based on SYSTEM_ARCHITECTURE.md

export enum StudentRole {
  STUDENT = 'student',
}

export interface Student {
  id: number;
  user_id: number;
  master_id: number;
  first_name: string;
  last_name: string;
  student_number: string; // e.g., "21234567"
  email: string;
  phone?: string;
  enrollment_date: string;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Master {
  id: number;
  department_id: number;
  name: string; // e.g., "AISD", "GL", "SITW"
  code: string;
  duration_semesters: number;
  coordinateur?: Coordinateur;
}

export interface Department {
  id: number;
  faculty_id: number;
  name: string; // e.g., "Computer Science", "Mathematics"
  code: string;
}

export interface Faculty {
  id: number;
  name: string; // e.g., "Faculté des Sciences de Rabat"
  code: string;
  address: string;
}

export interface Coordinateur {
  id: number;
  user_id: number;
  master_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface Module {
  id: number;
  master_id: number;
  name: string;
  code: string;
  credits: number;
  semester: string; // "S1", "S2", "S3", "S4"
}

export interface Enseignant {
  id: number;
  user_id: number;
  department_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  specialization?: string;
}

export interface Classroom {
  id: number;
  name: string;
  building: string;
  capacity: number;
  latitude: number;
  longitude: number;
}

export interface TimetableEntry {
  id: number;
  timetable_id: number;
  module_id: number;
  enseignant_id: number;
  classroom_id: number;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string; // "08:00"
  end_time: string; // "10:00"
  module?: Module;
  enseignant?: Enseignant;
  classroom?: Classroom;
}

export interface Session {
  id: number;
  timetable_entry_id: number;
  date: string;
  qr_code?: string;
  qr_expires_at?: string;
  status: 'scheduled' | 'active' | 'closed' | 'cancelled';
  latitude?: number;
  longitude?: number;
  timetable_entry?: TimetableEntry;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface Attendance {
  id: number;
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  scanned_at?: string;
  scan_latitude?: number;
  scan_longitude?: number;
  is_justified: boolean;
  session?: Session;
  created_at: string;
}

export enum JustificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_INFO = 'needs_info',
}

export interface Justification {
  id: number;
  attendance_id: number;
  student_id: number;
  reason_text: string;
  document_path?: string;
  status: JustificationStatus;
  reviewed_by?: number;
  reviewed_at?: string;
  coordinator_comment?: string;
  created_at: string;
  updated_at: string;
  attendance?: Attendance;
}

export interface DisciplinaryFlag {
  id: number;
  student_id: number;
  total_unjustified_absences: number;
  is_flagged: boolean;
  meeting_scheduled_at?: string;
  sanction_applied?: string;
  notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// Student Stats
export interface StudentStats {
  total_sessions: number;
  total_present: number;
  total_absent: number;
  unjustified_absences: number;
  justified_absences: number;
  attendance_rate: number; // percentage
  pending_justifications: number;
  is_flagged: boolean;
}

// Schedule for student
export interface StudentSchedule {
  day: string;
  entries: TimetableEntry[];
}

// Notification types
export enum NotificationType {
  SESSION_STARTING = 'session_starting',
  SESSION_ACTIVE = 'session_active',
  JUSTIFICATION_APPROVED = 'justification_approved',
  JUSTIFICATION_REJECTED = 'justification_rejected',
  DISCIPLINARY_FLAG = 'disciplinary_flag',
  MEETING_SCHEDULED = 'meeting_scheduled',
}

export interface Notification {
  id: number;
  student_id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: number; // session_id, justification_id, etc.
}

// API Request/Response types
export interface StudentLoginRequest {
  email: string;
  password: string;
}

export interface StudentRegistrationRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  student_number: string;
  master_id: number;
  phone?: string;
}

export interface StudentAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  student: Student;
  master: Master;
  stats: StudentStats;
}

export interface MarkAttendanceRequest {
  session_id: number;
  qr_code: string;
  latitude: number;
  longitude: number;
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  attendance?: Attendance;
  error?: string;
}

export interface SubmitJustificationRequest {
  attendance_id: number;
  reason_text: string;
  document?: File | Blob;
}

export interface QRScanResult {
  session_id: number;
  qr_code: string;
  timestamp: string;
}
