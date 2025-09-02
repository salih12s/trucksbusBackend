/**
 * Model resimlerini düzeltme scripti
 * Eksik model resimlerini belirleyip düzeltir
 */

// Model ismi ve dosya ismi eşleştirme tablosu
const modelImageMapping: Record<string, string> = {
  // Dorseler kategorisindeki problemli isimler
  "Kuruyük": "Kuruyük.png", // Türkçe karakter var, hem Kuruyuk.png hem Kuruyük.png mevcut
  "Özel Amaçlı Dorseler": "Ozel-Amacli-Dorseler.png",
  "Özel amaçlı dorseler": "Ozel-Amacli-Dorseler.png",
  "Özel Amaçlı dorseler": "Ozel-Amacli-Dorseler.png",
  
  // Otobüs kategorisindeki problemli isimler  
  "Irizar": "Irizar.png",
  
  // Diğer yaygın problemli isimler (önceden tespit edilenler)
  "Mercedes": "Mercedes.png",
  "Ford": "FORD.png",
  "Volkswagen": "Volkswagen.png",
  "Renault": "Renault.png",
  "Fiat": "Fiat.png",
  "Toyota": "Toyota.png",
  "Hyundai": "Hyundai.png",
  "Mitsubishi": "Mitsubishi.png",
  "Mitsubishi Fuso": "MitsubishiFuso.png",
  "Ford Otosan": "FordOtosan.png",
  "Renault Trucks": "RenaultTruck.png",
  
  // Türkçe karakter düzeltmeleri
  "Özel Amaçlı Römorklar": "Özel Amaçlı Römorklar.png",
  "Taşıma Römorklar": "Taşıma Römorklar.png",
  "Tarım Römorklar": "Tarım Römorklar.png"
};

// Fallback resim eşleştirmeleri (benzer kategoriler için)
const fallbackMapping: Record<string, string> = {
  // Dorseler için fallback'ler
  "Kuruyük": "Kuruyük.png",
  "Özel Amaçlı Dorseler": "Ozel-Amacli-Dorseler.png",
  "Tenteli": "Tenteli.png",
  "Tanker": "Tanker.png",
  "Frigofirik": "Frigofirik.png",
  
  // Otobüs için fallback'ler
  "Irizar": "Irizar.png",
  "Neoplan": "Neoplan.png",
  "Setra": "Setra.png",
  "Van Hool": "VanHool.png",
  
  // Genel fallback
  "default": "DigerMarkalar.png"
};

// Resim dosyası kontrolü
function checkImageExists(imageName: string): boolean {
  const fs = require('fs');
  const path = require('path');
  
  const imagePath = path.join(__dirname, '../public/ModelImage', imageName);
  return fs.existsSync(imagePath);
}

// Model ismini dosya ismine dönüştür
function normalizeModelName(modelName: string): string {
  // Türkçe karakterleri düzelt
  const normalized = modelName
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ö/g, 'o') 
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I');
    
  return normalized;
}

// Ana düzeltme fonksiyonu
function fixModelImages() {
  console.log('🔧 Model resmi düzeltme scripti başlatılıyor...');
  
  const fixes: Array<{model: string, expectedImage: string, actualImage: string}> = [];
  
  Object.entries(modelImageMapping).forEach(([modelName, expectedImage]) => {
    console.log(`\n📝 Kontrol ediliyor: ${modelName} -> ${expectedImage}`);
    
    if (checkImageExists(expectedImage)) {
      console.log(`✅ Resim mevcut: ${expectedImage}`);
    } else {
      console.log(`❌ Resim eksik: ${expectedImage}`);
      
      // Alternatif isimler dene
      const normalized = normalizeModelName(modelName);
      const alternatives = [
        `${normalized}.png`,
        `${normalized}.jpg`,
        `${normalized}.webp`,
        `${modelName.replace(/\s+/g, '')}.png`, // Boşluksuz
        `${modelName.replace(/\s+/g, '-')}.png`, // Tire ile
        `${modelName.replace(/\s+/g, '_')}.png`  // Alt tire ile
      ];
      
      let found = false;
      for (const alt of alternatives) {
        if (checkImageExists(alt)) {
          console.log(`🔄 Alternatif bulundu: ${alt}`);
          fixes.push({
            model: modelName,
            expectedImage: expectedImage,
            actualImage: alt
          });
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`⚠️ Hiç resim bulunamadı, fallback kullanılacak`);
        const fallback = fallbackMapping[modelName] || fallbackMapping.default;
        fixes.push({
          model: modelName,
          expectedImage: expectedImage, 
          actualImage: fallback
        });
      }
    }
  });
  
  // Sonuçları göster
  console.log('\n📊 DÜZELTME RAPORU:');
  console.log('==================');
  
  if (fixes.length === 0) {
    console.log('✅ Tüm model resimleri mevcut!');
  } else {
    console.log(`🔧 ${fixes.length} model için düzeltme gerekiyor:`);
    fixes.forEach(fix => {
      console.log(`📁 ${fix.model}: ${fix.expectedImage} -> ${fix.actualImage}`);
    });
    
    // Düzeltme scriptini oluştur
    generateCopyScript(fixes);
  }
  
  console.log('\n🎉 Script tamamlandı!');
}

// Dosya kopyalama scripti oluştur
function generateCopyScript(fixes: Array<{model: string, expectedImage: string, actualImage: string}>) {
  console.log('\n📝 Kopyalama scripti oluşturuluyor...');
  
  const fs = require('fs');
  const path = require('path');
  
  let copyCommands = '# Model resimleri düzeltme scripti\n\n';
  
  fixes.forEach(fix => {
    if (fix.actualImage !== fix.expectedImage && fix.actualImage !== fallbackMapping.default) {
      copyCommands += `# ${fix.model} için\n`;
      copyCommands += `copy "public\\ModelImage\\${fix.actualImage}" "public\\ModelImage\\${fix.expectedImage}"\n\n`;
    }
  });
  
  // Script dosyasını kaydet
  const scriptPath = path.join(__dirname, 'fix-model-images.bat');
  fs.writeFileSync(scriptPath, copyCommands);
  
  console.log(`💾 Script kaydedildi: ${scriptPath}`);
  console.log('🚀 Çalıştırmak için: npm run fix-model-images');
}

// Scripti çalıştır
if (require.main === module) {
  fixModelImages();
}

export { fixModelImages, modelImageMapping };
