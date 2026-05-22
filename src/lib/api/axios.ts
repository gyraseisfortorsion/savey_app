import axios from 'axios';
import { API_BASE_URL } from '@/src/constants/api';
import { getToken, deleteToken } from '@/src/lib/storage/secureStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteToken();
      // Lazy import to avoid circular dep with store
      const { useAuthStore } = await import('@/src/stores/authStore');
      useAuthStore.getState().logout();
    }
    const message =
      error.response?.data?.detail ??
      error.message ??
      'Network error';
    return Promise.reject(new Error(String(message)));
  }
);
