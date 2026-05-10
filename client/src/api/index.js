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
    // If 401, the session expired — redirect to login
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
