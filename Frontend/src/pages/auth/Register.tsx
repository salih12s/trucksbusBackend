import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PhoneInputTR from '../../components/common/PhoneInputTR';
import { isValidPhoneTR, normalizePhoneTR } from '../../utils/phone';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Telefon validasyonu
    if (!isValidPhoneTR(formData.phone)) {
      return; // PhoneInputTR komponenti zaten error gösteriyor
    }
    
    try {
      const user = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: normalizePhoneTR(formData.phone),
      });
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch {/* AuthContext hatayı gösteriyor */}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const logoSrc = '/TruckBus.png';

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
            Aradığın araç bir tık ötede
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
            Hesap aç
          </h2>
          <p className="text-slate-600 mb-4">
            Dakikalar içinde başlayalım
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm text-slate-600">Ad</label>
                <input
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  name="firstName"
                  placeholder="Ad"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-600">Soyad</label>
                <input
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  name="lastName"
                  placeholder="Soyad"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Telefon</label>
              <div className="relative">
                <PhoneInputTR
                  value={formData.phone}
                  onChange={(normalized) => {
                    setFormData({ ...formData, phone: normalized });
                  }}
                  required
                  error={!!formData.phone && !isValidPhoneTR(formData.phone)}
                  helperText={
                    formData.phone && !isValidPhoneTR(formData.phone) 
                      ? 'Lütfen 0 ile başlayan 11 haneli bir numara girin (0xxx xxx xx xx).' 
                      : ' '
                  }
                  fullWidth
                  variant="outlined"
                  className="w-full"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      padding: '0',
                      '& input': {
                        padding: '14px 16px',
                        fontSize: '16px',
                      },
                      '& fieldset': {
                        borderRadius: '12px',
                        borderColor: 'rgb(226, 232, 240)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgb(14, 165, 233)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgb(14, 165, 233)',
                        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.15)',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '12px',
                      marginTop: '4px',
                    },
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Şifre</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-sky-500/15 focus:border-sky-500 transition-all duration-150 text-base"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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

            <button 
              className="w-full mt-6 px-4 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-150 hover:shadow-lg active:translate-y-0.5" 
              type="submit" 
              disabled={isLoading || !isValidPhoneTR(formData.phone)}
            >
              {isLoading ? 'Hesap oluşturuluyor…' : 'Hesap Aç'}
            </button>

       
            <p className="text-center text-sm text-slate-600 mt-6">
              Zaten hesabın var mı?{' '}
              <Link 
                to="/auth/login" 
                className="text-sky-500 hover:text-sky-600 font-bold hover:underline transition-colors"
              >
                Giriş yap
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
