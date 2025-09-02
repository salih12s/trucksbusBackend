import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ListingProvider } from './context/ListingContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogProvider';
import { PromptDialogProvider } from './context/PromptDialogProvider';
import ScrollToTop from './components/common/ScrollToTop';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminRoute from './components/auth/AdminRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import NewHomePage from './pages/user/NewHomePage';
import NewCategoryPage from './pages/user/NewCategoryPage';

import CategoryListingsPage from './pages/listings/CategoryListingsPage';
import CategorySelection from './pages/listing/CategorySelection';
import BrandSelection from './pages/listing/BrandSelection';
import ModelSelection from './pages/listing/ModelSelection';
import VariantSelection from './pages/listing/VariantSelection';
import MinibusAdForm from './pages/Forms/MinibusAdForm';
import KamyonAdForm from './pages/Forms/KamyonAdForm';
import OtobusAdForm from './pages/Forms/OtobusAdForm';
import CekiciAdForm from './pages/Forms/CekiciAdForm';
import KapakliTipForm from './pages/Forms/Dorse/Damperli/KapakliTipForm';
import FrigofirikForm from './pages/Forms/FrigofirikForm';
import HavuzluForm from './pages/Forms/Lowbed/HavuzluForm';
import OndekirmalıForm from './pages/Forms/Lowbed/OndekirmalıForm';
import KapakliForm from './pages/Forms/Kuruyuk/KapakliForm';
import KapakliKayaTipiForm from './pages/Forms/Kuruyuk/KapakliKayaTipiForm';
import KapaksızPlatformForm from './pages/Forms/Kuruyuk/KapaksızPlatformForm';
import PilotForm from './pages/Forms/Tenteli/PilotForm';
import MidilliForm from './pages/Forms/Tenteli/MidilliForm';
import YariMidilliForm from './pages/Forms/Tenteli/YariMidilliForm';
import TankerForm from './pages/Forms/Tanker/TankerForm';
import TekstilForm from './pages/Forms/Tekstil/TekstilForm';
import SilobasForm from './pages/Forms/Silobas/SilobasForm';
import DamperSasiForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/DamperSasi/DamperSasiForm';
import KilcikSasiForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/KilcikSasi/KilcikSasiForm';
import PlatformSasiForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/PlatformSasi/PlatformSasiForm';
import RomorkKonvantöruForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/RomorkKonvantoru/RomorkKonvantöruForm';
import TankerSasiForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/TankerSasi/TankerSasiForm';
import UzayabilirSasiForm from './pages/Forms/KonteynerTasiyiciSasiGrubu/UzayabilirSasi/UzayabilirSasiForm';
import KamyonRomorkForm from './pages/Forms/KamyonRomorklari/KamyonRomorkForm';
import AcikKasaForm from './pages/Forms/TarimRomork/AcikKasa/AcikKasaForm';
import KapaliKasaForm from './pages/Forms/TarimRomork/KapaliKasa/KapaliKasaForm';
import SulamaForm from './pages/Forms/TarimRomork/SulamaForm';
import TarimTankerForm from './pages/Forms/TarimRomork/TarimTankerForm';
import BoruRomorkForm from './pages/Forms/TasimaRomorklari/BoruRomorkForm';
import FrigoRomorkForm from './pages/Forms/TasimaRomorklari/FrigoRomorkForm';
import HayvanRomorkForm from './pages/Forms/TasimaRomorklari/HayvanRomorkForm';
import PlatformRomorkForm from './pages/Forms/TasimaRomorklari/PlatformRomorkForm';
import SeyehatRomorkForm from './pages/Forms/TasimaRomorklari/SeyehatRomorkForm';
import TupDamacanaRomorkForm from './pages/Forms/TasimaRomorklari/TupDamacanaRomorkForm';
import VasitaRomorkForm from './pages/Forms/TasimaRomorklari/VasitaRomorkForm';
import YukRomorkForm from './pages/Forms/TasimaRomorklari/YukRomorkForm';
import OzelAmacliRomorkForm from './pages/Forms/OzelAmacliRomork/OzelAmacliRomorkForm';
import AhsapKasaForm from './pages/Forms/KaroserUstyapi/Damperli/AhsapKasaForm';
import HafriyatTipiForm from './pages/Forms/KaroserUstyapi/Damperli/HafriyatTipiForm';
import HavuzHardoxTipiForm from './pages/Forms/KaroserUstyapi/Damperli/HavuzHardoxTipiForm';
import KayaTipiForm from './pages/Forms/KaroserUstyapi/Damperli/KayaTipiForm';
// Dorse Damperli form'ları  
import { default as HafriyatTipiFormDorse } from './pages/Forms/Dorse/Damperli/HafriyatTipiForm';
import { default as HavuzHardoxTipiFormDorse } from './pages/Forms/Dorse/Damperli/HavuzHardoxTipiForm';
import { default as KayaTipiFormDorse } from './pages/Forms/Dorse/Damperli/KayaTipiForm';
import AcikKasaFormSabit from './pages/Forms/KaroserUstyapi/SabitKabin/AcikKasaForm';
import KapaliKasaFormSabit from './pages/Forms/KaroserUstyapi/SabitKabin/KapaliKasaForm';
import OzelKasaForm from './pages/Forms/KaroserUstyapi/SabitKabin/OzelKasaForm';
import TekliAracForm from './pages/Forms/OtoKurtariciTasiyici/TekliAracForm';
import CokluAracForm from './pages/Forms/OtoKurtariciTasiyici/CokluAracForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllListings from './pages/admin/AllListings';
import PendingListings from './pages/admin/PendingListings';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import Users from './pages/admin/Users';
// 🔧 Admin messages kaldırıldı - tek mimari
import RealTimeMessagesPage from './pages/messages/RealTimeMessagesPage';
import MyReportsPage from './pages/user/MyReportsPage';
import FavoritesPage from './pages/user/FavoritesPage';
import DetailOrchestrator from './pages/listings/DetailOrchestrator';
import EditListingOrchestrator from './pages/listings/EditListingOrchestrator';
import Profile from './pages/user/Profile';
import MyListings from './pages/user/MyListings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AboutPage from './pages/static/AboutPage';
import ContactPage from './pages/static/ContactPage';
import PrivacyPage from './pages/static/PrivacyPage';
import TermsPage from './pages/static/TermsPage';
import KVKKPage from './pages/static/KVKKPage';
import MyStorePage from './pages/user/MyStorePage';
import DopingPage from './pages/user/DopingPage';
import CorporateStorePage from './pages/store/CorporateStorePage';

const App: React.FC = () => {
  console.log('🚀 App component with full routing rendering...');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmDialogProvider>
        <PromptDialogProvider>
          <AuthProvider>
            <NotificationProvider>
              <FavoritesProvider>
                <ListingProvider>
                  <WebSocketProvider>
                <Router>
                  <ScrollToTop />
                <Routes>
                {/* 🔐 Auth rotaları - Login'den GuestRoute'u kaldıralım */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                <Route path="/category-selection" element={<CategorySelection />} />
                <Route path="/brand-selection/:vehicleTypeId" element={<BrandSelection />} />
                <Route path="/model-selection/:brandId" element={<ModelSelection />} />
                <Route path="/variant-selection/:modelId" element={<VariantSelection />} />
              
              {/* User Routes with Layout */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<NewHomePage />} />
                <Route path="category/:category" element={<CategoryListingsPage />} />
                <Route path="categories" element={<NewCategoryPage />} />
                <Route path="category/:id" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId" element={<NewCategoryPage />} />
                <Route path="category/:id/vehicle-type/:vehicleTypeId/brand/:brandId/model/:modelId" element={<NewCategoryPage />} />
                <Route path="listing/:id" element={<DetailOrchestrator />} />
                <Route path="store/:userId" element={<CorporateStorePage />} />
                
                {/* 🔒 Korumalı kullanıcı rotaları */}
                <Route path="edit-listing/:id" element={<ProtectedRoute><EditListingOrchestrator /></ProtectedRoute>} />
                <Route path="messages" element={<ProtectedRoute><RealTimeMessagesPage /></ProtectedRoute>} />
                <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="my-reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
                <Route path="my-store" element={<ProtectedRoute><MyStorePage /></ProtectedRoute>} />
                <Route path="doping" element={<ProtectedRoute><DopingPage /></ProtectedRoute>} />
                {/* 🔧 Alias route for backward compatibility */}
                <Route path="real-time-messages" element={<ProtectedRoute><RealTimeMessagesPage /></ProtectedRoute>} />
                
                {/* Static Pages */}
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="kvkk" element={<KVKKPage />} />
                
                {/* Form Routes - Now with UserLayout */}
                <Route path="create-ad/minibus/:variantId" element={<ProtectedRoute><MinibusAdForm /></ProtectedRoute>} />
                <Route path="create-ad/kamyon/:variantId" element={<ProtectedRoute><KamyonAdForm /></ProtectedRoute>} />
                <Route path="create-ad/otobus/:variantId" element={<ProtectedRoute><OtobusAdForm /></ProtectedRoute>} />
                <Route path="create-ad/cekici/:variantId" element={<ProtectedRoute><CekiciAdForm /></ProtectedRoute>} />
                
                <Route path="create-ad/dorse/damperli/kapakli-tip/:variantId" element={<ProtectedRoute><KapakliTipForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/damperli/hafriyat-tipi/:variantId" element={<ProtectedRoute><HafriyatTipiFormDorse /></ProtectedRoute>} />
                <Route path="create-ad/dorse/damperli/havuz-hardox-tipi/:variantId" element={<ProtectedRoute><HavuzHardoxTipiFormDorse /></ProtectedRoute>} />
                <Route path="create-ad/dorse/damperli/kaya-tipi/:variantId" element={<ProtectedRoute><KayaTipiFormDorse /></ProtectedRoute>} />
                <Route path="create-ad/dorse/frigofirik/:variantId" element={<ProtectedRoute><FrigofirikForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/lowbed/havuzlu/:variantId" element={<ProtectedRoute><HavuzluForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/lowbed/ondekirmalı/:variantId" element={<ProtectedRoute><OndekirmalıForm /></ProtectedRoute>} />
                
                {/* Kuruyük Routes */}
                <Route path="create-ad/dorse/kuruyuk/kapakli/:variantId" element={<ProtectedRoute><KapakliForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/kuruyuk/kapakli-kaya-tipi/:variantId" element={<ProtectedRoute><KapakliKayaTipiForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/kuruyuk/kapaksiz-platform/:variantId" element={<ProtectedRoute><KapaksızPlatformForm /></ProtectedRoute>} />
                
                {/* Tenteli Routes */}
                <Route path="create-ad/dorse/tenteli/pilot/:variantId" element={<ProtectedRoute><PilotForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/tenteli/midilli/:variantId" element={<ProtectedRoute><MidilliForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/tenteli/yari-midilli/:variantId" element={<ProtectedRoute><YariMidilliForm /></ProtectedRoute>} />
                
                {/* Tanker Routes */}
                <Route path="create-ad/dorse/tanker/:variantId" element={<ProtectedRoute><TankerForm /></ProtectedRoute>} />
                
                {/* Tekstil Routes */}
                <Route path="create-ad/dorse/tekstil/:variantId" element={<ProtectedRoute><TekstilForm /></ProtectedRoute>} />
                
                {/* Silobas Routes */}
                <Route path="create-ad/dorse/silobas/:variantId" element={<ProtectedRoute><SilobasForm /></ProtectedRoute>} />
                
                {/* Individual Şasi Routes */}
                <Route path="create-ad/dorse/damper-sasi/:variantId" element={<ProtectedRoute><DamperSasiForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/kilcik-sasi/:variantId" element={<ProtectedRoute><KilcikSasiForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/platform-sasi/:variantId" element={<ProtectedRoute><PlatformSasiForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/romork-konvantoru/:variantId" element={<ProtectedRoute><RomorkKonvantöruForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/tanker-sasi/:variantId" element={<ProtectedRoute><TankerSasiForm /></ProtectedRoute>} />
                <Route path="create-ad/dorse/uzayabilir-sasi/:variantId" element={<ProtectedRoute><UzayabilirSasiForm /></ProtectedRoute>} />
                
                {/* Römork Routes */}
                <Route path="create-ad/romork/kamyon-romorklari/:variantId" element={<ProtectedRoute><KamyonRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tarim-romork-acik-kasa/:variantId" element={<ProtectedRoute><AcikKasaForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tarim-romork-kapali-kasa/:variantId" element={<ProtectedRoute><KapaliKasaForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tarim-romork-sulama/:variantId" element={<ProtectedRoute><SulamaForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tarim-romork-tanker/:variantId" element={<ProtectedRoute><TarimTankerForm /></ProtectedRoute>} />
                
                {/* Taşıma Römorkları Routes */}
                <Route path="create-ad/romork/tasima-romorklari-boru/:variantId" element={<ProtectedRoute><BoruRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-frigo/:variantId" element={<ProtectedRoute><FrigoRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-hayvan/:variantId" element={<ProtectedRoute><HayvanRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-platform/:variantId" element={<ProtectedRoute><PlatformRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-seyehat/:variantId" element={<ProtectedRoute><SeyehatRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-tup-damacana/:variantId" element={<ProtectedRoute><TupDamacanaRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-vasita/:variantId" element={<ProtectedRoute><VasitaRomorkForm /></ProtectedRoute>} />
                <Route path="create-ad/romork/tasima-romorklari-yuk/:variantId" element={<ProtectedRoute><YukRomorkForm /></ProtectedRoute>} />
                
                {/* Özel Amaçlı Römork Routes */}
                <Route path="create-ad/romork/ozel-amacli-romork/:variantId" element={<ProtectedRoute><OzelAmacliRomorkForm /></ProtectedRoute>} />
                
                {/* Özel Amaçlı Dorseler Routes */}
                <Route path="create-ad/dorse/ozel-amacli-dorseler/:variantId" element={<ProtectedRoute><OzelAmacliRomorkForm /></ProtectedRoute>} />
                
                {/* Karoser & Üstyapı Damperli Routes */}
                <Route path="create-ad/karoser-ustyapi/damperli-ahsap-kasa/:variantId" element={<ProtectedRoute><AhsapKasaForm /></ProtectedRoute>} />
                <Route path="create-ad/karoser-ustyapi/damperli-hafriyat-tipi/:variantId" element={<ProtectedRoute><HafriyatTipiForm /></ProtectedRoute>} />
                <Route path="create-ad/karoser-ustyapi/damperli-havuz-hardox-tipi/:variantId" element={<ProtectedRoute><HavuzHardoxTipiForm /></ProtectedRoute>} />
                <Route path="create-ad/karoser-ustyapi/damperli-kaya-tipi/:variantId" element={<ProtectedRoute><KayaTipiForm /></ProtectedRoute>} />
                
                {/* Karoser & Üstyapı Sabit Kabin Routes */}
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-acik-kasa/:variantId" element={<ProtectedRoute><AcikKasaFormSabit /></ProtectedRoute>} />
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-kapali-kasa/:variantId" element={<ProtectedRoute><KapaliKasaFormSabit /></ProtectedRoute>} />
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-ozel-kasa/:variantId" element={<ProtectedRoute><OzelKasaForm /></ProtectedRoute>} />
                
                {/* Oto Kurtarıcı & Taşıyıcı Routes */}
                <Route path="create-ad/oto-kurtarici-tasiyici/tekli-arac/:variantId" element={<ProtectedRoute><TekliAracForm /></ProtectedRoute>} />
                <Route path="create-ad/oto-kurtarici-tasiyici/coklu-arac/:variantId" element={<ProtectedRoute><CokluAracForm /></ProtectedRoute>} />
              </Route>
              
              {/* Admin Routes - Completely Separate System */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="all-listings" element={<AllListings />} />
                <Route path="pending-listings" element={<PendingListings />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="feedback" element={<FeedbackManagement />} />
                <Route path="users" element={<Users />} />
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
</PromptDialogProvider>
</ConfirmDialogProvider>
</ThemeProvider>
  );
};

export default App;