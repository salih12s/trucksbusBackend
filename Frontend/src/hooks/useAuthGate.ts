import { useAuth } from '../context/AuthContext';

export const useAuthGate = () => {
  const { isInitialized, isAuthenticated } = useAuth();
  return isInitialized && isAuthenticated;
};
