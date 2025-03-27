import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ConnectivityListener = (isConnected: boolean) => void;

class NetInfoService {
  private listeners: Set<ConnectivityListener> = new Set();
  private connected: boolean = true;

  constructor() {
    // Setup Net Info listener
    NetInfo.addEventListener(this.handleNetInfoChange);
    
    // Initialize connectivity state
    this.updateConnectivity();
  }

  /**
   * Handle network state changes
   */
  private handleNetInfoChange = (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    
    // Only notify listeners if state changed
    if (this.connected !== isConnected) {
      this.connected = isConnected;
      this.notifyListeners();
    }
  };

  /**
   * Update current connectivity state
   */
  private async updateConnectivity() {
    try {
      const state = await NetInfo.fetch();
      this.connected = state.isConnected ?? false;
    } catch (error) {
      console.error('Error fetching network info:', error);
    }
  }

  /**
   * Check if device is currently connected
   * @returns Promise resolving to connectivity status
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.connected = state.isConnected ?? false;
      return this.connected;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return this.connected; // Return last known state
    }
  }

  /**
   * Get current connection info
   * @returns Promise resolving to detailed connection info
   */
  async getConnectionInfo(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }

  /**
   * Add connectivity change listener
   * @param listener Function to call on connectivity change
   */
  addConnectivityListener(listener: ConnectivityListener): void {
    this.listeners.add(listener);
    
    // Notify immediately with current state
    listener(this.connected);
  }

  /**
   * Remove connectivity change listener
   * @param listener The listener to remove
   */
  removeConnectivityListener(listener: ConnectivityListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of connectivity change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.connected);
    });
  }
}

export const netInfoService = new NetInfoService();
