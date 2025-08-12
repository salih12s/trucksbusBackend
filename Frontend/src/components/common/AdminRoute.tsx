import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user is admin (you'll need to add isAdmin field to User type)
  // For now, we'll use a simple check - you should implement proper role checking
  const isAdmin = user?.email?.includes('admin') || false; // Temporary check

  if (!isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography variant="h4" color="error">
          Yetkisiz Erişim
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
