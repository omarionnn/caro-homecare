import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/apiConstants';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants/appConstants';
import { netInfoService } from './netInfoService';
import { offlineQueueService } from './offlineQueueService';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle unauthorized errors (token expired)
        if (error.response && error.response.status === 401) {
          try {
            // Try to refresh the token
            const refreshToken = await storageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
              
              if (response.data.token) {
                await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
                
                // Retry the original request
                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect to login
            await this.clearAuthAndRedirect();
          }
          
          // If we couldn't refresh, clear auth and redirect
          await this.clearAuthAndRedirect();
        }
        
        // Check if error is due to network
        if (!error.response && error.request) {
          // Network error occurred
          const isConnected = await netInfoService.isConnected();
          if (!isConnected) {
            // If offline, queue the request for later
            offlineQueueService.enqueueRequest(error.config);
            throw new Error('Network error: Request queued for when connection is restored');
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async clearAuthAndRedirect() {
    await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    // Redirect to login - this would be handled by a navigation service
    // navigationService.navigate('Login');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
