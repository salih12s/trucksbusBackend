# TruckBus Frontend - Production Deploy Guide

## 📦 Deploy Paketinin İçeriği

Bu zip dosyası TruckBus frontend uygulamasının production-ready halini içerir.

### İçerik:
- `index.html` - Ana HTML dosyası
- `assets/` - CSS, JS ve diğer asset dosyaları
- `.htaccess` - Apache web server yapılandırması

## 🚀 C Panel Deploy Adımları

### 1. Dosya Yöneticisi
- C Panel'e giriş yapın
- File Manager'ı açın
- `public_html` dizinine gidin

### 2. Dosya Yükleme
- Bu zip dosyasının içindeki tüm dosyaları `public_html` dizinine yükleyin
- Veya zip'i doğrudan yükleyip extract edin

### 3. Önemli Ayarlar

#### A. Domain Ayarları
`.env.production` dosyasında belirtilen URL'leri güncelleyin:
- `VITE_API_BASE_URL` - Backend API URL'niz
- `VITE_SOCKET_URL` - WebSocket URL'niz

#### B. Apache Modülleri
Aşağıdaki Apache modüllerinin aktif olduğundan emin olun:
- mod_rewrite
- mod_headers
- mod_expires
- mod_deflate

### 4. SSL Sertifikası
- HTTPS için SSL sertifikası kurulmalı
- Mixed content hatalarını önlemek için

## 🔧 Yapılandırma

### API Bağlantısı
Frontend şu URL'leri kullanacak:
```
API Base: https://api.trucksbus.com
Socket: https://api.trucksbus.com
```

### Desteklenen Özellikler
✅ React Router (SPA routing)
✅ Material-UI components
✅ Socket.IO real-time features
✅ File upload functionality
✅ Authentication system
✅ Admin dashboard
✅ User management
✅ Listing management
✅ Messaging system
✅ Notification system
✅ Feedback system

## 🧪 Test Checklist

Deploy sonrası test edilmesi gerekenler:

### Temel Fonksiyonlar
- [ ] Ana sayfa yükleniyor
- [ ] Login/Register çalışıyor
- [ ] İlan listeleme çalışıyor
- [ ] İlan detay sayfası açılıyor

### API Bağlantısı
- [ ] Kullanıcı girişi başarılı
- [ ] İlanlar listeleniyor
- [ ] Arama çalışıyor
- [ ] Filtreleme çalışıyor

### Real-time Özellikler
- [ ] Bildirimler geliyor
- [ ] Mesajlaşma çalışıyor
- [ ] Socket bağlantısı kurulu

### Admin Panel
- [ ] Admin girişi
- [ ] İlan yönetimi
- [ ] Kullanıcı yönetimi
- [ ] Feedback yönetimi

## 🛠️ Sorun Giderme

### Yaygın Problemler

1. **404 Hatası (Routing)**
   - `.htaccess` dosyasının doğru yüklendiğinden emin olun
   - mod_rewrite modülünün aktif olduğunu kontrol edin

2. **API Bağlantı Hatası**
   - CORS ayarlarını backend'de kontrol edin
   - API URL'lerinin doğru olduğunu onaylayın

3. **SSL Hatası**
   - Mixed content hatalarını önlemek için HTTPS kullanın
   - Tüm external kaynakların HTTPS olduğunu kontrol edin

4. **Socket Bağlantı Problemi**
   - WebSocket bağlantısı için özel yapılandırma gerekebilir
   - C Panel hosting sağlayıcınızdan destek alın

## 📞 Destek

Herhangi bir sorunla karşılaştığınızda:
1. Browser Developer Tools'da console error'larını kontrol edin
2. Network tab'ında API isteklerini inceleyin
3. C Panel error logs'larını kontrol edin

---
**Deploy Tarihi:** ${new Date().toLocaleDateString('tr-TR')}
**Version:** 1.0.0
