import axios, { AxiosResponse } from 'axios';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

// ✅ Ortak helper: token'ı hem session hem local'dan oku (session öncelikli)
const getStoredToken = () =>
  sessionStorage.getItem('token') || localStorage.getItem('token');

const API_ENDPOINTS = [
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api',
  'http://localhost:3005/api'
];

const API_BASE_URL = API_ENDPOINTS[0];
console.log('🌐 Using API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// ✨ BOOT TOKEN - Uygulama açılışında varsa token'ı header'a koy
const bootToken = getStoredToken();
if (bootToken) {
  api.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
  console.log('🎟️ Boot token set to axios defaults');
}


// ✅ Request interceptor artık her iki depoyu da kontrol ediyor
api.interceptors.request.use((config) => {
  const token = getStoredToken(); // <-- önemli değişiklik
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🎟️ Added token to request:', config.url);
  }
  return config;
});

// ✅ 401'de sadece event at - AuthProvider karar versin
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚫 401 - dispatching auth:unauthorized');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('🔐 Login attempt:', { email: credentials.email, hasPassword: !!credentials.password });
      console.log('🌐 API URL:', `${API_BASE_URL}/auth/login`);
      
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('👤 DEBUG authService: User data received:', response.data.data.user);
        console.log('🔑 DEBUG authService: User role:', response.data.data.user?.role);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Giriş başarısız');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      // Network error handling
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
      }
      
      // Timeout error handling  
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        throw new Error('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Giriş başarısız';
      throw new Error(errorMessage);
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('📝 Register attempt:', { 
        email: userData.email, 
        firstName: userData.firstName, 
        isCorporate: userData.is_corporate,
        companyName: userData.company_name
      });
      
      console.log('🔍 Full userData object:', userData);
      
      // Frontend'den gelen userData'yı backend formatına dönüştür
      const backendData: any = {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name || userData.firstName,  // 🔧 Both field names supported
        last_name: userData.last_name || userData.lastName,    // 🔧 Both field names supported
        phone: userData.phone,
        city: userData.city || 'Belirtilmemiş',
        district: userData.district || 'Belirtilmemiş',
        kvkk_accepted: userData.kvkk_accepted || false,
        is_corporate: userData.is_corporate || false,
      };

      // Kurumsal hesap verileri varsa ekle
      if (userData.is_corporate) {
        if (userData.company_name) {
          backendData.company_name = userData.company_name;
        }
        if (userData.tax_number) {
          backendData.tax_number = userData.tax_number;
        }
      }
      
      console.log('📤 Sending register data:', backendData);
      
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', backendData);
      
      console.log('✅ Register response:', response.data);
      
      if (response.data.success && response.data.data) {
        // 🔧 EKLE: Register sonrası axios header'ı set et
        api.defaults.headers.common.Authorization = `Bearer ${response.data.data.token}`;
        return response.data.data;
      }
      throw new Error(response.data.message || 'Kayıt başarısız');
    } catch (error: any) {
      console.error('❌ Register error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Kayıt başarısız';
      throw new Error(errorMessage);
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
  },

  verifyToken: async (token: string): Promise<User> => {
    if (!token) throw new Error('No token to verify');

    try {
      console.log('🔍 Verifying token...');
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Token verification successful');
      console.log('📄 User data from /auth/me:', response.data.data?.user);
      
      if (!response.data?.success || !response.data?.data?.user) {
        throw new Error('Token doğrulama başarısız');
      }
      
      return response.data.data.user;
    } catch (error: any) {
      console.error('❌ Token verification failed:', error);
      throw new Error(error.response?.data?.message || 'Token doğrulama başarısız');
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post('/auth/forgot-password', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Şifre sıfırlama isteği başarısız');
      }
    } catch (error: any) {
      throw error;
    }
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post('/auth/reset-password', { 
        token,
        newPassword: password 
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Şifre sıfırlama başarısız');
      }
    } catch (error: any) {
      throw error;
    }
  },

  deleteAccount: async (password: string): Promise<void> => {
    try {
      console.log('🗑️ Delete account attempt started...');
      console.log('🌐 Using base URL:', API_BASE_URL);
      console.log('🔑 Token available:', !!getStoredToken());
      
      const response: AxiosResponse<ApiResponse<any>> = await api.delete('/auth/delete-account', {
        data: { password },
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Hesap silme işlemi başarısız');
      }
      
      console.log('✅ Account deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete account error:', error);
      console.error('❌ Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If first API fails, try fallback endpoints
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('🔄 Trying fallback API endpoints...');
        for (let i = 1; i < API_ENDPOINTS.length; i++) {
          try {
            console.log(`🔄 Trying endpoint ${i + 1}: ${API_ENDPOINTS[i]}`);
            const fallbackResponse = await axios.delete(`${API_ENDPOINTS[i]}/auth/delete-account`, {
              data: { password },
              headers: {
                'Authorization': `Bearer ${getStoredToken()}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            });
            
            if (fallbackResponse.data.success) {
              console.log(`✅ Account deleted successfully with endpoint ${i + 1}`);
              return;
            }
          } catch (fallbackError) {
            console.log(`❌ Endpoint ${i + 1} failed:`, fallbackError);
            continue;
          }
        }
      }
      
      throw error;
    }
  }
};

export { api };
export default api;
