import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import UserLayout from './components/layout/UserLayout';
import NewHomePage from './pages/user/NewHomePage';
import NewCategoryPage from './pages/user/NewCategoryPage';
import CategorySelection from './pages/listing/CategorySelection';
import BrandSelection from './pages/listing/BrandSelection';
import ModelSelection from './pages/listing/ModelSelection';
import VariantSelection from './pages/listing/VariantSelection';
import MinibusAdForm from './pages/listing/MinibusAdForm';
import KamyonAdForm from './pages/listing/KamyonAdForm';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

const App: React.FC = () => {
  console.log('🚀 App component with full routing rendering...');
  
  return (
    <AuthProvider>
      <NotificationProvider>
          <Router>
            <Routes>
              {/* Auth Routes - Layout olmadan */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              {/* Category Selection - Layout olmadan */}
              <Route path="/category-selection" element={<CategorySelection />} />
              <Route path="/brand-selection/:vehicleTypeId" element={<BrandSelection />} />
              <Route path="/model-selection/:brandId" element={<ModelSelection />} />
              <Route path="/variant-selection/:modelId" element={<VariantSelection />} />
              
              {/* Ad Creation Forms - Layout olmadan */}
              <Route path="/create-ad/minibus/:variantId" element={<MinibusAdForm />} />
              <Route path="/create-ad/kamyon/:variantId" element={<KamyonAdForm />} />
              
              {/* User Routes with Layout */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<NewHomePage />} />
                <Route path="categories" element={<NewCategoryPage />} />
                <Route path="category/:id" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId/model/:modelId" element={<NewCategoryPage />} />
              </Route>
              
              {/* Test Route without Layout */}
              <Route path="/test" element={
                <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                  <h1>🚛 TruckBus - Test Sayfası</h1>
                  <p>Layout olmadan test sayfası!</p>
                  <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
                    ✅ Tüm route'lar eklendi
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/" style={{ display: 'block', color: '#1976d2' }}>← Ana sayfa</Link>
                    <Link to="/categories" style={{ display: 'block', color: '#1976d2' }}>← Kategoriler</Link>
                  </div>
                </div>
              } />
              
              {/* Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
