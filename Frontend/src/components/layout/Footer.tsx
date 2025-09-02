import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  TextField,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import logo from '/TruckBus.png';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  LocalShipping,
  DirectionsBus,
  ArrowUpward,
  Send as SendIcon,
  Engineering,
  Construction,
  Build,
  HomeRepairService,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const { user } = useAuth();

  const accent = '#E14D43'; // marka kırmızısı

  // Auth gerektiren sayfalar için kontrol
  const handleAuthRequiredNavigation = (path: string) => {
    if (!user) {
      navigate('/auth/login');
    } else {
      navigate(path, { replace: false });
    }
  };

  const quickLinks = [
    { title: 'Ana Sayfa', path: '/', requireAuth: false },
    { title: 'Tüm İlanlar', path: '/listings', requireAuth: false },
    { title: 'Kategoriler', path: '/category-selection', requireAuth: true },
    { title: 'Favorilerim', path: '/favorites', requireAuth: true },
    { title: 'İlanlarım', path: '/my-listings', requireAuth: true },
  ];

  const legalLinks = [
    { title: 'Hakkımızda', path: '/about' },
    { title: 'İletişim', path: '/contact' },
    { title: 'Gizlilik Politikası', path: '/privacy' },
    { title: 'Kullanım Şartları', path: '/terms' },
    { title: 'KVKK', path: '/kvkk' },
  ];

  const categories = [
    { title: 'Kamyon & Kamyonet', path: '/category-selection', icon: <LocalShipping sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Otobüs', path: '/category-selection', icon: <DirectionsBus sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Minibüs & Midibüs', path: '/category-selection', icon: <DirectionsBus sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Çekici', path: '/category-selection', icon: <Engineering sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Dorse', path: '/category-selection', icon: <Construction sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Römork', path: '/category-selection', icon: <Build sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Karoser & Üst Yapı', path: '/category-selection', icon: <HomeRepairService sx={{ fontSize: 18, mr: 1 }} /> },
    { title: 'Oto Kurtarıcı & Taşıyıcı', path: '/category-selection', icon: <LocalShipping sx={{ fontSize: 18, mr: 1 }} /> },
  ];

  const socialMedia = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert('Lütfen geçerli bir e-posta gir.');
      return;
    }
    // burada gerçek subscribe endpoint’ine post atarsın
    alert('Kaydın alındı! 🚀');
    setEmail('');
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: '#2D3748', // ARKA PLAN AYNI KALDI
        color: 'white',
        mt: 'auto',
        pt: 1.9, // 2.5'den %25 azaltıp 1.9'a düşürdük
        pb: 0.75, // 1'den %25 azaltıp 0.75'e düşürdük
        overflow: 'hidden',
        // üstte ince gradient şerit
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, #ff8a7b)`,
          opacity: 0.9,
        },
        // çok hafif noise/texture hissi
        backgroundImage:
          'radial-gradient(transparent 1px, rgba(255,255,255,0.06) 1px)',
        backgroundSize: '6px 6px',
        backgroundBlendMode: 'soft-light',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={1.5}> {/* spacing 2'den 1.5'e düşürdük */}
          {/* Marka & İletişim & CTA */}
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 1.1 }}> {/* mb 1.5'den 1.1'e düşürdük */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: accent,
                  mb: 0.75,
                  letterSpacing: 0.4,
                }}
              >
                Trucksbus
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.6,
                }}
              >
                Türkiye&apos;nin en güvenilir ticari araç alım-satım platformu.
                Kamyon, otobüs, minibüs ve çekici ilanları tek yerde.
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mt: 1.1 }}> {/* mt 1.5'den 1.1'e düşürdük */}
                <Button
                  size="small"
                  onClick={() => navigate('/sell')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    fontWeight: 600,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${accent}, #ff8a7b)`,
                    color: '#fff',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(225,77,67,0.35)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 26px rgba(225,77,67,0.45)',
                      background: `linear-gradient(135deg, ${accent}, #ff9a8c)`,
                    },
                    transition: 'all .25s ease',
                  }}
                >
                  İlan Ver
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/contact')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    fontWeight: 600,
                    borderRadius: 2,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.35)',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: accent,
                      backgroundColor: 'rgba(225,77,67,0.12)',
                    },
                  }}
                > 
                  Bize Ulaşın
                </Button>
              </Stack>

              {/* Güven/rozetler */}
              <Stack direction="row" spacing={1} sx={{ mt: 1.1, flexWrap: 'wrap', gap: 1 }}> {/* mt 1.5'den 1.1'e düşürdük */}
                <Chip label="Doğrulanmış İlanlar" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Chip label="Kurumsal Satıcılar" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Chip label="7/24 Destek" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
              </Stack>

              {/* İletişim */}
              <Box sx={{ mt: 1.5 }}> {/* mt 2'den 1.5'e düşürdük */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}> {/* mb 0.5'den 0.4'e düşürdük */}
                  <Phone sx={{ fontSize: 18, mr: 1, color: accent }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    +90 (555) 123 45 67
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}> {/* mb 0.5'den 0.4'e düşürdük */}
                  <Email sx={{ fontSize: 18, mr: 1, color: accent }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    info@trucksbus.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 18, mr: 1, color: accent }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    İstanbul, Türkiye
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Hızlı Linkler */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.1, // mb 1.5'den 1.1'e düşürdük
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&::before': {
                  content: '""',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                },
              }}
            >
              Hızlı Linkler
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.title} sx={{ mb: 0.5 }}>
                  {link.requireAuth && !user ? (
                    <Typography
                      component="button"
                      onClick={() => navigate('/auth/login')}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.85)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'all .2s ease',
                        padding: 0,
                        textAlign: 'left',
                        '&:hover': {
                          color: '#fff',
                          transform: 'translateX(4px)',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          textDecorationColor: accent,
                        },
                      }}
                    >
                      {link.title}
                    </Typography>
                  ) : (
                    <Link
                      to={link.path}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '0.95rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          transition: 'all .2s ease',
                          '&:hover': {
                            color: '#fff',
                            transform: 'translateX(4px)',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                            textDecorationColor: accent,
                          },
                        }}
                      >
                        {link.title}
                      </Typography>
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Kategoriler */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.1, // mb 1.5'den 1.1'e düşürdük
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&::before': {
                  content: '""',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                },
              }}
            >
              Kategoriler
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {categories.map((category) => (
                <Box component="li" key={category.title} sx={{ mb: 0.4 }}> {/* mb 0.5'den 0.4'e düşürdük */}
                  {!user ? (
                    <Typography
                      component="button"
                      onClick={() => navigate('/auth/login')}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.85)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.95rem',
                        padding: 0,
                        textAlign: 'left',
                        transition: 'all .2s ease',
                        '& .MuiSvgIcon-root': { transition: 'color .2s ease' },
                        '&:hover': {
                          color: '#fff',
                          transform: 'translateX(4px)',
                          '& .MuiSvgIcon-root': { color: accent },
                        },
                      }}
                    >
                      {category.icon}
                      {category.title}
                    </Typography>
                  ) : (
                    <Link
                      to={category.path}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.85)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '0.95rem',
                          transition: 'all .2s ease',
                          '& .MuiSvgIcon-root': { transition: 'color .2s ease' },
                          '&:hover': {
                            color: '#fff',
                            transform: 'translateX(4px)',
                            '& .MuiSvgIcon-root': { color: accent },
                          },
                        }}
                      >
                        {category.icon}
                        {category.title}
                      </Typography>
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Kurumsal & Yasal */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.1, // mb 1.5'den 1.1'e düşürdük
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&::before': {
                  content: '""',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                },
              }}
            >
              Kurumsal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {legalLinks.map((link) => (
                <Box component="li" key={link.title} sx={{ mb: 0.4 }}> {/* mb 0.5'den 0.4'e düşürdük */}
                  <Typography
                    component={Link}
                    to={link.path}
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      transition: 'all .2s ease',
                      '&:hover': {
                        color: '#fff',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                        textDecorationColor: accent,
                      },
                    }}
                  >
                    {link.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Sosyal & Bülten */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.1, // mb 1.5'den 1.1'e düşürdük
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&::before': {
                  content: '""',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                },
              }}
            >
              Bizi Takip Edin
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.1 }}> {/* mb 1.5'den 1.1'e düşürdük */}
              {socialMedia.map((s) => (
                <Tooltip key={s.label} title={s.label}>
                  <IconButton
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '&:hover': {
                        bgcolor: accent,
                        color: 'white',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.25s ease',
                      width: 38,
                      height: 38,
                    }}
                  >
                    {s.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 0.4 }}> {/* mb 0.5'den 0.4'e düşürdük */}
              Bültene katıl:
            </Typography>
            <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)' },
                  },
                }}
                fullWidth
              />
              <Button
                type="submit"
                aria-label="Bültene kaydol"
                sx={{
                  minWidth: 42,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${accent}, #ff8a7b)`,
                  color: '#fff',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', mt: 0.4 }} // mt 0.5'den 0.4'e düşürdük
            >
              Yakında mobil uygulamalarımız.
            </Typography>
          </Grid>
        </Grid>

        {/* Alt çizgi */}
        <Divider sx={{ my: 2.2, borderColor: 'rgba(255,255,255,0.18)' }} /> {/* my 3'den 2.2'ye düşürdük */}

        {/* Copyright & back to top */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            minHeight: '80px', // Logo için yeterli alan
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            © {new Date().getFullYear()} Trucksbus — Türkiye&apos;nin en güvenilir ticari araç platformu.
          </Typography>
























          {/* Orta Logo - Absolute Position */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: 'pointer',
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.1)',
                transition: 'transform 0.3s ease',
              },
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src={logo}
              alt="Trucksbus Logo"
              sx={{
                width: { xs: 120, md: 140 },
                height: 'auto',
                filter: 'drop-shadow(0 4px 15px rgba(225,77,67,0.4))',
              }}
            />
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Tasarım • Performans • Güven
            </Typography>
            <IconButton
              aria-label="Yukarı dön"
              onClick={scrollTop}
              sx={{
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 2,
                '&:hover': {
                  borderColor: accent,
                  backgroundColor: 'rgba(225,77,67,0.12)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all .2s ease',
              }}
            >
              <ArrowUpward />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
