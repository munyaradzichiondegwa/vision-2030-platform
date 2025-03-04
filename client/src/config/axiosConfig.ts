import axios from 'axios';
import AuthService from '../services/authService';

// Configure base axios settings
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Request Interceptor
axios.interceptors.request.use(
  config => {
    const token = AuthService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
