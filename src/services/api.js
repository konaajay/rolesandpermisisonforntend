import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token and X-Tenant header dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const tenantCode = localStorage.getItem('tenantCode');
    if (tenantCode) {
      config.headers['X-Tenant'] = tenantCode;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to catch 401/403 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or totally unauthorized -> clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        localStorage.removeItem('modules');
        localStorage.removeItem('tenantCode');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Authenticated but unauthorized -> break loop and go to unauthorized page
        if (!error.config?.ignore403 && window.location.pathname !== '/unauthorized') {
          window.location.href = '/unauthorized';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
