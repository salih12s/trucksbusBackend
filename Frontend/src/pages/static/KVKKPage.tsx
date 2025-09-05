import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const KVKKPage: React.FC = () => {
  const accent = '#E14D43';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ color: '#2D3748', fontWeight: 'bold', textAlign: 'center', mb: 3 }}
        >
          <span style={{ color: accent }}>⚖️</span> KVKK Aydınlatma Metni
        </Typography>

        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          {/* Giriş */}
          <Typography variant="h5" gutterBottom sx={{ color: '#2D3748', fontWeight: 700, mb: 2 }}>
            Kişisel Verilerin Korunması Kanunu Bilgilendirmesi
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (“<strong>KVKK</strong>”) uyarınca, TrucksBus
            olarak kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz. Bu metin, hangi
            verileri hangi amaçlarla işlediğimizi, hukuki sebeplerimizi, verilerinizi kimlerle
            paylaşabileceğimizi, saklama sürelerini ve KVKK m.11 kapsamındaki haklarınızı açıklar.
          </Typography>

          <Divider sx={{ my: 3 }} />

    

          {/* İşlenen Veri Kategorileri */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 2, mb: 1 }}>
            İşlenen Kişisel Veri Kategorileri (Platform Gerçeklerine Göre)
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Aşağıdaki kapsam <strong>ilan sitesi</strong> ihtiyaçlarına göre düzenlenmiştir. <u>TC Kimlik
            Numarası talep etmiyoruz ve işlemiyoruz.</u>
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İletişim Verisi (Zorunlu):</strong> <u>Telefon numarası</u>. İlan sahibi ile
              alıcıların iletişim kurabilmesi için ilan sayfalarında gösterilir.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İletişim Verisi (Opsiyonel):</strong> E-posta adresi (hesap doğrulama, bildirim
              ve destek süreçlerinde). <u>Kamuya açık olarak gösterilmez.</u>
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Hesap/Profil Verisi (Opsiyonel):</strong> Ad-soyad veya mağaza/ünvan bilgisi
              (sağladığınız kadarıyla), profil fotoğrafı (varsa).
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İlan/İşlem Verileri:</strong> İlan içerikleri, görseller, kategori ve teknik
              bilgiler, favoriler, görüntüleme ve etkileşim kayıtları.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İşlem Güvenliği ve Kullanım Verileri:</strong> IP adresi, tarayıcı/cihaz bilgisi,
              oturum ve log kayıtları, çerez/benzeri teknolojilerden elde edilen veriler (Çerez
              Politikası’nda detaylıdır).
            </Typography>
          </Box>

          {/* Amaçlar */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Kişisel Verilerin İşlenme Amaçları
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Hizmet Sunumu:</strong> İlan oluşturma, listeleme, arama/filtreleme, iletişim
              kurulması (telefonun ilan sayfasında gösterimi dâhil).
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Hesap ve Destek Süreçleri:</strong> Üyelik yönetimi, bildirimler, şikâyet ve
              destek taleplerinin yanıtlanması.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Güvenlik ve Kötüye Kullanım Önleme:</strong> Şüpheli işlemlerin tespiti, dolandırıcılık
              önleme, log/denetim.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>İyileştirme ve Ölçümleme:</strong> Performans, kullanıcı deneyimi ve yeni
              özellik geliştirme analizleri (anonim/istatistiksel çalışmalar).
            </Typography>
          </Box>

          {/* Hukuki Sebepler */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Hukuki Sebepler (KVKK m.5)
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Sözleşmenin kurulması/ifası için zorunlu olması</strong> (üyelik/ilan süreçleri).
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Hukuki yükümlülüklerimizin yerine getirilmesi</strong> (muhafaza, mevzuat talepleri).
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Meşru menfaat</strong> (güvenlik, dolandırıcılık önleme, ürün geliştirme).
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>Açık rıza</strong> (zorunlu olmayan çerezler, ticari iletiler gibi durumlarda).
            </Typography>
          </Box>

          {/* Aktarım */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Kişisel Verilerin Aktarımı
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Verileriniz; yalnızca yukarıdaki amaçlar için ve gerekli olduğu kadar,
            <strong> hizmet sağlayıcılarımıza</strong> (barındırma/hosting, güvenlik, log, bildirim,
            e-posta/SMS, analitik) ve <strong>yetkili kamu kurumlarına</strong> (mevzuat gereği)
            aktarılabilir. Telefon numaranız, ilan sahibiyle iletişim kurulabilmesi için ilan
            sayfalarında <u>kamuya açık</u> olarak gösterilir. E-posta adresiniz (varsa) kamuya açık
            değildir.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            Hizmet sağlayıcılarımızın bir kısmı yurt dışında bulunabilir. Bu durumda KVKK m.9
            kapsamında gerekli korumalar sağlanarak aktarım yapılır ve/veya açık rıza süreçleri işletilir.
          </Typography>

          {/* Toplama Yöntemi */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Kişisel Verilerin Toplanma Yöntemi
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Verileriniz; Platform’a üye olurken, ilan oluştururken, profil/destek formları üzerinden,
            çağrı/iletişim kanallarında, cihaz ve tarayıcı üzerinden otomatik yollarla (çerezler,
            SDK’lar) elektronik ortamda elde edilir.
          </Typography>

          {/* Saklama Süreleri */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Saklama Süreleri
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>Hesap/İlan kayıtları:</strong> Üyeliğiniz devam ettiği sürece ve mevzuatta
              öngörülen süreler kadar.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.2, lineHeight: 1.9 }}>
              <strong>İşlem güvenliği/log kayıtları:</strong> İlgili mevzuatta öngörülen süreler kadar.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0, lineHeight: 1.9 }}>
              <strong>Ticari ileti onayı/verileri:</strong> Onay geri çekilene veya yasal süre dolana kadar.
            </Typography>
          </Box>

         
          {/* Güvenlik & Çerezler */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Veri Güvenliği ve Çerezler
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Uygun teknik ve idari tedbirlerle verilerinizi koruyoruz (erişim yetkilendirme, şifreleme,
            loglama, ağ güvenliği vb.). Çerez kullanımına ilişkin detaylar ayrıca <strong>Çerez
            Politikası</strong>’nda yer alır. Zorunlu olmayan çerezler için açık rızanız alınır.
          </Typography>

          {/* Değişiklikler */}
          <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mt: 3, mb: 1 }}>
            Değişiklikler
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
            Bu Aydınlatma Metni, hizmetlerimiz ve mevzuat değişikliklerine paralel olarak güncellenebilir.
            Güncel sürüm Platform üzerinden yayımlandığı tarihte yürürlüğe girer.
          </Typography>

          {/* Not & Tarih */}
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 3, p: 2, bgcolor: '#f7f7f7', borderRadius: 1, fontStyle: 'italic' }}
          >
            Not: Bu metin Platform’un gerçek işleyişi esas alınarak hazırlnmıştır. Özel durumlar için
            hukuk danışmanınızdan teyit almanızı öneririz. <br />
            Son güncellenme: {new Date().toLocaleDateString('tr-TR')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default KVKKPage;
