import React from 'react';
import { Container, Typography, Box, Paper, Divider, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const accent = '#E14D43';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        {/* Başlık */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: '#2D3748',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3,
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: accent }}>🚛</span> TruckBus Hakkında
        </Typography>

        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: '#2D3748',
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
          }}
        >
          Türkiye’nin En Güvenilir Ticari Araç Platformu
        </Typography>

        <Box sx={{ maxWidth: 880, mx: 'auto' }}>
          {/* Giriş */}
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9, mb: 2 }}>
            TruckBus; kamyon, çekici, otobüs, minibüs–midibüs, dorse ve benzeri ağır ticari
            araçların alım–satımını kolaylaştıran modern bir pazaryeridir. Amacımız; alıcıyla
            satıcıyı aynı masaya hızla, şeffaf bilgilerle ve net adımlarla getirip işlemleri
            güven içinde tamamlamanızı sağlamak.
          </Typography>

          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9, mb: 3 }}>
            Deneyimli ekibimiz ve güncel teknoloji yığınımızla; detaylı ilan yapısı, akıllı
            filtreleme, güçlü arama, mesajlaşma ve destek süreçleriyle hem bireysel kullanıcılar
            hem de kurumsal müşteriler için verimli bir deneyim tasarlıyoruz.
          </Typography>

          {/* Misyon & Vizyon */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Misyonumuz
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Ağır ticari araç pazarında, güvenilir bilgiyi standart hâline getirip, karar alma
            süresini kısaltan, pazarlık ve iletişimi sadeleştiren bir platform sunmak.
          </Typography>

          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 2, mb: 1 }}>
            Vizyonumuz
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Türkiye’de ticari araç ekosisteminin buluşma noktası olmak; araç keşfinden ilana,
            vitrinden satış sonrası süreçlere kadar uçtan uca değeri artırmak.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Neden TruckBus? */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mb: 1 }}>
            Neden TruckBus?
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              ✅ <strong>Geniş yelpaze & akıllı filtreler:</strong> Araç tipine, modele, yıla,
              km’ye, donanıma göre hızlıca daraltma.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              ✅ <strong>Doğrulanmış içerik:</strong> Net başlık, açıklama, medya ve teknik
              bilgilerle şeffaflık.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              ✅ <strong>Hızlı iletişim:</strong> İlana özel mesajlaşma ve bildirimlerle
              vakit kaybını azaltan süreç.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              ✅ <strong>Kurumsal vitrin:</strong> Galeri ve filo sahipleri için düzenli profil,
              ilan yönetimi ve görünürlük avantajları.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              ✅ <strong>Mobil uyumlu arayüz:</strong> Telefon, tablet, masaüstünde akıcı deneyim.
            </Typography>
          </Box>

          {/* Nasıl Çalışır? */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Nasıl Çalışır?
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Keşfet & filtrele:</strong> İhtiyacına göre kategorileri gez, filtreleri uygula.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İlanı incele:</strong> Fotoğraflar, açıklama ve teknik detayları kontrol et.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>İletişime geç:</strong> Mesaj gönder, sorularını sor ve süreci başlat.
            </Typography>
          </Box>

          {/* Kime Hitap Ediyoruz? */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Kime Hitap Ediyoruz?
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Bireysel kullanıcılar:</strong> Doğru aracı kolayca bulmak.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Filo yöneticileri:</strong> Envanter yönetimine uygun, hedefe yönelik arama.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Galeriler & bayiler:</strong> Düzenli ilan akışı ve görünürlük.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>Tedarikçiler:</strong> Üst yapı, yedek parça, aksesuar için doğru kitle.
            </Typography>
          </Box>

          {/* Güvenlik & KVKK */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Güvenlik ve KVKK
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Kullanıcı verilerinin korunmasına ve şeffaflığa önem veriyoruz. KVKK mevzuatına uygun
            süreçler ve makul güvenlik önlemleriyle kişisel verilerin işlenmesi, saklanması ve
            paylaşılması konusunda titiz davranıyoruz. Platform ilkelerimiz; saygı, dürüstlük ve
            sorumlu kullanım üzerine kurulu.
          </Typography>

          {/* Yol Haritamız */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Yol Haritamız
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Gelişmiş arama & sıralama:</strong> Daha isabetli sonuçlar için akıllı filtreler.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Kurumsal mağaza deneyimi:</strong> Vitrin, istatistikler ve ekip yönetimi.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>Mobil uygulamalar:</strong> Yol üzerindeyken bile ilan yönetimi ve keşif.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* CTA */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              onClick={() => navigate('/listings')}
              sx={{
                px: 3,
                py: 1.25,
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${accent}, #ff8a7b)`,
                color: '#fff',
                textTransform: 'none',
                boxShadow: '0 6px 18px rgba(225,77,67,0.35)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 26px rgba(225,77,67,0.45)',
                },
              }}
            >
              İlanlara Göz At
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/sell')}
              sx={{
                px: 3,
                py: 1.25,
                fontWeight: 700,
                borderRadius: 2,
                color: '#2D3748',
                borderColor: '#CBD5E0',
                textTransform: 'none',
                '&:hover': {
                  borderColor: accent,
                  backgroundColor: 'rgba(225,77,67,0.06)',
                },
              }}
            >
              Hemen İlan Ver
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
