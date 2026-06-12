import axios from 'axios';

// Empty baseURL uses Vite dev proxy (/api → backend). Set VITE_API_BASE_URL only when not using the proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.includes('/api/auth/');
  const token = localStorage.getItem('token');
  const isValidToken = token && token.split('.').length === 3;

  if (!isAuthEndpoint && isValidToken) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
