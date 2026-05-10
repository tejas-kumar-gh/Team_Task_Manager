import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 on a non-auth endpoint, the session expired — redirect to login
    // Skip redirect for /auth/* endpoints (profile check, login, register, logout)
    // because AuthContext + ProtectedRoute already handle unauthenticated state via React routing
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
