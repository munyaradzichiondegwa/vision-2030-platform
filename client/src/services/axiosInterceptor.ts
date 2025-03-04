import axios from 'axios';
import { AuthService } from './authService';

export function setupAxiosInterceptors() {
  // Request Interceptor
  axios.interceptors.request.use(
    async (config) => {
      const token = AuthService.getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If token has expired and retry hasn't been attempted
      if (
        error.response?.status === 401 && 
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          await AuthService.refreshToken();
          
          // Retry original request with new token
          return axios(originalRequest);
        } catch {
          // Refresh failed, logout user
          AuthService.logout();
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
}