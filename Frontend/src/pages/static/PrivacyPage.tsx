import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <span style={{ color: '#E14D43' }}>🔒</span> Gizlilik Politikası
        </Typography>

        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            TrucksBus olarak, kullanıcılarımızın gizliliğini korumak en önemli önceliklerimizden biridir. 
            Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu 
            hakkında bilgi verir.
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Toplanan Bilgiler
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            • Kayıt sırasında verdiğiniz kişisel bilgiler (ad, soyad, e-posta, telefon)<br />
            • İlan oluşturma sırasında paylaştığınız araç bilgileri<br />
            • Site kullanım logları ve analitik veriler<br />
            • Çerez (cookie) bilgileri
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Bilgilerin Kullanımı
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            Toplanan bilgiler sadece hizmet kalitesini artırmak, güvenliği sağlamak ve 
            yasal yükümlülükleri yerine getirmek amacıyla kullanılır. Verileriniz üçüncü 
            taraflarla paylaşılmaz.
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Veri Güvenliği
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            Kişisel verileriniz SSL şifreleme ile korunur ve güvenli sunucularda saklanır. 
            Sadece yetkili personel erişim sağlayabilir.
          </Typography>

        

          <Typography variant="body2" sx={{ 
            color: '#666', 
            mt: 4, 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1,
            fontStyle: 'italic'
          }}>
            Bu politika son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
