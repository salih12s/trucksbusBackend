# 🚀 TruckBus Backend - Railway Deploy Rehberi

## 1. Railway.app Hesabı Oluştur
- railway.app → Sign up with GitHub
- Free tier: 500 saatlik çalışma

## 2. Backend Hazırlık

### Package.json'a start script ekle:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "deploy": "npm run build && npm start"
  }
}
```

### Environment Variables (.env):
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=3005
FRONTEND_URL=https://trucksbus.com.tr
```

## 3. Railway Deploy

### GitHub üzerinden:
1. Backend'i GitHub repository'sine push et
2. Railway → New Project → Deploy from GitHub
3. Repository seç
4. Environment Variables ayarla
5. Deploy!

### CLI ile:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 4. PostgreSQL Database

### Railway PostgreSQL:
1. Railway Dashboard → Add Database → PostgreSQL
2. Otomatik DATABASE_URL oluşur
3. Environment Variables'a ekle

### Prisma Migration:
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

## 5. Custom Domain (Opsiyonel)

### Subdomain ayarla:
1. Railway → Settings → Domains
2. Custom domain ekle: api.trucksbus.com.tr
3. DNS'te CNAME record ekle:
   ```
   api.trucksbus.com.tr → your-app.railway.app
   ```

## 6. Frontend API URL Güncelle

### .env.production:
```bash
VITE_API_BASE_URL=https://your-app.railway.app
# veya
VITE_API_BASE_URL=https://api.trucksbus.com.tr
```

## 7. CORS Ayarları

Backend'te CORS'u frontend domain'i için güncelle:
```javascript
app.use(cors({
  origin: ['https://trucksbus.com.tr', 'http://localhost:3000'],
  credentials: true
}));
```

## 🎯 Alternatif: Render.com

### Render Deploy:
1. render.com → New Web Service
2. GitHub repository bağla
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Environment Variables ekle
6. PostgreSQL database ekle

## 💰 Maliyet Karşılaştırması:

### Railway:
- Free: 500 saat/ay (hobby projeler)
- Pro: $5/ay (unlimited)

### Render:
- Free: 750 saat/ay (sleep mode)
- Starter: $7/ay (always on)

### VPS (DigitalOcean):
- Basic: $5/ay (1GB RAM, 25GB SSD)
- Tam kontrol, unlimited

## 🔧 Deploy Sonrası Test:

1. API endpoint'leri test et:
   ```
   https://your-app.railway.app/api/health
   https://your-app.railway.app/api/listings
   ```

2. Frontend'den API bağlantısını test et

3. WebSocket bağlantısını test et

## 📋 Deploy Checklist:

- [ ] Backend GitHub'a push
- [ ] Railway/Render hesabı oluştur  
- [ ] PostgreSQL database oluştur
- [ ] Environment variables ayarla
- [ ] Deploy et
- [ ] API endpoint'leri test et
- [ ] Frontend API URL güncelle
- [ ] CORS ayarları kontrol et
- [ ] SSL sertifikası kontrol et

---

**Öneri**: Railway ile başla, trafiğin artarsa VPS'e geç! 🚀
