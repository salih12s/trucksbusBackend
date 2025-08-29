import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geçersiz sıfırlama bağlantısı.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Geçersiz sıfırlama bağlantısı.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const logoSrc = '/TruckBus.png';

  if (isSuccess) {
    return (
      <div className="min-h-screen flex bg-slate-900">
        {/* LEFT: LOGO PANEL */}
        <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="relative text-center z-10 p-6">
            <img 
              className="w-full max-w-md h-auto mx-auto object-contain" 
              src={logoSrc} 
              alt="TRUCK-BUS" 
            />
            <h3 className="text-slate-200 text-2xl font-bold tracking-wide mt-4 mb-1">
              TRUCK–BUS
            </h3>
            <p className="text-slate-400 text-base">
              Ağır vasıta ve otobüs ilan platformu
            </p>
          </div>

          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white/20 via-transparent to-white/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </aside>

        {/* RIGHT: SUCCESS MESSAGE PANEL */}
        <main className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
            {/* Mobile logo */}
            <div className="flex justify-center mb-4 lg:hidden">
              <img src={logoSrc} alt="TRUCK-BUS" className="w-30 h-auto" />
            </div>

            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Şifre Başarıyla Sıfırlandı!
            </h2>

            <p className="text-slate-600 mb-6">
              Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </p>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex bg-slate-900">
        {/* LEFT: LOGO PANEL */}
        <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="relative text-center z-10 p-6">
            <img 
              className="w-full max-w-md h-auto mx-auto object-contain" 
              src={logoSrc} 
              alt="TRUCK-BUS" 
            />
            <h3 className="text-slate-200 text-2xl font-bold tracking-wide mt-4 mb-1">
              TRUCK–BUS
            </h3>
            <p className="text-slate-400 text-base">
              Ağır vasıta ve otobüs ilan platformu
            </p>
          </div>

          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white/20 via-transparent to-white/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </aside>

        {/* RIGHT: ERROR MESSAGE PANEL */}
        <main className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
            {/* Mobile logo */}
            <div className="flex justify-center mb-4 lg:hidden">
              <img src={logoSrc} alt="TRUCK-BUS" className="w-30 h-auto" />
            </div>

            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Geçersiz Bağlantı
            </h2>

            <p className="text-slate-600 mb-6">
              Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
              Lütfen yeni bir şifre sıfırlama isteği oluşturun.
            </p>

            <Link
              to="/auth/forgot-password"
              className="inline-block w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors"
            >
              Yeni Şifre Sıfırlama İsteği
            </Link>

            <div className="mt-4">
              <Link 
                to="/auth/login" 
                className="text-sm text-sky-500 hover:text-sky-600 hover:underline transition-colors"
              >
                ← Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT: LOGO PANEL */}
      <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="relative text-center z-10 p-6">
          <img 
            className="w-full max-w-md h-auto mx-auto object-contain" 
            src={logoSrc} 
            alt="TRUCK-BUS" 
          />
          <h3 className="text-slate-200 text-2xl font-bold tracking-wide mt-4 mb-1">
            TRUCK–BUS
          </h3>
          <p className="text-slate-400 text-base">
            Ağır vasıta ve otobüs ilan platformu
          </p>
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white/20 via-transparent to-white/20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </aside>

      {/* RIGHT: FORM PANEL */}
      <main className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
          {/* Mobile logo */}
          <div className="flex justify-center mb-4 lg:hidden">
            <img src={logoSrc} alt="TRUCK-BUS" className="w-30 h-auto" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Yeni Şifre Oluştur
          </h2>
          <p className="text-slate-600 mb-6">
            Hesabınız için yeni bir şifre belirleyin.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Yeni Şifre</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg hover:bg-slate-100 rounded-lg p-1 transition-colors"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg hover:bg-slate-100 rounded-lg p-1 transition-colors"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              className="w-full mt-6 px-4 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-150 hover:shadow-lg active:translate-y-0.5" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Şifre Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/auth/login" 
              className="text-sm text-sky-500 hover:text-sky-600 hover:underline transition-colors"
            >
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
