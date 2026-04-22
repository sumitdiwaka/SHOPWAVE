import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token to every request ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // For multipart/form-data, let browser set Content-Type automatically
  // (it needs to include the boundary string — don't override it)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// ── Response interceptor: only logout on real auth failures ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';

    // Only auto-logout if it's an auth endpoint 401, NOT upload/other endpoints
    const isAuthEndpoint = url.includes('/auth/') || url.includes('/profile');
    const isUploadEndpoint = url.includes('/upload/');

    if (status === 401 && isAuthEndpoint && !isUploadEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;