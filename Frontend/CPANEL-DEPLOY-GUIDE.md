# 🚀 TruckBus Frontend - C Panel Deploy Paketi

## ✅ Hazır Dosyalar

### 📦 Deploy Paketi: `trucksbus-frontend-production.zip`
- **Boyut:** ~47MB
- **İçerik:** Production build + .htaccess + tüm assets
- **Tarih:** 24.08.2025

### 📄 Dahil Edilen Dosyalar:
- `index.html` - Ana HTML dosyası
- `assets/index-*.css` - Minified CSS (25KB)
- `assets/index-*.js` - Minified JavaScript (1.6MB)
- `.htaccess` - Apache yapılandırması (React Router için)
- `CategoryImage/` - Kategori görselleri
- `ModelImage/` - Model görselleri
- `TruckBus.png` - Logo

## 🔧 Deploy Adımları

### 1. C Panel'e Giriş
- Hosting sağlayıcınızın C Panel'ine giriş yapın

### 2. File Manager
- File Manager'ı açın
- `public_html` dizinine gidin

### 3. Dosya Yükleme
**Seçenek A:** Zip yükle ve çıkart
- `trucksbus-frontend-production.zip` dosyasını yükleyin
- Zip dosyasına sağ tık → Extract

**Seçenek B:** Manuel yükleme
- Zip'i masaüstünde açın
- Tüm dosyaları `public_html` dizinine kopyalayın

### 4. Önemli Kontroller
- [ ] `.htaccess` dosyası yüklendi
- [ ] `index.html` root dizinde
- [ ] `assets/` klasörü mevcut
- [ ] Tüm resim klasörleri yüklendi

## ⚙️ Yapılandırma

### API Ayarları
Şu anda frontend şu URL'leri kullanacak:
```
API Base: https://api.trucksbus.com
Socket: https://api.trucksbus.com
```

### Değiştirilmesi Gerekenler
1. **Domain değişikliği** - Kendi domain'inizi kullanıyorsanız:
   - Backend'i deploy ettikten sonra
   - Frontend'i yeniden build alıp yükleyin

2. **SSL Sertifikası**
   - HTTPS mutlaka aktif olmalı
   - Mixed content hatalarını önler

### Apache Modülleri
Aşağıdakilerin aktif olduğundan emin olun:
- `mod_rewrite` (URL routing için)
- `mod_headers` (Security headers için)
- `mod_expires` (Cache control için)
- `mod_deflate` (Gzip compression için)

## 🧪 Test Listesi

Deploy sonrası test edilmesi gerekenler:

### Temel Test
- [ ] https://yourdomain.com açılıyor
- [ ] Ana sayfa yükleniyor
- [ ] Resimler görünüyor
- [ ] Navigation çalışıyor

### Route Test
- [ ] /listings sayfası açılıyor
- [ ] /login sayfası açılıyor
- [ ] Browser back/forward çalışıyor
- [ ] Direct URL girişi çalışıyor

### API Bağlantı Test
- [ ] Login denemesi (backend yoksa hata vermeli)
- [ ] API endpoint'lerine istek atılıyor
- [ ] CORS hatası olmamalı

## 🛠️ Sorun Giderme

### Yaygın Problemler:

1. **Sayfa bulunamadı (404)**
   - `.htaccess` dosyası eksik
   - mod_rewrite modülü kapalı

2. **Resimler yüklenmiyor**
   - Assets klasörü eksik
   - File permissions problemi

3. **White screen**
   - JavaScript hatası
   - Console'da error kontrol edin

4. **API bağlantı hatası**
   - Backend henüz deploy edilmemiş
   - CORS ayarları problemi

## 📞 Destek

Sorun yaşarsanız:
1. Browser Developer Tools → Console
2. Network tab → Failed requests
3. C Panel → Error Logs

---

**🎉 Deploy başarılı olursa TruckBus frontend hazır!**

**Sonraki adım:** Backend deploy (Node.js hosting gerekli)
