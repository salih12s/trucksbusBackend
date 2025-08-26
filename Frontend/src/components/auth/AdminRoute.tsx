import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Loading durumunda güzel bir loading ekranı göster
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f8fafc',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#0F2027', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#0F2027' }}>
          Yükleniyor...
        </Typography>
      </Box>
    );
  }

  // Giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin değilse ana sayfaya yönlendir
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
