import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import UserHeader from './UserHeader';
import Footer from './Footer';

const UserLayout: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserHeader />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default UserLayout;
