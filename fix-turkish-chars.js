const fs = require('fs');
const path = require('path');

// Türkçe karakter eşleştirmeleri
const replacements = [
  // Steps array
  ["const steps = ['Ã„Â°lan DetaylarÃ„Â±', 'FotoÃ„Å¸raflar', 'Ã„Â°letiÃ…Å¸im & Fiyat'];", "const steps = ['İlan Detayları', 'Fotoğraflar', 'İletişim & Fiyat'];"],
  
  // Comments
  ["// FotoÃ„Å¸raf bilgileri", "// Fotoğraf bilgileri"],
  ["// Ã„Â°letiÃ…Å¸im ve fiyat bilgileri", "// İletişim ve fiyat bilgileri"],
  
  // Form titles and labels
  ["Boru RÃƒÂ¶morku Ã„Â°lan DetaylarÃ„Â±", "Boru Römorku İlan Detayları"],
  ["TarÃ„Â±m Tanker Ã„Â°lan DetaylarÃ„Â±", "Tarım Tanker İlan Detayları"],
  ["Ã„Â°lan BaÃ…Å¸lÃ„Â±Ã„Å¸Ã„Â±", "İlan Başlığı"],
  ["AÃƒÂ§Ã„Â±klama", "Açıklama"],
  ["ÃƒÅ"retim YÃ„Â±lÃ„Â±", "Üretim Yılı"],
  ["TakaslÃ„Â±", "Takaslı"],
  ["HayÃ„Â±r", "Hayır"],
  
  // Photo-related text
  ["FotoÃ„Å¸raf YÃƒÂ¼kleme", "Fotoğraf Yükleme"],
  ["AracÃ„Â±nÃ„Â±zÃ„Â±n fotoÃ„Å¸raflarÃ„Â±nÃ„Â± yÃƒÂ¼kleyin", "Aracınızın fotoğraflarını yükleyin"],
  ["FotoÃ„Å¸raf YÃƒÂ¼kle", "Fotoğraf Yükle"],
  ["formatÃ„Â±nda maksimum 5MB boyutunda dosyalar yÃƒÂ¼kleyebilirsiniz", "formatında maksimum 5MB boyutunda dosyalar yükleyebilirsiniz"],
  ["FotoÃ„Å¸raf SeÃƒÂ§", "Fotoğraf Seç"],
  ["YÃƒÂ¼klenen fotoÃ„Å¸raflarÃ„Â± gÃƒÂ¶ster", "Yüklenen fotoğrafları göster"],
  ["YÃƒÂ¼klenen FotoÃ„Å¸raflar", "Yüklenen Fotoğraflar"],
  ["En fazla 10 fotoÃ„Å¸raf yÃƒÂ¼kleyebilirsiniz", "En fazla 10 fotoğraf yükleyebilirsiniz"],
  ["Ã„Â°pucu: Ã„Â°lk yÃƒÂ¼klediÃ„Å¸iniz fotoÃ„Å¸raf vitrin fotoÃ„Å¸rafÃ„Â± olarak kullanÃ„Â±lacaktÃ„Â±r", "İpucu: İlk yüklediğiniz fotoğraf vitrin fotoğrafı olarak kullanılacaktır"],
  
  // Special characters
  ["ÄŸÅ¸â€™Â¡", "💡"],
  ["Ãƒâ€"", "Ö"],
];

// Problematic files list
const files = [
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/Damperli/AhsapKasaForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/Damperli/HafriyatTipiForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/Damperli/HavuzHardoxTipiForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/Damperli/KayaTipiForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/SabitKabin/AcikKasaForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/SabitKabin/KapaliKasaForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/KaroserUstyapi/SabitKabin/OzelKasaForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/OzelAmacliRomork/OzelAmacliRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TarimRomork/SulamaForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TarimRomork/TarimTankerForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/BoruRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/FrigoRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/PlatformRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/SeyehatRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/TupDamacanaRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/VasitaRomorkForm.tsx",
  "C:/Users/salih/Desktop/TruckBus/Frontend/src/pages/Forms/TasimaRomorklari/YukRomorkForm.tsx"
];

console.log('🔄 Türkçe karakter düzeltmeleri başlıyor...');

let totalFixed = 0;

files.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`📄 İşleniyor: ${path.basename(filePath)}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Apply all replacements
      replacements.forEach(([from, to]) => {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Düzeltildi`);
        totalFixed++;
      } else {
        console.log(`  ℹ️ Değişiklik yok`);
      }
    } else {
      console.log(`  ❌ Dosya bulunamadı: ${filePath}`);
    }
  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}`);
  }
});

console.log(`\n🎉 Tamamlandı! ${totalFixed} dosyada düzeltme yapıldı.`);
