import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsPage: React.FC = () => {
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
          <span style={{ color: '#E14D43' }}>📋</span> Kullanım Şartları
        </Typography>

        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            TruckBus platformunu kullanarak aşağıdaki şart ve koşulları kabul etmiş sayılırsınız.
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Genel Kurallar
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            • 18 yaşından küçükler platform kullanamaz<br />
            • Sadece gerçek ve doğru bilgiler paylaşılmalıdır<br />
            • Yanıltıcı, sahte veya hileli ilanlar yasaktır<br />
            • Platform sadece ticari araç alım-satımı için kullanılabilir
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            İlan Kuralları
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            • İlanlar gerçek araçlar için verilmelidir<br />
            • Fotoğraflar aracın gerçek halini yansıtmalıdır<br />
            • Fiyat bilgileri net ve güncel olmalıdır<br />
            • Yasal olmayan araçlar için ilan verilemez
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Yasaklanan Davranışlar
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            • Spam, dolandırıcılık veya sahte ilanlar<br />
            • Başka kullanıcılara taciz veya rahatsızlık vermek<br />
            • Telif hakkı ihlali yapan içerik paylaşmak<br />
            • Platform güvenliğini tehlikeye atacak aktiviteler
          </Typography>

          <Typography variant="h6" sx={{ color: '#E14D43', mb: 2, fontWeight: 600, mt: 4 }}>
            Hesap Askıya Alma
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            Kurallara uymayan kullanıcıların hesapları uyarı olmaksızın askıya alınabilir 
            veya tamamen kapatılabilir.
          </Typography>

          <Typography variant="body2" sx={{ 
            color: '#666', 
            mt: 4, 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1,
            fontStyle: 'italic'
          }}>
            Bu şartlar son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage;
