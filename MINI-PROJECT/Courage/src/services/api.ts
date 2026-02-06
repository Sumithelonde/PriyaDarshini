import axios from 'axios';
import { getToken, signOut } from '../utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

// Request Interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token expiry and unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - force logout
      signOut();
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      // Access forbidden - user doesn't have permission
      console.error('Access forbidden:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;
