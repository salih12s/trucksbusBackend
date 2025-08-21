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

# Türkçe karakter eşleştirmeleri - UTF-8 double encoding sorunlarını çöz
$CharacterMappings = @{
    # İ karakteri ve varyasyonları
    'Ã„Â°' = 'İ'
    'Ã„Â±' = 'ı'
    
    # Ğ karakteri ve varyasyonları
    'Ã„Å¸' = 'ğ'
    'ÄŸ' = 'ğ'
    'Ã„Å¾' = 'Ğ'
    
    # Ş karakteri ve varyasyonları
    'Ã…Å¸' = 'ş'
    'ÅŸ' = 'ş'
    'Ã…Å¾' = 'Ş'
    
    # Ç karakteri ve varyasyonları
    'ÃƒÂ§' = 'ç'
    'Ã§' = 'ç'
    'ÃƒÂ‡' = 'Ç'
    
    # Ü karakteri ve varyasyonları
    'ÃƒÂ¼' = 'ü'
    'Ã¼' = 'ü'
    'ÃƒÅ"' = 'Ü'
    
    # Ö karakteri ve varyasyonları
    'ÃƒÂ¶' = 'ö'
    'Ã¶' = 'ö'
    'ÃƒÂ–' = 'Ö'
    
    # Özel karakterler
    'ÄŸÅ¸â€™Â¡' = '💡'
    'Ãƒâ€"' = 'Ö'
    'â€™' = "'"
}

Write-Host "Türkçe karakter bozukluğu düzeltiliyor..." -ForegroundColor Yellow

$TotalFixed = 0

foreach ($FilePath in $FormFiles) {
    if (Test-Path $FilePath) {
        Write-Host "İşleniyor: $FilePath" -ForegroundColor Cyan
        
        # Dosyayı UTF-8 olarak oku
        $Content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $OriginalContent = $Content
        
        # Her karakter eşleştirmesini uygula
        foreach ($Mapping in $CharacterMappings.GetEnumerator()) {
            $Content = $Content -replace [regex]::Escape($Mapping.Key), $Mapping.Value
        }
        
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

Write-Host "`n🎉 Tamamlandı! $TotalFixed dosyada Türkçe karakter düzeltmeleri yapıldı." -ForegroundColor Green
Write-Host "Lütfen projeyi yeniden derleyip test edin." -ForegroundColor Yellow
