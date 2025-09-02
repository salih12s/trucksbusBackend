import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface AdminRouteProps { 
  children: ReactNode; 
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // DEBUG: User verisini kontrol et
  console.log('🔧 DEBUG AdminRoute - Current user:', user);
  console.log('🔧 DEBUG AdminRoute - User role:', user?.role);
  console.log('🔧 DEBUG AdminRoute - Is authenticated:', isAuthenticated);
  console.log('🔧 DEBUG AdminRoute - Is admin:', user?.role === 'ADMIN');

  if (!isInitialized || isLoading) {
    console.log('⏳ AdminRoute: Still loading...');
    return (
      <Box sx={{ 
        display:'flex', 
        flexDirection:'column', 
        alignItems:'center', 
        justifyContent:'center', 
        minHeight:'100vh', 
        bgcolor:'#f8fafc' 
      }}>
        <CircularProgress size={60} sx={{ color:'#0F2027', mb:2 }} />
        <Typography variant="h6" sx={{ color:'#0F2027' }}>
          Admin Paneli Yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ AdminRoute: User not authenticated, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user?.role?.toUpperCase() !== 'ADMIN') {
    console.log('❌ AdminRoute: User is not admin, redirecting to home');
    console.log('🔍 AdminRoute: User role is:', user?.role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ AdminRoute: Admin user verified, rendering admin content');
  return <>{children}</>;
};

export default AdminRoute;
