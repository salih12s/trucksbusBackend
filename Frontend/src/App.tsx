import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SocketProvider } from '@/context/SocketContext';

// Layout Components
import UserLayout from '@/components/layout/UserLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// User Pages
import HomePage from '@/pages/user/HomePage';
import ListingDetail from '@/pages/user/ListingDetail';
import CategoryPage from '@/pages/user/CategoryPage';
import CreateListing from '@/pages/user/CreateListing';
import Profile from '@/pages/user/Profile';
import Messages from '@/pages/user/Messages';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminListings from '@/pages/admin/AdminListings';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminReports from '@/pages/admin/AdminReports';

// Protected Route Component
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';

// Material-UI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Public User Routes */}
                <Route path="/" element={<UserLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="listing/:id" element={<ListingDetail />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                </Route>

                {/* Protected User Routes */}
                <Route path="/user" element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }>
                  <Route path="create-listing" element={<CreateListing />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="messages" element={<Messages />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="listings" element={<AdminListings />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reports" element={<AdminReports />} />
                </Route>

                {/* Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
