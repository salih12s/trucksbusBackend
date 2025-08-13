import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon, Apple as AppleIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            maxWidth: 400,
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 1
                }}
              >
                Giriş yap
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="E-posta adresi"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover fieldset': {
                      borderColor: '#0ea5e9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0ea5e9',
                    },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover fieldset': {
                      borderColor: '#0ea5e9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0ea5e9',
                    },
                  },
                }}
              />

              {/* Remember Me & Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Oturumum açık kalsın
                  </Typography>
                </Box>
                <Link 
                  href="#" 
                  sx={{ 
                    color: '#0ea5e9',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Şifremi unuttum
                </Link>
              </Box>

              {/* Login Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  bgcolor: '#0ea5e9',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#0284c7',
                  },
                  mb: 3
                }}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'E-posta ile giriş yap'}
              </Button>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Henüz hesabın yok mu?{' '}
                  <Link
                    component={RouterLink}
                    to="/auth/register"
                    sx={{
                      color: '#0ea5e9',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Hesap aç
                  </Link>
                </Typography>
              </Box>

              {/* Divider */}
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center', 
                  color: '#64748b', 
                  mb: 3,
                  position: 'relative',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    width: '45%',
                    height: '1px',
                    bgcolor: '#e2e8f0'
                  },
                  '&::before': {
                    left: 0
                  },
                  '&::after': {
                    right: 0
                  }
                }}
              >
                VEYA
              </Typography>

              {/* Social Login Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#374151',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      bgcolor: '#f9fafb'
                    }
                  }}
                >
                  Google ile giriş yap
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AppleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#374151',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      bgcolor: '#f9fafb'
                    }
                  }}
                >
                  Apple ile giriş yap
                </Button>
              </Box>

              {/* Footer */}
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center', 
                  color: '#64748b', 
                  mt: 4,
                  fontSize: '0.75rem'
                }}
              >
                Google veya Apple kimliğinizle bir sonraki adıma geçmeniz halinde{' '}
                <Link href="#" sx={{ color: '#0ea5e9' }}>
                  Bireysel Hesap Sözleşmesi
                </Link>
                {' '}ve{' '}
                <Link href="#" sx={{ color: '#0ea5e9' }}>
                  Ekleri
                </Link>
                'ni kabul etmiş sayılırsınız.
              </Typography>

              {/* QR Code Link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link 
                  href="#" 
                  sx={{ 
                    color: '#0ea5e9',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  QR kod ile mobil uygulamadan giriş yap
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
