import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { api } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // ✨ Yeni: Initialization durumunu takip et
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

// ✨ Helper: Storage operations
const StorageHelper = {
  getToken: () => {
    // 🔧 FİX: Session storage öncelikli kontrol
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) return sessionToken;
    
    const localToken = localStorage.getItem('token');
    return localToken;
  },
  
  getUser: () => {
    // 🔧 FİX: Session storage öncelikli kontrol
    const sessionUserStr = sessionStorage.getItem('user');
    if (sessionUserStr) {
      try {
        return JSON.parse(sessionUserStr);
      } catch (e) {
        console.error('Session user parse error:', e);
      }
    }
    
    const localUserStr = localStorage.getItem('user');
    if (localUserStr) {
      try {
        return JSON.parse(localUserStr);
      } catch (e) {
        console.error('Local user parse error:', e);
      }
    }
    
    return null;
  },
  
  setAuth: (token: string, user: User, rememberMe: boolean, refreshToken?: string) => {
    console.log('💾 Storing auth data:', { 
      token: token ? `${token.substring(0, 20)}...` : null, 
      user_id: user?.id, 
      is_corporate: user?.is_corporate, 
      role: user?.role,
      rememberMe 
    });
    
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
  },
  
  isRememberMe: () => {
    return Boolean(localStorage.getItem('token'));
  }
};

// ✨ Initial state calculator
const getInitialState = (): AuthState => {
  const token = StorageHelper.getToken();
  const user = StorageHelper.getUser();
  
  return {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading: Boolean(token),
    error: null,
    isInitialized: false,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(getInitialState);
  const initRef = useRef(false); // Tek guard yeterli

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // ✨ SADECE BİR KEZ initialize
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      const token = StorageHelper.getToken();

      if (!token) {
        updateState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null
        });
        return;
      }

      // ✨ TOKEN VAR - HER ZAMAN VERIFY ET (expired olabilir)
      if (token) {
        try {
          const user = await authService.verifyToken(token);
          StorageHelper.setAuth(token, user, StorageHelper.isRememberMe());
          
          // ✨ VERIFY SONRASI DA AXIOS DEFAULT HEADER'A KOY
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          updateState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        } catch (error: any) {
          console.log('🚨 Token expired/invalid, clearing storage');
          StorageHelper.clearAuth();
          updateState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        }
      }
    };

    initAuth();
  }, [updateState]);

    // ✅ 401 sinyalini dinle - merkezi logout
  useEffect(() => {
    const onUnauthorized = () => {
      console.log('🚫 Received auth:unauthorized event -> logging out');
      StorageHelper.clearAuth();
      
      // ✨ AXIOS DEFAULT HEADER'I TEMİZLE
      delete api.defaults.headers.common.Authorization;
      updateState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Oturum süresi doldu'
      });
    };
    
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [updateState]);// ✨ Login function
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<User> => {
    console.log('🔐 Login attempt started...');
    
    updateState({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password, rememberMe });
      console.log('✅ Login successful');
      console.log('👤 DEBUG: Received user data:', response.user);
      console.log('🔑 DEBUG: User role:', response.user.role);
      console.log('🎟️ DEBUG: Token received:', Boolean(response.token));

      StorageHelper.setAuth(response.token, response.user, rememberMe, response.refreshToken);
      
      // ✨ ANINDA AXIOS DEFAULT HEADER'A KOY - Race condition önle
      api.defaults.headers.common.Authorization = `Bearer ${response.token}`;
      
      updateState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true
      });

      return response.user;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      updateState({
        isLoading: false,
        error: error.message || 'Login failed'
      });
      
      throw error;
    }
  }, []);

  // ✨ Register function
  const register = useCallback(async (userData: any): Promise<User> => {
    console.log('📝 Register attempt started...');
    
    updateState({ isLoading: true, error: null });

    try {
      const response = await authService.register(userData);
      console.log('✅ Registration successful');

      // 🔧 EKLE: Çifte garanti için axios header'ı set et
      api.defaults.headers.common.Authorization = `Bearer ${response.token}`;

      StorageHelper.setAuth(response.token, response.user, false, response.refreshToken); // Register'da default olarak remember me false
      
      updateState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true
      });

      // 🔧 FİX: İsteğe bağlı profil yenileme - corporate durumu için ekstra garanti
      setTimeout(async () => {
        try {
          console.log('🔄 Optional profile refresh starting...');
          const profileResponse = await authService.verifyToken(response.token);
          if (profileResponse && profileResponse.is_corporate !== undefined) {
            console.log('🔄 Profile refreshed with corporate status:', profileResponse.is_corporate);
            const newUserData = { ...response.user, ...profileResponse };
            updateState({
              user: newUserData
            });
            StorageHelper.setAuth(response.token, newUserData, false, response.refreshToken);
          }
        } catch (err) {
          console.log('🔄 Optional profile refresh failed (non-critical):', err);
        }
      }, 500);

      return response.user;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      updateState({
        isLoading: false,
        error: error.message || 'Registration failed'
      });
      
      throw error;
    }
  }, []);

  // ✨ Logout function
  const logout = useCallback((): void => {
    console.log('🚪 Logout initiated...');
    
    StorageHelper.clearAuth();
    
    // ✨ AXIOS DEFAULT HEADER'I TEMİZLE  
    delete api.defaults.headers.common.Authorization;
    
    updateState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: true
    });
    
    // Force reload to clear any lingering state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }, []);

  // ✨ Update user function
  const updateUser = useCallback((userData: Partial<User>): void => {
    console.log('🔄 User data update:', userData);
    
    setState(prevState => {
      if (!prevState.user) return prevState;
      
      const updatedUser = { ...prevState.user, ...userData };
      
      // Storage'ı da güncelle
      if (prevState.token) {
        StorageHelper.setAuth(prevState.token, updatedUser, StorageHelper.isRememberMe());
      }
      
      return {
        ...prevState,
        user: updatedUser
      };
    });
  }, []);

  // ✨ Clear error function
  const clearError = useCallback((): void => {
    updateState({ error: null });
  }, []);

  // ✨ Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  console.log('🔐 AuthProvider: Current state:', {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    hasUser: Boolean(state.user),
    hasToken: Boolean(state.token)
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✨ Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
