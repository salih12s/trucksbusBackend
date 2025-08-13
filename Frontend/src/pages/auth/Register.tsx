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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon, Apple as AppleIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      setShowForm(true);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!acceptTerms) {
      alert('Lütfen sözleşmeleri kabul edin');
      return;
    }
    
    try {
      await register({
        email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      navigate('/auth/login');
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

  if (!showForm) {
    // İlk Aşama - Sadece E-posta
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
                  Hesap aç
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Email Form */}
              <Box component="form" onSubmit={handleEmailSubmit}>
                {/* Email Field */}
                <TextField
                  fullWidth
                  type="email"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

                {/* Continue Button */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
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
                  E-posta ile hesap aç
                </Button>

                {/* Login Link */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Zaten hesabın var mı?{' '}
                    <Link
                      component={RouterLink}
                      to="/auth/login"
                      sx={{
                        color: '#0ea5e9',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Giriş yap
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
                    Google ile hesap aç
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
                    Apple ile hesap aç
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

                {/* Business Account Link */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    İşletme sahibi misin?{' '}
                    <Link 
                      href="#" 
                      sx={{ 
                        color: '#0ea5e9',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Kurumsal hesap aç
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // İkinci Aşama - Tam Form
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
                Hesap aç
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Register Form */}
            <Box component="form" onSubmit={handleRegisterSubmit}>
              {/* Email Field (Read-only) */}
              <TextField
                fullWidth
                type="email"
                value={email}
                disabled
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f1f5f9',
                  },
                }}
              />

              {/* Name Fields */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  name="firstName"
                  placeholder="Ad"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  sx={{
                    flex: 1,
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
                <TextField
                  name="lastName"
                  placeholder="Soyad"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  sx={{
                    flex: 1,
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
              </Box>

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

              {/* Terms Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    sx={{
                      color: '#0ea5e9',
                      '&.Mui-checked': {
                        color: '#0ea5e9',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    <Link href="#" sx={{ color: '#0ea5e9' }}>
                      Bireysel Hesap Sözleşmesi
                    </Link>
                    {' '}ve{' '}
                    <Link href="#" sx={{ color: '#0ea5e9' }}>
                      Ekleri
                    </Link>
                    'ni kabul ediyorum.
                  </Typography>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />

              {/* Additional Terms */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b', 
                  mb: 3,
                  fontSize: '0.75rem',
                  lineHeight: 1.4
                }}
              >
                İletişim bilgilerime kampanya, tanıtım ve reklam içerikli ticari elektronik ileti gönderilesine, bu amaçla kişisel verilerimin işlenmesine ve tedarikçilerinizle paylaştırmasına izin veriyorum.
              </Typography>

              {/* Register Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading || !acceptTerms}
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
                  '&:disabled': {
                    bgcolor: '#cbd5e1',
                  },
                  mb: 3
                }}
              >
                {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Aç'}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Zaten hesabın var mı?{' '}
                  <Link
                    component={RouterLink}
                    to="/auth/login"
                    sx={{
                      color: '#0ea5e9',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Giriş yap
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
                  Google ile hesap aç
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
                  Apple ile hesap aç
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
