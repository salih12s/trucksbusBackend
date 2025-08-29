import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      console.log('🔐 Login form submitted');
      const user = await login(formData.email, formData.password, rememberMe);
      console.log('✅ Login successful, user role:', user.role);
      
      // Admin kontrolü - window.location.href kullanarak yönlendirme
      if (user.role === 'ADMIN') {
        console.log('🔧 Admin detected, redirecting to /admin');
        window.location.href = '/admin';
      } else {
        console.log('👤 Regular user, redirecting to home');
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const logoSrc = '/TruckBus.png';

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT: LOGO PANEL */}
      <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,107,0.2),transparent_50%)]"></div>
        
        <div className="relative text-center z-10 p-6">
          <div className="mb-8 flex justify-center">
            <div className="w-28 h-28 bg-gradient-to-br from-white to-slate-100 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/30">
              <img 
                src={logoSrc} 
                alt="TruckBus Logo" 
                className="w-20 h-20 object-contain filter drop-shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="text-4xl font-bold text-slate-700">TB</div>';
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            TruckBus'a Hoş Geldin
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            Türkiye'nin en kapsamlı ticari araç platformu. 
            <br className="hidden sm:block" />
            Hemen giriş yapın, hayalinizdeki aracı bulun.
          </p>
        </div>
      </aside>

      {/* RIGHT: LOGIN FORM */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Giriş Yap</h2>
            <p className="text-slate-600">Hesabınıza giriş yaparak devam edin</p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">E-posta</label>
              <input
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Şifre</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <span>Oturumum açık kalsın</span>
              </label>
              <button 
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-sm text-sky-500 hover:text-sky-600 hover:underline transition-colors"
              >
                Şifremi unuttum
              </button>
            </div>

            <button 
              className="w-full mt-6 px-4 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-150 hover:shadow-lg active:translate-y-0.5" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor…' : 'Giriş yap'}
            </button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Hesabın yok mu?{' '}
              <Link 
                to="/auth/register" 
                className="text-sky-500 hover:text-sky-600 font-bold hover:underline transition-colors"
              >
                Hesap aç
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
