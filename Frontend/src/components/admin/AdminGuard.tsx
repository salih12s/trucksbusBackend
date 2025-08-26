import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Yetkilendirme kontrol ediliyor...
        </Typography>
      </Box>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  if (user.role !== 'ADMIN') {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
        textAlign="center"
      >
        <Typography variant="h5" color="error">
          Yetkisiz Erişim
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admin yetkisi gereklidir.
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has admin role
  return <>{children}</>;
};

export default AdminGuard;
