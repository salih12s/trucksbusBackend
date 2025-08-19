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
      const user = await login(formData.email, formData.password);
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch {/* AuthContext hatayı gösteriyor */}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const logoSrc = '/xad.png'; // public/xad.png

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
          <div className="flex justify-center mb-2 lg:hidden">
            <img src={logoSrc} alt="TRUCK-BUS" className="w-30 h-auto" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Giriş yap
          </h2>
          <p className="text-slate-600 mb-4">
            Hesabına devam et
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">E-posta</label>
              <input
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                name="email"
                type="email"
                placeholder="ornek@mail.com"
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
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <span>Oturumum açık kalsın</span>
              </label>
              <a href="#" className="text-sm text-sky-500 hover:text-sky-600 hover:underline transition-colors">
                Şifremi unuttum
              </a>
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
