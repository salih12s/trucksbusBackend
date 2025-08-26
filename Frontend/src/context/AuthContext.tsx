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
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
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
  isLoading: true, // App başlarken loading state'te başla
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
    const savedUser = localStorage.getItem('user');
    
    console.log('🎟️ Token from localStorage:', token ? 'exists' : 'not found');
    console.log('👤 User from localStorage:', savedUser ? 'exists' : 'not found');
    
    if (!token) {
      console.log('❌ No token found, setting not authenticated');
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    // Eğer saved user varsa, önce onu kullan
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('✅ Using saved user data:', user);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token, refreshToken: '' }
        });
        
        // Background'da token verify et ama UI'ı bloklamadan
        authService.verifyToken(token)
          .then((verifiedUser: User) => {
            console.log('✅ Token verified in background, updating user:', verifiedUser);
            localStorage.setItem('user', JSON.stringify(verifiedUser));
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: verifiedUser, token, refreshToken: '' }
            });
          })
          .catch((error) => {
            console.error('❌ Background token verification failed:', error);
            // Sadece 401 durumunda logout yap
            if (error.response?.status === 401) {
              console.log('🚫 401 error, logging out');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          });
        
        return;
      } catch (e) {
        console.error('Saved user data parse error:', e);
        localStorage.removeItem('user');
      }
    }

    // Saved user yoksa token verify et
    console.log('🔒 Verifying token...');
    authService.verifyToken(token)
      .then((user: User) => {
        console.log('✅ Token verified, user:', user);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token, refreshToken: '' }
        });
      })
      .catch((error) => {
        console.error('❌ Token verification failed:', error);
        
        // Sadece 401/403 durumunda logout yap
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('� Authentication error, logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_LOGOUT' });
        } else {
          // Network hatası vs. durumunda previous state'i kullan veya logout
          console.log('🌐 Network error, checking if we have valid saved data');
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, token, refreshToken: '' }
              });
            } catch {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        }
      });
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response.user;
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Giriş başarısız' });
      throw error;
    }
  };

  const register = async (userData: any): Promise<User> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response.user;
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Kayıt başarısız' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
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
