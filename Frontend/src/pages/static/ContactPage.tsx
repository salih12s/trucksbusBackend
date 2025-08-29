import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const ContactPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: '#2D3748',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 4
          }}
        >
          <span style={{ color: '#E14D43' }}>📞</span> İletişim
        </Typography>

        <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: '#2D3748', fontWeight: 600, mb: 3, textAlign: 'center' }}
          >
            Bizimle İletişime Geçin
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600 }}>
              📍 Adres
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              TruckBus Merkez Ofis<br />
              İstanbul, Türkiye
            </Typography>

            <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600 }}>
              📞 Telefon
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              +90 (555) 123 45 67<br />
            </Typography>

            <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600 }}>
              ✉️ E-posta
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              info@truckbus.com<br />
              destek@truckbus.com
            </Typography>

            <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600 }}>
              💬 Sitemiz için destek sistemimiz
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              Siteye giriş yaptıktan sonra sağ üst köşedeki geri bildirim butonunu kullanarak
              bizimle iletişim kurabilir site hakkındaki şikayetlerinizi iletebilirsiniz.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactPage;
