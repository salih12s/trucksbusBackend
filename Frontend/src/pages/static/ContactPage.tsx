import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Schedule,
  Feedback
} from '@mui/icons-material';

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 28, color: '#E14D43' }} />,
      title: 'Adres',
      content: [
        'TrucksBus Merkez Ofis',
        'Maslak Mahallesi, Büyükdere Cd.',
        'Sarıyer, İstanbul 34398'
      ]
    },
    {
      icon: <Phone sx={{ fontSize: 28, color: '#E14D43' }} />,
      title: 'Telefon',
      content: [
        '+90 (212) 555 0123',
        '+90 (542) 555 0124'
      ]
    },
    {
      icon: <Email sx={{ fontSize: 28, color: '#E14D43' }} />,
      title: 'E-posta',
      content: [
        'info@trucksbus.com',
        'destek@trucksbus.com'
      ]
    },
    {
      icon: <Schedule sx={{ fontSize: 28, color: '#E14D43' }} />,
      title: 'Çalışma Saatleri',
      content: [
        'Pazartesi - Cuma: 09:00 - 18:00',
        'Cumartesi: 09:00 - 16:00',
        'Pazar: Kapalı'
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: '#2D3748',
            fontWeight: 700,
            mb: 2
          }}
        >
          <span style={{ color: '#E14D43' }}></span> İletişim
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#64748B',
            fontWeight: 400,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Bizimle İletişime Geçin
        </Typography>
      </Box>

      {/* Feedback Alert */}
      <Alert 
        icon={<Feedback />}
        severity="info" 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          '& .MuiAlert-icon': {
            color: '#E14D43'
          }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          <strong>Geri Bildirim Sistemi:</strong> Siteye giriş yaptıktan sonra sağ üst köşedeki 
          geri bildirim butonunu kullanarak bizimle iletişim kurabilir, 
          site hakkındaki görüş ve önerilerinizi iletebilirsiniz.
        </Typography>
      </Alert>

      {/* Contact Information Cards */}
      <Grid container spacing={4} justifyContent="center">
        {contactInfo.map((info, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                borderRadius: 2,
                border: '1px solid #E2E8F0'
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {info.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#2D3748',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {info.title}
                </Typography>
                {info.content.map((line, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      lineHeight: 1.6,
                      mb: 0.5
                    }}
                  >
                    {line}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Info Section */}
      <Paper
        sx={{
          mt: 6,
          p: 4,
          borderRadius: 2,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: '#2D3748'
          }}
        >
          🚛 TrucksBus Hakkında
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: '800px', 
            mx: 'auto', 
            lineHeight: 1.8,
            color: '#64748B'
          }}
        >
          Türkiye'nin en kapsamlı ticari araç platformu olarak, kamyon, çekici, otobüs, 
          minibüs-midibüs, dorse ve benzeri ağır ticari araçların alım-satımında 
          güvenilir ve profesyonel hizmet sunuyoruz.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Chip
            label="7/24 Online Destek"
            sx={{
              backgroundColor: '#E14D43',
              color: 'white',
              fontWeight: 600,
              px: 2,
              py: 1
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactPage;
