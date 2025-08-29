import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('👥 DEBUG: GuestRoute render:', {
    path: location.pathname,
    isInitialized,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    timestamp: new Date().toISOString()
  });

  // init/yükleniyor ekranı
  if (!isInitialized || isLoading) {
    console.log('⏳ DEBUG: GuestRoute waiting for initialization...');
    return (
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Eğer zaten authenticated ise ve user bilgisi varsa
  if (isAuthenticated && user) {
    const from = (location.state as any)?.from?.pathname;
    
    if (from) {
      console.log('🔄 DEBUG: GuestRoute redirecting to FROM location:', from);
      return <Navigate to={from} replace />;
    }
    
    // Role'e göre yönlendir - Debug'lar çok detaylı
    console.log('🔍 DEBUG: Checking user role for redirect...');
    console.log('🔍 DEBUG: user object:', user);
    console.log('🔍 DEBUG: user.role:', user.role);
    console.log('🔍 DEBUG: user.role === "ADMIN":', user.role === 'ADMIN');
    
    if (user.role === 'ADMIN') {
      console.log('✅ DEBUG: GuestRoute redirecting ADMIN to /admin');
      return <Navigate to="/admin" replace />;
    } else {
      console.log('✅ DEBUG: GuestRoute redirecting USER to /');
      return <Navigate to="/" replace />;
    }
  }

  // Authenticated ama user yok (edge case)
  if (isAuthenticated && !user) {
    console.log('⚠️ DEBUG: GuestRoute - authenticated but no user data');
    return (
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('✅ DEBUG: GuestRoute rendering children (not authenticated)');
  return <>{children}</>;
};

export default GuestRoute;
