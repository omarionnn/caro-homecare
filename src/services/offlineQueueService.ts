import { AxiosRequestConfig } from 'axios';
import { apiService } from './apiService';
import { netInfoService } from './netInfoService';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants/appConstants';

interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  timestamp: number;
}

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private isProcessing: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the service
   */
  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load persisted queue
      const persistedQueue = await storageService.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (persistedQueue) {
        this.queue = persistedQueue;
      }
      
      // Setup connectivity listener
      netInfoService.addConnectivityListener(this.handleConnectivityChange);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
    }
  }

  /**
   * Handle connectivity changes
   */
  private handleConnectivityChange = (isConnected: boolean) => {
    if (isConnected && this.queue.length > 0) {
      this.processQueue();
    }
  };

  /**
   * Add a request to the offline queue
   * @param config Axios request config
   */
  async enqueueRequest(config: AxiosRequestConfig): Promise<void> {
    await this.initialize();
    
    const request: QueuedRequest = {
      id: Date.now().toString(),
      config,
      timestamp: Date.now(),
    };
    
    this.queue.push(request);
    await this.persistQueue();
    
    // If we're connected, try to process the queue immediately
    const isConnected = await netInfoService.isConnected();
    if (isConnected) {
      this.processQueue();
    }
  }

  /**
   * Process the offline request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const isConnected = await netInfoService.isConnected();
      if (!isConnected) {
        this.isProcessing = false;
        return;
      }
      
      // Process each request in order
      const originalQueueLength = this.queue.length;
      for (let i = 0; i < originalQueueLength; i++) {
        const request = this.queue[0];
        
        try {
          await apiService.api.request(request.config);
          // If successful, remove from queue
          this.queue.shift();
        } catch (error) {
          console.error(`Failed to process queued request ${request.id}:`, error);
          // Move to end of queue to try again later
          const failedRequest = this.queue.shift();
          if (failedRequest) {
            this.queue.push(failedRequest);
          }
          break; // Stop processing on first error
        }
      }
      
      await this.persistQueue();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Persist the queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.OFFLINE_DATA, this.queue);
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }

  /**
   * Get the current queue
   */
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Clear the queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
  }
}

export const offlineQueueService = new OfflineQueueService();
