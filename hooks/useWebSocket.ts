import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { websocketService, type MessageHandler, type StudentScannedMessage, type AttendanceStatsMessage, type QRRefreshedMessage, type SessionEndedMessage } from '@/services/websocketService';
import { useAuth } from '@/contexts/AppStateContext';
import { sharedTokenStorage } from '@/services/tokenStorage';

/**
 * Hook to manage WebSocket connection lifecycle
 * Automatically connects/disconnects based on auth state and app state
 */
export function useWebSocket() {
  const { tokens, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const appState = useRef(AppState.currentState);

  console.log('🎣 [useWebSocket] Hook initialized');
  console.log('🎣 [useWebSocket] isAuthenticated:', isAuthenticated);
  console.log('🎣 [useWebSocket] tokens object:', tokens);
  console.log('🎣 [useWebSocket] Has token:', !!tokens?.access_token);

  useEffect(() => {
    console.log('🎣 [useWebSocket] Effect triggered');
    console.log('🎣 [useWebSocket] Auth check:', { isAuthenticated, hasToken: !!tokens?.access_token });
    
    if (!isAuthenticated) {
      console.log('⚠️ [useWebSocket] Not authenticated, disconnecting');
      websocketService.disconnect();
      setIsConnected(false);
      return;
    }

    // Connect to WebSocket
    const connect = async () => {
      console.log('🎣 [useWebSocket] Attempting connection...');
      try {
        // Get token from storage if not in state
        let accessToken = tokens?.access_token;
        if (!accessToken) {
          console.log('🎣 [useWebSocket] Token not in state, getting from storage...');
          const tokenFromStorage = await sharedTokenStorage.getAccessToken();
          accessToken = tokenFromStorage || undefined;
          console.log('🎣 [useWebSocket] Token from storage:', accessToken ? `${accessToken.substring(0, 30)}...` : 'NONE');
        }
        
        if (!accessToken) {
          console.log('⚠️ [useWebSocket] No access token found, skipping connection');
          return;
        }
        
        await websocketService.connect(accessToken);
        console.log('✅ [useWebSocket] Connection successful!');
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('❌ [useWebSocket] Connection failed:', err);
        setError(err as Error);
        setIsConnected(false);
      }
    };

    connect();

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('📱 [useWebSocket] App state changed:', appState.current, '->', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('🔄 [useWebSocket] App came to foreground, checking connection...');
        // App came to foreground, reconnect if needed
        if (!websocketService.isConnected()) {
          console.log('🔄 [useWebSocket] Reconnecting...');
          connect();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('💤 [useWebSocket] App went to background, disconnecting...');
        // App went to background, disconnect to save battery
        websocketService.disconnect();
        setIsConnected(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      console.log('🧹 [useWebSocket] Cleanup - disconnecting');
      subscription.remove();
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, tokens]);

  return { isConnected, error };
}

/**
 * Hook to subscribe to live session updates
 * Combines all session-related WebSocket subscriptions
 */
export function useSessionLiveUpdates(
  sessionId: string | number | null,
  options: {
    onStudentScanned?: MessageHandler<StudentScannedMessage>;
    onAttendanceUpdate?: MessageHandler<AttendanceStatsMessage>;
    onQRRefresh?: MessageHandler<QRRefreshedMessage>;
    onSessionEnded?: MessageHandler<SessionEndedMessage>;
  }
) {
  const { isConnected } = useWebSocket();

  console.log('📡 [useSessionLiveUpdates] Hook initialized');
  console.log('📡 [useSessionLiveUpdates] Session ID:', sessionId);
  console.log('📡 [useSessionLiveUpdates] Is connected:', isConnected);

  useEffect(() => {
    console.log('📡 [useSessionLiveUpdates] Effect triggered');
    console.log('📡 [useSessionLiveUpdates] Can subscribe:', { isConnected, sessionId });
    
    if (!isConnected || !sessionId) {
      console.log('⚠️ [useSessionLiveUpdates] Cannot subscribe -', {
        isConnected,
        hasSessionId: !!sessionId,
      });
      return;
    }

    console.log('📡 [useSessionLiveUpdates] Setting up subscriptions for session:', sessionId);
    const unsubscribers: Array<() => void> = [];

    // Subscribe to student scans
    if (options.onStudentScanned) {
      console.log('📡 [useSessionLiveUpdates] Subscribing to student scans...');
      const unsub = websocketService.subscribeToStudentScans(
        sessionId,
        options.onStudentScanned
      );
      unsubscribers.push(unsub);
    }

    // Subscribe to attendance stats
    if (options.onAttendanceUpdate) {
      console.log('📡 [useSessionLiveUpdates] Subscribing to attendance stats...');
      const unsub = websocketService.subscribeToAttendanceStats(
        sessionId,
        options.onAttendanceUpdate
      );
      unsubscribers.push(unsub);
    }

    // Subscribe to QR refresh
    if (options.onQRRefresh) {
      console.log('📡 [useSessionLiveUpdates] Subscribing to QR refresh...');
      const unsub = websocketService.subscribeToQRRefresh(
        sessionId,
        options.onQRRefresh
      );
      unsubscribers.push(unsub);
    }

    // Subscribe to session ended
    if (options.onSessionEnded) {
      console.log('📡 [useSessionLiveUpdates] Subscribing to session ended...');
      const unsub = websocketService.subscribeToSessionEnded(
        sessionId,
        options.onSessionEnded
      );
      unsubscribers.push(unsub);
    }

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, sessionId, options.onStudentScanned, options.onAttendanceUpdate, options.onQRRefresh, options.onSessionEnded]);

  return { isConnected };
}
