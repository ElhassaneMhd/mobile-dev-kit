/// <reference path="../types/sockjs-client.d.ts" />

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { defaultApiConfig } from './BaseApiService';

// Message types from backend
export interface StudentScannedMessage {
  type: 'STUDENT_SCANNED';
  sessionId: number;
  studentId: number;
  studentName: string;
  studentCne: string;
  status: 'PRESENT' | 'LATE';
  scannedAt: string;
  timestamp: string;
}

export interface AttendanceStatsMessage {
  type: 'ATTENDANCE_UPDATE';
  sessionId: number;
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
  timestamp: string;
}

export interface QRRefreshedMessage {
  type: 'QR_REFRESHED';
  sessionId: number;
  code: string;
  value: string;
  expiresAt: string;
  refreshInterval: number;
  timestamp: string;
}

export interface SessionEndedMessage {
  type: 'SESSION_ENDED';
  sessionId: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  timestamp: string;
}

export interface AttendanceConfirmationMessage {
  type: 'ATTENDANCE_CONFIRMED';
  sessionId: number;
  attendanceId: number;
  status: 'PRESENT' | 'LATE';
  moduleName: string;
  moduleCode: string;
  room: string;
  professorName: string;
  scannedAt: string;
  message: string;
  timestamp: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'ABSENCE' | 'JUSTIFICATION' | 'GRADE' | 'RECOMMENDATION' | 'TIMETABLE' | 'SYSTEM' | 'ALERT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  actionUrl: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  readAt: string | null;
}

type WebSocketMessage = 
  | StudentScannedMessage 
  | AttendanceStatsMessage 
  | QRRefreshedMessage 
  | SessionEndedMessage
  | AttendanceConfirmationMessage
  | NotificationMessage;

export type MessageHandler<T = WebSocketMessage> = (message: T) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  // Initialize WebSocket connection
  connect(token: string): Promise<void> {
    console.log('🔌 [WebSocket] ========== CONNECTION ATTEMPT ==========');
    console.log('🔌 [WebSocket] Has token:', !!token);
    
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        console.log('✅ [WebSocket] Already connected');
        resolve();
        return;
      }

      // SockJS requires http/https URLs, it handles the WebSocket upgrade internally
      const wsUrl = defaultApiConfig.baseUrl + '/ws';
      console.log('🔌 [WebSocket] Base URL:', defaultApiConfig.baseUrl);
      console.log('🔌 [WebSocket] WebSocket URL (SockJS):', wsUrl);

      this.client = new Client({
        webSocketFactory: () => {
          console.log('🏭 [WebSocket] Creating SockJS instance...');
          return new SockJS(wsUrl) as any;
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('🐛 [STOMP]', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        onConnect: () => {
          console.log('✅ [WebSocket] ========== CONNECTED ==========');
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error('❌ [WebSocket] STOMP ERROR:', frame.headers['message']);
          console.error('❌ [WebSocket] Error body:', frame.body);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (event) => {
          console.error('❌ [WebSocket] CONNECTION ERROR:', event);
          reject(new Error('WebSocket connection failed'));
        },
        onDisconnect: () => {
          console.log('🔌 [WebSocket] ========== DISCONNECTED ==========');
          this.handleReconnect(token);
        },
      });

      console.log('🚀 [WebSocket] Activating client...');
      this.client.activate();
    });
  }

  // Handle reconnection with exponential backoff
  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token).catch(console.error);
      }, delay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      console.log('[WebSocket] Disconnected and cleaned up');
    }
  }

  // Subscribe to student scans for a session
  subscribeToStudentScans(
    sessionId: string | number,
    handler: MessageHandler<StudentScannedMessage>
  ): () => void {
    const topic = `/topic/session/${sessionId}/scan`;
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as StudentScannedMessage;
      handler(parsed);
    });
  }

  // Subscribe to attendance stats updates
  subscribeToAttendanceStats(
    sessionId: string | number,
    handler: MessageHandler<AttendanceStatsMessage>
  ): () => void {
    const topic = `/topic/session/${sessionId}/attendance`;
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as AttendanceStatsMessage;
      handler(parsed);
    });
  }

  // Subscribe to QR code refresh events
  subscribeToQRRefresh(
    sessionId: string | number,
    handler: MessageHandler<QRRefreshedMessage>
  ): () => void {
    const topic = `/topic/session/${sessionId}/qr`;
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as QRRefreshedMessage;
      handler(parsed);
    });
  }

  // Subscribe to session ended events
  subscribeToSessionEnded(
    sessionId: string | number,
    handler: MessageHandler<SessionEndedMessage>
  ): () => void {
    const topic = `/topic/session/${sessionId}/ended`;
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as SessionEndedMessage;
      handler(parsed);
    });
  }

  // Subscribe to user-specific attendance confirmations (for students)
  subscribeToAttendanceConfirmation(
    handler: MessageHandler<AttendanceConfirmationMessage>
  ): () => void {
    const topic = '/user/queue/attendance';
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as AttendanceConfirmationMessage;
      handler(parsed);
    });
  }

  // Subscribe to user-specific notifications (for students)
  subscribeToNotifications(
    handler: MessageHandler<NotificationMessage>
  ): () => void {
    const topic = '/user/queue/notifications';
    return this.subscribe(topic, (message) => {
      const parsed = JSON.parse(message.body) as NotificationMessage;
      handler(parsed);
    });
  }

  // Generic subscribe method
  private subscribe(
    topic: string,
    handler: (message: any) => void
  ): () => void {
    if (!this.client?.connected) {
      console.error('[WebSocket] Cannot subscribe - not connected');
      return () => {};
    }

    // Unsubscribe existing subscription to this topic
    const existing = this.subscriptions.get(topic);
    if (existing) {
      existing.unsubscribe();
    }

    const subscription = this.client.subscribe(topic, handler);
    this.subscriptions.set(topic, subscription);

    console.log(`[WebSocket] Subscribed to ${topic}`);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`[WebSocket] Unsubscribed from ${topic}`);
    };
  }

  // Check if connected
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
