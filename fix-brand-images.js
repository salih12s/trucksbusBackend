const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const imageFixMap = {
  // Türkçe karakterli dosya isimleri düzeltmeleri
  '/ModelImage/Scanıa.png': '/ModelImage/Scania.png',
  '/ModelImage/Avıa.png': '/ModelImage/Avia.png',
  '/ModelImage/MUSATTİ.png': '/ModelImage/Musatti.png',
  '/ModelImage/Türkkar.png': '/ModelImage/Turkkar.png',
  
  // Diğer dosya isim düzeltmeleri
  '/ModelImage/Centro.png': '/ModelImage/Cenntro.png',
  '/ModelImage/Axiam.png': '/ModelImage/Aixam.png',
};

async function fixBrandImages() {
  try {
    console.log('🔧 Brand image URL\'leri düzeltiliyor...');
    
    for (const [oldUrl, newUrl] of Object.entries(imageFixMap)) {
      console.log(`🔄 Değiştiriliyor: ${oldUrl} → ${newUrl}`);
      
      const result = await prisma.brands.updateMany({
        where: {
          image_url: oldUrl
        },
        data: {
          image_url: newUrl
        }
      });
      
      console.log(`✅ ${result.count} brand güncellendi`);
    }
    
    // Güncellenmiş brand'ları kontrol et
    console.log('\n📋 Güncellenmiş brandlar:');
    const updatedBrands = await prisma.brands.findMany({
      where: {
        image_url: {
          in: Object.values(imageFixMap)
        }
      },
      select: {
        name: true,
        image_url: true
      }
    });
    
    updatedBrands.forEach(brand => {
      console.log(`- ${brand.name}: ${brand.image_url}`);
    });
    
    console.log('\n🎉 Brand image URL düzeltmeleri tamamlandı!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrandImages();
