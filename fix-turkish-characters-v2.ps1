# Türkçe karakter bozukluğu düzeltme scripti
$FormFiles = @(
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\Damperli\AhsapKasaForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\Damperli\HafriyatTipiForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\Damperli\HavuzHardoxTipiForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\Damperli\KayaTipiForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\SabitKabin\AcikKasaForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\SabitKabin\KapaliKasaForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\KaroserUstyapi\SabitKabin\OzelKasaForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\OzelAmacliRomork\OzelAmacliRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TarimRomork\SulamaForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TarimRomork\TarimTankerForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\BoruRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\FrigoRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\PlatformRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\SeyehatRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\TupDamacanaRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\VasitaRomorkForm.tsx",
    "C:\Users\salih\Desktop\TruckBus\Frontend\src\pages\Forms\TasimaRomorklari\YukRomorkForm.tsx"
)

Write-Host "Türkçe karakter bozukluğu düzeltiliyor..." -ForegroundColor Yellow

$TotalFixed = 0

foreach ($FilePath in $FormFiles) {
    if (Test-Path $FilePath) {
        Write-Host "İşleniyor: $FilePath" -ForegroundColor Cyan
        
        # Dosyayı UTF-8 olarak oku
        $Content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $OriginalContent = $Content
        
        # Yaygın Türkçe karakter bozukluklarını düzelt
        $Content = $Content -replace 'Ã„Â°lan DetaylarÃ„Â±', 'İlan Detayları'
        $Content = $Content -replace 'FotoÃ„Å¸raflar', 'Fotoğraflar'
        $Content = $Content -replace 'Ã„Â°letiÃ…Å¸im & Fiyat', 'İletişim & Fiyat'
        $Content = $Content -replace 'Ã„Â°lan BaÃ…Å¸lÃ„Â±Ã„Å¸Ã„Â±', 'İlan Başlığı'
        $Content = $Content -replace 'AÃƒÂ§Ã„Â±klama', 'Açıklama'
        $Content = $Content -replace 'ÃƒÅ"retim YÃ„Â±lÃ„Â±', 'Üretim Yılı'
        $Content = $Content -replace 'TakaslÃ„Â±', 'Takaslı'
        $Content = $Content -replace 'HayÃ„Â±r', 'Hayır'
        $Content = $Content -replace 'FotoÃ„Å¸raf YÃƒÂ¼kleme', 'Fotoğraf Yükleme'
        $Content = $Content -replace 'AracÃ„Â±nÃ„Â±zÃ„Â±n fotoÃ„Å¸raflarÃ„Â±nÃ„Â± yÃƒÂ¼kleyin', 'Aracınızın fotoğraflarını yükleyin'
        $Content = $Content -replace 'FotoÃ„Å¸raf YÃƒÂ¼kle', 'Fotoğraf Yükle'
        $Content = $Content -replace 'formatÃ„Â±nda maksimum 5MB boyutunda dosyalar yÃƒÂ¼kleyebilirsiniz', 'formatında maksimum 5MB boyutunda dosyalar yükleyebilirsiniz'
        $Content = $Content -replace 'FotoÃ„Å¸raf SeÃƒÂ§', 'Fotoğraf Seç'
        $Content = $Content -replace 'YÃƒÂ¼klenen fotoÃ„Å¸raflarÃ„Â± gÃƒÂ¶ster', 'Yüklenen fotoğrafları göster'
        $Content = $Content -replace 'YÃƒÂ¼klenen FotoÃ„Å¸raflar', 'Yüklenen Fotoğraflar'
        $Content = $Content -replace 'En fazla 10 fotoÃ„Å¸raf yÃƒÂ¼kleyebilirsiniz', 'En fazla 10 fotoğraf yükleyebilirsiniz'
        $Content = $Content -replace 'Ã„Â°pucu: Ã„Â°lk yÃƒÂ¼klediÃ„Å¸iniz fotoÃ„Å¸raf vitrin fotoÃ„Å¸rafÃ„Â± olarak kullanÃ„Â±lacaktÃ„Â±r', 'İpucu: İlk yüklediğiniz fotoğraf vitrin fotoğrafı olarak kullanılacaktır'
        
        # Özel karakterler
        $Content = $Content -replace 'ÄŸÅ¸â€™Â¡', '💡'
        $Content = $Content -replace 'Ãƒâ€"', 'Ö'
        
        # Genel karakter düzeltmeleri
        $Content = $Content -replace 'Ã„Â°', 'İ'
        $Content = $Content -replace 'Ã„Â±', 'ı'
        $Content = $Content -replace 'Ã„Å¸', 'ğ'
        $Content = $Content -replace 'Ã„Å¾', 'Ğ'
        $Content = $Content -replace 'Ã…Å¸', 'ş'
        $Content = $Content -replace 'Ã…Å¾', 'Ş'
        $Content = $Content -replace 'ÃƒÂ§', 'ç'
        $Content = $Content -replace 'ÃƒÂ‡', 'Ç'
        $Content = $Content -replace 'ÃƒÂ¼', 'ü'
        $Content = $Content -replace 'ÃƒÅ"', 'Ü'
        $Content = $Content -replace 'ÃƒÂ¶', 'ö'
        $Content = $Content -replace 'ÃƒÂ–', 'Ö'
        
        # Form başlıkları düzeltmeleri
        $Content = $Content -replace 'Boru RÃƒÂ¶morku Ã„Â°lan DetaylarÃ„Â±', 'Boru Römorku İlan Detayları'
        $Content = $Content -replace 'TarÃ„Â±m Tanker Ã„Â°lan DetaylarÃ„Â±', 'Tarım Tanker İlan Detayları'
        
        # FotoÃ„Å¸raf bilgileri yorumları
        $Content = $Content -replace 'FotoÃ„Å¸raf bilgileri', 'Fotoğraf bilgileri'
        $Content = $Content -replace 'Ã„Â°letiÃ…Å¸im ve fiyat bilgileri', 'İletişim ve fiyat bilgileri'
        
        # Değişiklik yapıldıysa dosyayı kaydet
        if ($Content -ne $OriginalContent) {
            $Content | Out-File -FilePath $FilePath -Encoding UTF8 -NoNewline
            Write-Host "  ✅ Düzeltmeler uygulandı" -ForegroundColor Green
            $TotalFixed++
        } else {
            Write-Host "  ℹ️  Düzeltme gerekmiyor" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ Dosya bulunamadı: $FilePath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Tamamlandı! $TotalFixed dosyada Türkçe karakter düzeltmeleri yapıldı." -ForegroundColor Green
Write-Host "Lütfen projeyi yeniden derleyip test edin." -ForegroundColor Yellow
