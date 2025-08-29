import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('🎟️ DEBUG: StorageHelper.getToken():', Boolean(token), token ? token.substring(0, 20) + '...' : 'null');
    return token;
  },
  getUser: () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    console.log('👤 DEBUG: StorageHelper.getUser():', Boolean(userStr));
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr) as User;
      console.log('✅ DEBUG: User parsed successfully:', user.email);
      return user;
    } catch (e) {
      console.error('❌ DEBUG: Failed to parse saved user:', e);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return null;
    }
  },
  isRememberMe: () => localStorage.getItem('rememberMe') === 'true',
  setAuth: (token: string, user: User, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('rememberMe', 'true');
      // Session storage'ı temizle
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      // Local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
    }
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

// ✨ Initial state calculator
const getInitialState = (): AuthState => {
  console.log('🏗️ DEBUG: getInitialState() çağırıldı');
  const token = StorageHelper.getToken();
  const user = StorageHelper.getUser();
  
  const initialState = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading: Boolean(token), // Token varsa loading, yoksa false
    error: null,
    isInitialized: false, // Henüz initialize olmadı
  };
  
  console.log('🎯 DEBUG: Initial state:', {
    hasToken: Boolean(token),
    hasUser: Boolean(user),
    isAuthenticated: initialState.isAuthenticated,
    isLoading: initialState.isLoading,
    isInitialized: initialState.isInitialized
  });
  
  return initialState;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🏗️ AuthProvider: Component mounting...');
  
  const [state, setState] = useState<AuthState>(getInitialState);
  const isInitializing = useRef(false); // ✨ Initialization guard

  // ✨ State updater function
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // ✨ Authentication initialization - SADECE BİR KEZ ÇALIŞIR
  useEffect(() => {
    if (isInitializing.current || state.isInitialized) {
      console.log('🚫 AuthProvider: Already initialized, skipping...');
      return;
    }

    isInitializing.current = true;
    console.log('🔧 AuthProvider: Starting initialization...');

    const initializeAuth = async () => {
      const token = StorageHelper.getToken();
      const savedUser = StorageHelper.getUser();

      console.log('🎟️ Token exists:', Boolean(token));
      console.log('👤 Saved user exists:', Boolean(savedUser));

      // Token yoksa hemen authenticated değil olarak işaretle
      if (!token) {
        console.log('❌ No token found, setting unauthenticated');
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

      // Token var ama user yoksa verify et
      if (token && !savedUser) {
        console.log('🔒 Token exists but no saved user, verifying...');
        
        try {
          const user = await authService.verifyToken(token);
          console.log('✅ Token verified successfully:', user);
          
          StorageHelper.setAuth(token, user, StorageHelper.isRememberMe());
          updateState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        } catch (error: any) {
          console.error('❌ Token verification failed:', error);
          StorageHelper.clearAuth();
          updateState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: error.message || 'Token verification failed'
          });
        }
        return;
      }

      // Token ve saved user ikisi de var
      if (token && savedUser) {
        console.log('✅ Token and user found, setting authenticated immediately');
        
        // UI'ı authenticate et ve initialization'ı tamamla
        updateState({
          user: savedUser,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null
        });

        // REMOVED: Background token verification to prevent infinite loops
        // The token will be verified naturally when the user makes their first authenticated request
        console.log('ℹ️ Skipping background token verification to prevent infinite loops');
      }
    };

    initializeAuth();
  }, []); // ✨ Boş dependency array - sadece mount'ta çalışır

  // ✅ 401 sinyalini dinle - merkezi logout
  useEffect(() => {
    const onUnauthorized = () => {
      console.log('🚫 Received auth:unauthorized event - logging out');
      StorageHelper.clearAuth();
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
  }, [updateState]);

  // ✨ Login function
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<User> => {
    console.log('🔐 Login attempt started...');
    
    updateState({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password, rememberMe });
      console.log('✅ Login successful');
      console.log('👤 DEBUG: Received user data:', response.user);
      console.log('🔑 DEBUG: User role:', response.user.role);
      console.log('🎟️ DEBUG: Token received:', Boolean(response.token));

      StorageHelper.setAuth(response.token, response.user, rememberMe);
      
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

      StorageHelper.setAuth(response.token, response.user, false); // Register'da default olarak remember me false
      
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
