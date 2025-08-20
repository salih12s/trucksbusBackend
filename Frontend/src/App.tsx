import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ListingProvider } from './context/ListingContext';
import { WebSocketProvider } from './context/WebSocketContext';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminRoute from './components/auth/AdminRoute';
import NewHomePage from './pages/user/NewHomePage';
import NewCategoryPage from './pages/user/NewCategoryPage';
import CategorySelection from './pages/listing/CategorySelection';
import BrandSelection from './pages/listing/BrandSelection';
import ModelSelection from './pages/listing/ModelSelection';
import VariantSelection from './pages/listing/VariantSelection';
import MinibusAdForm from './pages/Forms/MinibusAdForm';
import KamyonAdForm from './pages/Forms/KamyonAdForm';
import OtobusAdForm from './pages/Forms/OtobusAdForm';
import CekiciAdForm from './pages/Forms/CekiciAdForm';
import KayaTipiForm from './pages/Forms/Dorse/Damperli/KayaTipiForm';
import KapakliTipForm from './pages/Forms/Dorse/Damperli/KapakliTipForm';
import HafriyatTipiForm from './pages/Forms/Dorse/Damperli/HafriyatTipiForm';
import HavuzHardoxTipiForm from './pages/Forms/Dorse/Damperli/HavuzHardoxTipiForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllListings from './pages/admin/AllListings';
import PendingListings from './pages/admin/PendingListings';
import Complaints from './pages/admin/Complaints';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import Users from './pages/admin/Users';
// 🔧 Admin messages kaldırıldı - tek mimari
import RealTimeMessagesPage from './pages/messages/RealTimeMessagesPage';
import MyReportsPage from './pages/user/MyReportsPage';
import FavoritesPage from './pages/user/FavoritesPage';
import ListingDetail from './pages/user/ListingDetail';
import Profile from './pages/user/Profile';
import MyListings from './pages/user/MyListings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

const App: React.FC = () => {
  console.log('🚀 App component with full routing rendering...');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <FavoritesProvider>
            <ListingProvider>
              <WebSocketProvider>
                <Router>
                <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                
                <Route path="/category-selection" element={<CategorySelection />} />
                <Route path="/brand-selection/:vehicleTypeId" element={<BrandSelection />} />
                <Route path="/model-selection/:brandId" element={<ModelSelection />} />
                <Route path="/variant-selection/:modelId" element={<VariantSelection />} />
              
              <Route path="/create-ad/minibus/:variantId" element={<MinibusAdForm />} />
              <Route path="/create-ad/kamyon/:variantId" element={<KamyonAdForm />} />
              <Route path="/create-ad/otobus/:variantId" element={<OtobusAdForm />} />
              <Route path="/create-ad/cekici/:variantId" element={<CekiciAdForm />} />
              
          
              
              <Route path="/create-ad/dorse/damperli/kaya-tipi" element={<KayaTipiForm />} />
              <Route path="/create-ad/dorse/damperli/kapakli-tip" element={<KapakliTipForm />} />
              <Route path="/create-ad/dorse/damperli/hafriyat-tipi" element={<HafriyatTipiForm />} />
              <Route path="/create-ad/dorse/damperli/havuz-hardox-tipi" element={<HavuzHardoxTipiForm />} />
              
              {/* User Routes with Layout */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<NewHomePage />} />
                <Route path="categories" element={<NewCategoryPage />} />
                <Route path="category/:id" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId/model/:modelId" element={<NewCategoryPage />} />
                <Route path="listing/:id" element={<ListingDetail />} />
                <Route path="messages" element={<RealTimeMessagesPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="my-reports" element={<MyReportsPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="my-listings" element={<MyListings />} />
                {/* 🔧 Alias route for backward compatibility */}
                <Route path="real-time-messages" element={<RealTimeMessagesPage />} />
              </Route>
              
              {/* Admin Routes with Layout */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="all-listings" element={<AllListings />} />
                <Route path="pending-listings" element={<PendingListings />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="users" element={<Users />} />
                {/* 🔧 Admin messages kaldırıldı - tek mimari */}
              </Route>
              
              {/* Test Route without Layout */}
              
              {/* Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WebSocketProvider>
      </ListingProvider>
    </FavoritesProvider>
  </NotificationProvider>
</AuthProvider>
</ThemeProvider>
  );
};

export default App;