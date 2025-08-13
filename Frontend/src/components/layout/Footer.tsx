import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'grey.900', 
        color: 'white', 
        mt: 'auto',
        py: 4 
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              TruckBus
            </Typography>
            <Typography variant="body2" color="grey.400">
              Türkiye'nin en büyük kamyon ve otobüs ilanları platformu
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Hızlı Linkler
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/" color="grey.400" underline="hover">
                Ana Sayfa
              </Link>
              <Link component={RouterLink} to="/categories" color="grey.400" underline="hover">
                Kategoriler
              </Link>
              <Link component={RouterLink} to="/about" color="grey.400" underline="hover">
                Hakkımızda
              </Link>
              <Link component={RouterLink} to="/contact" color="grey.400" underline="hover">
                İletişim
              </Link>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Yardım
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/help" color="grey.400" underline="hover">
                Yardım Merkezi
              </Link>
              <Link component={RouterLink} to="/privacy" color="grey.400" underline="hover">
                Gizlilik Politikası
              </Link>
              <Link component={RouterLink} to="/terms" color="grey.400" underline="hover">
                Kullanım Şartları
              </Link>
              <Link component={RouterLink} to="/support" color="grey.400" underline="hover">
                Destek
              </Link>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              İletişim
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="grey.400">
                Email: info@truckbus.com
              </Typography>
              <Typography variant="body2" color="grey.400">
                Tel: +90 (212) 123 45 67
              </Typography>
              <Typography variant="body2" color="grey.400">
                Adres: İstanbul, Türkiye
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3, borderColor: 'grey.700' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="grey.400">
            © 2025 TruckBus. Tüm hakları saklıdır.
          </Typography>
          <Typography variant="body2" color="grey.400">
            Made with ❤️ in Turkey
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
