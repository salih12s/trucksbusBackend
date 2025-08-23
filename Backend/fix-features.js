// Database'deki bozuk features verilerini düzelt
const { PrismaClient } = require('@prisma/client');

async function fixFeatures() {
  const prisma = new PrismaClient();
  
  try {
    // Önce "[object Object]" değerlerini temizle
    console.log('Cleaning up broken features data...');
    
    const result = await prisma.listings.updateMany({
      where: {
        features: {
          equals: "[object Object]"
        }
      },
      data: {
        features: null
      }
    });
    
    console.log(`Cleaned up ${result.count} records with "[object Object]"`);
    
    // Şimdi test verileri için örnek features ekle
    console.log('\nAdding sample features data...');
    
    const sampleFeatures = [
      // Minibüs features
      {
        "abs": true,
        "esp": true,
        "klima": true,
        "hidrolik": false,
        "geri_vites_kamerasi": true
      },
      // Kamyon features  
      {
        "abs": true,
        "esp": false,
        "klima": true,
        "hidrolik": true,
        "geri_vites_kamerasi": false
      },
      // Çekici features
      {
        "abs": true,
        "esp": true,
        "klima": true,
        "retarder": true,
        "geri_vites_kamerasi": true
      },
      // Otobüs features
      {
        "abs": true,
        "esp": true,
        "klima": true,
        "koltuk_sayisi": "40",
        "engelli_erisilebilir": true
      }
    ];
    
    // İlk birkaç listing'e örnek features ekle
    const listings = await prisma.listings.findMany({
      take: 4,
      select: { id: true, title: true }
    });
    
    for (let i = 0; i < Math.min(listings.length, sampleFeatures.length); i++) {
      await prisma.listings.update({
        where: { id: listings[i].id },
        data: {
          features: JSON.stringify(sampleFeatures[i])
        }
      });
      
      console.log(`Updated ${listings[i].title} with sample features`);
    }
    
    console.log('\nFeatures data fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFeatures();
