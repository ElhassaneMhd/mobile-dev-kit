import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { websocketService } from '@/services/websocketService';
import { useAuth } from '@/contexts/AppStateContext';
import { sharedTokenStorage } from '@/services/tokenStorage';
import { notificationKeys } from '@/hooks/use-notifications';
import type { NotificationMessage } from '@/services/websocketService';

interface NotificationWebSocketContextType {
  isConnected: boolean;
}

const NotificationWebSocketContext = createContext<NotificationWebSocketContextType>({
  isConnected: false,
});

export const useNotificationWebSocket = () => useContext(NotificationWebSocketContext);

interface Props {
  children: ReactNode;
}

/**
 * WebSocket provider for real-time notifications
 * Handles connection, subscription, and push notification display
 */
export const NotificationWebSocketProvider = ({ children }: Props) => {
  const { tokens, user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isConnected = useRef(false);
  const unsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only connect if user is a student and authenticated
    if (!isAuthenticated || user?.role?.toUpperCase() !== 'ETUDIANT') {
      return;
    }

    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        // Get access token from state or storage
        let accessToken = tokens?.access_token;
        if (!accessToken) {
          accessToken = (await sharedTokenStorage.getAccessToken()) ?? undefined;
        }
        
        if (!accessToken) {
          return;
        }

        await websocketService.connect(accessToken);
        isConnected.current = true;

        // Subscribe to notifications
        unsubscribe.current = websocketService.subscribeToNotifications(handleNotificationReceived);
      } catch (error) {
        console.error('[NOTIFICATION WS] Connection failed:', error);
        isConnected.current = false;
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (unsubscribe.current) {
        unsubscribe.current();
        unsubscribe.current = null;
      }
    };
  }, [isAuthenticated, tokens, user]);

  /**
   * Handle incoming notification from WebSocket
   */
  const handleNotificationReceived = async (notification: NotificationMessage) => {
    // Invalidate queries to refresh notification list and unread count
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

    // Show push notification based on priority
    await showPushNotification(notification);
  };

  /**
   * Show native push notification
   */
  const showPushNotification = async (notification: NotificationMessage) => {
    try {
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Determine notification category based on priority
      const categoryId = getPriorityCategory(notification.priority);

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          sound: notification.priority === 'URGENT' || notification.priority === 'HIGH' ? 'default' : undefined,
          priority:
            notification.priority === 'URGENT'
              ? Notifications.AndroidNotificationPriority.MAX
              : notification.priority === 'HIGH'
              ? Notifications.AndroidNotificationPriority.HIGH
              : Notifications.AndroidNotificationPriority.DEFAULT,
          badge: 1,
          data: {
            notificationId: notification.id,
            actionUrl: notification.actionUrl,
            type: notification.type,
            metadata: notification.metadata,
          },
          categoryIdentifier: categoryId,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('[NOTIFICATION] Failed to show push notification:', error);
    }
  };

  /**
   * Get notification category based on priority
   */
  const getPriorityCategory = (priority: string): string => {
    switch (priority) {
      case 'URGENT':
        return 'urgent';
      case 'HIGH':
        return 'high';
      case 'NORMAL':
        return 'normal';
      default:
        return 'low';
    }
  };

  return (
    <NotificationWebSocketContext.Provider value={{ isConnected: isConnected.current }}>
      {children}
    </NotificationWebSocketContext.Provider>
  );
};
