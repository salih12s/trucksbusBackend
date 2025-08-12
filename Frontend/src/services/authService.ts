import axios, { AxiosResponse } from 'axios';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Giriş başarısız');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Giriş başarısız');
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', userData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Kayıt başarısız');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kayıt başarısız');
    }
  },

  verifyToken: async (token: string): Promise<User> => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Token geçersiz');
    } catch (error) {
      throw new Error('Token doğrulama başarısız');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Silent fail for logout
    } finally {
      localStorage.removeItem('token');
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response: AxiosResponse<ApiResponse<{ token: string }>> = await api.post('/auth/refresh', {
        refreshToken
      });
      if (response.data.success && response.data.data) {
        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);
        return newToken;
      }
      throw new Error('Token yenileme başarısız');
    } catch (error) {
      throw new Error('Token yenileme başarısız');
    }
  }
};

export default api;
