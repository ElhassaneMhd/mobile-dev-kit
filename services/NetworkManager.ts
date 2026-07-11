/**
 * Network Manager
 * Handles network state changes and API configuration updates
 */

import NetInfo from '@react-native-community/netinfo';
import ENV from '@/env';

class NetworkManager {
  private static instance: NetworkManager;
  private listeners: Set<() => void> = new Set();
  private currentNetworkState: string | null = null;

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  /**
   * Initialize network state listener
   */
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const networkId = `${state.type}-${state.isConnected}`;
      
      // Check if network actually changed
      if (this.currentNetworkState && this.currentNetworkState !== networkId) {
        console.log('🌐 [NETWORK] Network changed from', this.currentNetworkState, 'to', networkId);
        console.log('🌐 [NETWORK] Connection details:', {
          type: state.type,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        });
        
        // Notify all listeners
        this.notifyListeners();
      }
      
      this.currentNetworkState = networkId;
    });
  }

  /**
   * Register a listener for network changes
   */
  addListener(callback: () => void) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('🌐 [NETWORK] Error in network change listener:', error);
      }
    });
  }

  /**
   * Get current API URL (refreshed based on network)
   */
  getCurrentApiUrl(): string {
    // For now, return the ENV API_URL
    // In the future, you could implement dynamic IP detection here
    return ENV.API_URL;
  }

  /**
   * Force refresh network state
   */
  async refreshNetworkState() {
    const state = await NetInfo.fetch();
    console.log('🌐 [NETWORK] Current state:', {
      type: state.type,
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
    });
    return state;
  }
}

export const networkManager = NetworkManager.getInstance();
