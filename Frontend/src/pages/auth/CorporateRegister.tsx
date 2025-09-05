import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizePhoneTR } from '../../utils/phone';

interface CorporateFormData {
  // Şirket Bilgileri
  companyName: string;
  taxNumber: string;
  
  // Yetkili Kişi Bilgileri
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Konum
  city: string;
  district: string;
  
  // Güvenlik
  password: string;
  confirmPassword: string;
  
  // Sözleşmeler
  kvkkAccepted: boolean;
  termsAccepted: boolean;
}

const CorporateRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, clearError, isAuthenticated, user, isInitialized } = useAuth();
  
  const [formData, setFormData] = useState<CorporateFormData>({
    companyName: '',
    taxNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    password: '',
    confirmPassword: '',
    kvkkAccepted: false,
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Korunan sayfadan geldiyse oraya dön
  const fromPath = (location.state as any)?.from?.pathname || '/';

  // ✅ Güvenli hedef path belirleme
  const safeTarget = (role: string | undefined, fromPath: string) => {
    if (role === 'ADMIN') return '/admin';
    if (fromPath.startsWith('/admin')) return '/';
    return fromPath;
  };

  // ✅ Authenticated user redirect - isInitialized kontrolü ile
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const targetPath = safeTarget(user.role, fromPath);
      console.log('🚀 User authenticated from corporate register, returning to:', targetPath);
      console.log('🎯 Safe redirect target:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [isInitialized, isAuthenticated, user, navigate, fromPath]);

  useEffect(() => {
    clearError?.();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    // Basit validasyon
    if (!formData.companyName.trim()) {
      alert('Şirket adı zorunludur');
      return false;
    }
    if (!formData.taxNumber.trim()) {
      alert('Vergi numarası zorunludur');
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Ad ve soyad zorunludur');
      return false;
    }
    if (!formData.email.trim()) {
      alert('E-posta zorunludur');
      return false;
    }
    if (!formData.phone.trim()) {
      alert('Telefon zorunludur');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return false;
    }
    if (!formData.kvkkAccepted) {
      alert('KVKK Aydınlatma Metni kabul edilmelidir');
      return false;
    }
    if (!formData.termsAccepted) {
      alert('Kullanım Koşulları kabul edilmelidir');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // 🔧 KURUMSAL KAYIT VERISI
      const corporateData = {
        // Kişisel bilgiler
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(), 
        email: formData.email.trim().toLowerCase(),
        phone: normalizePhoneTR(formData.phone),
        password: formData.password,
        city: formData.city || 'Belirtilmemiş',
        district: formData.district || 'Belirtilmemiş',
        
        // 🏢 KURUMSAL FLAGLAR
        is_corporate: true,
        company_name: formData.companyName.trim(),
        tax_number: formData.taxNumber.trim(),
        
        // Sözleşmeler
        kvkk_accepted: formData.kvkkAccepted,
        terms_accepted: formData.termsAccepted
      };

      console.log('🏢 Corporate Register Data:', corporateData);
      
      const user = await register(corporateData);
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
      
    } catch (err) {
      console.error('❌ Corporate registration failed:', err);
    }
  };

  const logoSrc = '/TruckBus.png';

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT: LOGO PANEL */}
      <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="relative text-center z-10 p-6">
          <img 
            className="w-full max-w-md h-auto mx-auto object-contain" 
            src={logoSrc} 
            alt="TrucksBus Logo" 
          />
          <h2 className="text-white text-3xl font-bold mt-8 mb-4">Kurumsal Hesap</h2>
          <p className="text-slate-300 text-lg max-w-sm mx-auto leading-relaxed">
            İşletmeniz için profesyonel hesap oluşturun ve daha fazla özelliğe erişin
          </p>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
      </aside>

      {/* RIGHT: FORM */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <img 
              className="w-32 h-auto mx-auto object-contain mb-4" 
              src={logoSrc} 
              alt="TrucksBus Logo" 
            />
            <h1 className="text-white text-2xl font-bold">Kurumsal Hesap</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="hidden lg:block text-white text-3xl font-bold">Kurumsal Hesap Oluştur</h1>
              <p className="text-slate-400 text-sm mt-2">İşletmeniz için hesap açın</p>
            </div>

            {/* Şirket Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-orange-400 text-lg font-semibold">🏢 Şirket Bilgileri</h3>
              
              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">Şirket Adı</label>
                <input
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-orange-500/15 focus:border-orange-500 transition-all duration-150 text-base placeholder-slate-400"
                  name="companyName"
                  placeholder="Şirket adınızı girin"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">Vergi Numarası</label>
                <input
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-orange-500/15 focus:border-orange-500 transition-all duration-150 text-base placeholder-slate-400"
                  name="taxNumber"
                  placeholder="Vergi numaranızı girin"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Yetkili Kişi Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-sky-400 text-lg font-semibold">👤 Yetkili Kişi Bilgileri</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm text-slate-300 font-medium">Ad</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base placeholder-slate-400"
                    name="firstName"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-slate-300 font-medium">Soyad</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base placeholder-slate-400"
                    name="lastName"
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">E-posta</label>
                <input
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base placeholder-slate-400"
                  name="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">Telefon</label>
                <input
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base placeholder-slate-400"
                  name="phone"
                  placeholder="0xxx xxx xx xx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-4">
              <h3 className="text-green-400 text-lg font-semibold">🔐 Güvenlik</h3>
              
              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">Şifre</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-green-500/15 focus:border-green-500 transition-all duration-150 text-base placeholder-slate-400 pr-12"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-300 font-medium">Şifre Tekrar</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-3 focus:ring-green-500/15 focus:border-green-500 transition-all duration-150 text-base placeholder-slate-400 pr-12"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sözleşmeler */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="kvkk-checkbox"
                  name="kvkkAccepted"
                  checked={formData.kvkkAccepted}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <label htmlFor="kvkk-checkbox" className="cursor-pointer">
                    <Link
                      to="/kvkk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline font-medium"
                    >
                      KVKK Aydınlatma Metni
                    </Link>
                    'ni okudum ve kabul ediyorum.
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <label htmlFor="terms-checkbox" className="cursor-pointer">
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline font-medium"
                    >
                      Kullanım Koşulları
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </label>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kurumsal Hesap Oluşturuluyor...</span>
                </div>
              ) : (
                '🏢 Kurumsal Hesap Oluştur'
              )}
            </button>

            {/* Login Links */}
            <div className="text-center space-y-2">
              <p className="text-center text-sm text-slate-400">
                Zaten hesabınız var mı?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-sky-400 hover:text-sky-300 font-bold hover:underline transition-colors"
                >
                  Giriş yapın
                </Link>
              </p>
              
              <p className="text-center text-sm text-slate-400">
                Bireysel hesap mı istiyorsunuz?{' '}
                <Link 
                  to="/auth/register" 
                  className="text-green-400 hover:text-green-300 font-bold hover:underline transition-colors"
                >
                  Bireysel Kayıt
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CorporateRegister;
