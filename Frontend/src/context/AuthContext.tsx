import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthResponse }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('🔐 Auth action:', action.type, action);
  
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🏗️ AuthProvider initializing...');
  
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log('🔐 Current auth state:', state);

  useEffect(() => {
    console.log('🔍 AuthProvider useEffect running...');
    const token = localStorage.getItem('token');
    console.log('🎟️ Token from localStorage:', token ? 'exists' : 'not found');
    
    if (token) {
      // Verify token and get user data
      console.log('🔒 Verifying token...');
      authService.verifyToken(token)
        .then((user: User) => {
          console.log('✅ Token verified, user:', user);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token, refreshToken: '' }
          });
        })
        .catch((error) => {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_LOGOUT' });
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Giriş başarısız' });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Kayıt başarısız' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
