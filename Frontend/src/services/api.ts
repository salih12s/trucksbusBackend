import axios, { AxiosError, AxiosResponse } from 'axios';

// 🔧 Environment variable kullan - Backend API (Production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trucksbusbackend-production-0e23.up.railway.app/api';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// Utility functions
export const toInt = (v: any): number | undefined => (v === null || v === undefined || v === '') ? undefined : Number(v);
export const cleanObject = (o: Record<string, any>): Record<string, any> => 
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''));

// JSON Response checker
export const assertJson = (response: AxiosResponse): void => {
  const contentType = response.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    throw new Error('JSON bekleniyordu, alınan: ' + contentType);
  }
};

// Query builder for pagination and filtering
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export const buildQuery = (params: QueryParams = {}): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) searchParams.set('page', params.page.toString());
  if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString());
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  
  // Add filters
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
  }
  
  return searchParams.toString();
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// İstek interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    // ✨ Hem localStorage hem sessionStorage kontrol et
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor - hata yönetimi ve JSON kontrolü
api.interceptors.response.use(
  (response) => {
    // JSON kontrolü
    try {
      assertJson(response);
    } catch (e) {
      console.warn('⚠️ Non-JSON Response:', response.headers['content-type']);
    }
    
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      contentType: response.headers['content-type']
    });
    return response;
  },
  (error: AxiosError) => {
    // Content-Type kontrolü
    const contentType = error.response?.headers['content-type'];
    
    let apiError: ApiError;
    
    if (error.response && !contentType?.includes('application/json')) {
      // HTML hata sayfası geliyorsa
      apiError = {
        message: 'Sunucudan beklenmeyen yanıt (JSON değil).',
        status: error.response.status || 0,
        data: { raw: error.response.data, contentType }
      };
    } else {
      // Normal JSON hata
      apiError = {
        message: (error.response?.data as any)?.message || error.message || 'Bilinmeyen hata',
        status: error.response?.status || 0,
        data: error.response?.data
      };
    }
    
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      contentType,
      message: apiError.message,
      data: error.response?.data
    });
    
    // 401 durumunda token'ı temizle
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(apiError);
  }
);

export default api;
