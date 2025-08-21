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
import KamyonRomorkForm from './pages/Forms/KamyonRomorklari/KamyonRomorkFormm';
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
                
                {/* Form Routes - Now with UserLayout */}
                <Route path="create-ad/minibus/:variantId" element={<MinibusAdForm />} />
                <Route path="create-ad/kamyon/:variantId" element={<KamyonAdForm />} />
                <Route path="create-ad/otobus/:variantId" element={<OtobusAdForm />} />
                <Route path="create-ad/cekici/:variantId" element={<CekiciAdForm />} />
                
                <Route path="create-ad/dorse/damperli/kapakli-tip/:variantId" element={<KapakliTipForm />} />
                <Route path="create-ad/dorse/damperli/hafriyat-tipi/:variantId" element={<HafriyatTipiFormDorse />} />
                <Route path="create-ad/dorse/damperli/havuz-hardox-tipi/:variantId" element={<HavuzHardoxTipiFormDorse />} />
                <Route path="create-ad/dorse/damperli/kaya-tipi/:variantId" element={<KayaTipiFormDorse />} />
                <Route path="create-ad/dorse/frigofirik/:variantId" element={<FrigofirikForm />} />
                <Route path="create-ad/dorse/lowbed/havuzlu/:variantId" element={<HavuzluForm />} />
                <Route path="create-ad/dorse/lowbed/ondekirmalı/:variantId" element={<OndekirmalıForm />} />
                
                {/* Kuruyük Routes */}
                <Route path="create-ad/dorse/kuruyuk/kapakli/:variantId" element={<KapakliForm />} />
                <Route path="create-ad/dorse/kuruyuk/kapakli-kaya-tipi/:variantId" element={<KapakliKayaTipiForm />} />
                <Route path="create-ad/dorse/kuruyuk/kapaksiz-platform/:variantId" element={<KapaksızPlatformForm />} />
                
                {/* Tenteli Routes */}
                <Route path="create-ad/dorse/tenteli/pilot/:variantId" element={<PilotForm />} />
                <Route path="create-ad/dorse/tenteli/midilli/:variantId" element={<MidilliForm />} />
                <Route path="create-ad/dorse/tenteli/yari-midilli/:variantId" element={<YariMidilliForm />} />
                
                {/* Tanker Routes */}
                <Route path="create-ad/dorse/tanker/:variantId" element={<TankerForm />} />
                
                {/* Tekstil Routes */}
                <Route path="create-ad/dorse/tekstil/:variantId" element={<TekstilForm />} />
                
                {/* Silobas Routes */}
                <Route path="create-ad/dorse/silobas/:variantId" element={<SilobasForm />} />
                
                {/* Individual Şasi Routes */}
                <Route path="create-ad/dorse/damper-sasi/:variantId" element={<DamperSasiForm />} />
                <Route path="create-ad/dorse/kilcik-sasi/:variantId" element={<KilcikSasiForm />} />
                <Route path="create-ad/dorse/platform-sasi/:variantId" element={<PlatformSasiForm />} />
                <Route path="create-ad/dorse/romork-konvantoru/:variantId" element={<RomorkKonvantöruForm />} />
                <Route path="create-ad/dorse/tanker-sasi/:variantId" element={<TankerSasiForm />} />
                <Route path="create-ad/dorse/uzayabilir-sasi/:variantId" element={<UzayabilirSasiForm />} />
                
                {/* Römork Routes */}
                <Route path="create-ad/romork/kamyon-romorklari/:variantId" element={<KamyonRomorkForm />} />
                <Route path="create-ad/romork/tarim-romork-acik-kasa/:variantId" element={<AcikKasaForm />} />
                <Route path="create-ad/romork/tarim-romork-kapali-kasa/:variantId" element={<KapaliKasaForm />} />
                <Route path="create-ad/romork/tarim-romork-sulama/:variantId" element={<SulamaForm />} />
                <Route path="create-ad/romork/tarim-romork-tanker/:variantId" element={<TarimTankerForm />} />
                
                {/* Taşıma Römorkları Routes */}
                <Route path="create-ad/romork/tasima-romorklari-boru/:variantId" element={<BoruRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-frigo/:variantId" element={<FrigoRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-hayvan/:variantId" element={<HayvanRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-platform/:variantId" element={<PlatformRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-seyehat/:variantId" element={<SeyehatRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-tup-damacana/:variantId" element={<TupDamacanaRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-vasita/:variantId" element={<VasitaRomorkForm />} />
                <Route path="create-ad/romork/tasima-romorklari-yuk/:variantId" element={<YukRomorkForm />} />
                
                {/* Özel Amaçlı Römork Routes */}
                <Route path="create-ad/romork/ozel-amacli-romork/:variantId" element={<OzelAmacliRomorkForm />} />
                
                {/* Özel Amaçlı Dorseler Routes */}
                <Route path="create-ad/dorse/ozel-amacli-dorseler/:variantId" element={<OzelAmacliRomorkForm />} />
                
                {/* Karoser & Üstyapı Damperli Routes */}
                <Route path="create-ad/karoser-ustyapi/damperli-ahsap-kasa/:variantId" element={<AhsapKasaForm />} />
                <Route path="create-ad/karoser-ustyapi/damperli-hafriyat-tipi/:variantId" element={<HafriyatTipiForm />} />
                <Route path="create-ad/karoser-ustyapi/damperli-havuz-hardox-tipi/:variantId" element={<HavuzHardoxTipiForm />} />
                <Route path="create-ad/karoser-ustyapi/damperli-kaya-tipi/:variantId" element={<KayaTipiForm />} />
                
                {/* Karoser & Üstyapı Sabit Kabin Routes */}
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-acik-kasa/:variantId" element={<AcikKasaFormSabit />} />
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-kapali-kasa/:variantId" element={<KapaliKasaFormSabit />} />
                <Route path="create-ad/karoser-ustyapi/sabit-kabin-ozel-kasa/:variantId" element={<OzelKasaForm />} />
                
                {/* Oto Kurtarıcı & Taşıyıcı Routes */}
                <Route path="create-ad/oto-kurtarici-tasiyici/tekli-arac/:variantId" element={<TekliAracForm />} />
                <Route path="create-ad/oto-kurtarici-tasiyici/coklu-arac/:variantId" element={<CokluAracForm />} />
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