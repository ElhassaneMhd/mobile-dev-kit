// Notification types for mobile app

export type NotificationType = 'ABSENCE' | 'JUSTIFICATION' | 'GRADE' | 'RECOMMENDATION' | 'TIMETABLE' | 'SYSTEM' | 'ALERT';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationMetadata {
  moduleId?: string;
  moduleName?: string;
  attendanceId?: string;
  sessionDate?: string;
  justificationId?: string;
  status?: string;
  gradeValue?: string;
  recommendationId?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  metadata: NotificationMetadata;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface NotificationSummary {
  totalUnread: number;
  unreadByType: {
    ABSENCE: number;
    JUSTIFICATION: number;
    GRADE: number;
    RECOMMENDATION: number;
    TIMETABLE: number;
    SYSTEM: number;
    ALERT: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  summary: NotificationSummary;
}

export interface UnreadCountResponse {
  count: number;
  byType: Record<NotificationType, number>;
}

export interface MarkReadResponse {
  id: string;
  isRead: boolean;
  readAt: string;
}

export interface BulkActionResponse {
  markedCount?: number;
  deletedCount?: number;
  message: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  size?: number;
  sort?: string;
}
