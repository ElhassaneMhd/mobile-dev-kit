import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';
import type {
  NotificationsResponse,
  UnreadCountResponse,
  MarkReadResponse,
  BulkActionResponse,
  NotificationFilters,
  NotificationType,
} from '@/types/notification';

class NotificationService extends BaseApiService {
  private readonly notificationsPath = '/students/me/notifications';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
    // Don't modify baseUrl here - use full paths in each method instead
    console.log('✅ [NOTIFICATION SERVICE] Initialized');
  }

  /**
   * Get all notifications with optional filters
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationsResponse> {
    const params = new URLSearchParams();

    if (filters?.unreadOnly !== undefined) {
      params.append('unreadOnly', String(filters.unreadOnly));
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.page !== undefined) {
      params.append('page', String(filters.page));
    }
    if (filters?.size !== undefined) {
      params.append('size', String(filters.size));
    }
    if (filters?.sort) {
      params.append('sort', filters.sort);
    }

    const queryString = params.toString();
    const endpoint = queryString 
      ? `${this.notificationsPath}?${queryString}` 
      : this.notificationsPath;

    const response = await this.get<NotificationsResponse>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to fetch notifications');
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await this.get<UnreadCountResponse>(`${this.notificationsPath}/unread-count`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to fetch unread count');
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    const response = await this.put<MarkReadResponse>(`${this.notificationsPath}/${notificationId}/read`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to mark notification as read');
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(type?: NotificationType): Promise<BulkActionResponse> {
    const params = type ? `?type=${type}` : '';
    const response = await this.put<BulkActionResponse>(`${this.notificationsPath}/read-all${params}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to mark all as read');
  }

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await this.delete(`${this.notificationsPath}/${notificationId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete notification');
    }
  }

  /**
   * Clear all read notifications
   */
  async clearAllRead(): Promise<BulkActionResponse> {
    const response = await this.delete<BulkActionResponse>(`${this.notificationsPath}/clear-read`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to clear read notifications');
  }
}

export const notificationService = new NotificationService();
