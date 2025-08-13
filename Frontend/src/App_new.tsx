import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Components
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import NewHomePage from './pages/user/NewHomePage';
import ListingDetail from './pages/user/ListingDetail';
import NewCategoryPage from './pages/user/NewCategoryPage';
import CreateListing from './pages/user/CreateListing';
import Profile from './pages/user/Profile';
import Messages from './pages/user/Messages';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

const App: React.FC = () => {
  console.log('🚀 App component rendering...');
  
  return (
    <ErrorBoundary>
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

                {/* User Routes */}
                <Route path="/" element={<UserLayout />}>
                  <Route index element={<NewHomePage />} />
                  <Route path="categories" element={<NewCategoryPage />} />
                  <Route path="category/:id" element={<NewCategoryPage />} />
                  <Route path="category/:id/vehicle-type/:vehicleTypeId" element={<NewCategoryPage />} />
                  <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId" element={<NewCategoryPage />} />
                  <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId/model/:modelId" element={<NewCategoryPage />} />
                  <Route path="listing/:id" element={<ListingDetail />} />
                  <Route 
                    path="create-listing" 
                    element={
                      <ProtectedRoute>
                        <CreateListing />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="messages" 
                    element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    } 
                  />
                </Route>

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="listings" element={<AdminListings />} />
                </Route>

                {/* Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
