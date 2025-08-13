const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCategoryImages() {
  try {
    console.log('🖼️ Updating category images...');
    
    // Ana kategorilerin resim URL'lerini güncelle
    const categoryImages = [
      { name: 'Çekici', image_url: '/CategoryImage/Çekici.png' },
      { name: 'Kamyon & Kamyonet', image_url: '/CategoryImage/KamyonKamyonet.png' },
      { name: 'Otobüs', image_url: '/CategoryImage/Otobüs.png' },
      { name: 'Minibüs & Midibüs', image_url: '/CategoryImage/MinibüsMidibüs.png' },
      { name: 'Dorse', image_url: '/CategoryImage/Dorse.png' },
      { name: 'Römork', image_url: '/CategoryImage/Römork.png' },
      { name: 'Karoser & Üst Yapı', image_url: '/CategoryImage/Karoser.png' },
      { name: 'Oto Kurtarıcı & Taşıyıcı', image_url: '/CategoryImage/Kurtarıcı.png' }
    ];
    
    for (const categoryData of categoryImages) {
      const result = await prisma.category.updateMany({
        where: {
          name: categoryData.name
        },
        data: {
          image_url: categoryData.image_url
        }
      });
      
      console.log(`✅ Updated ${categoryData.name}: ${result.count} records`);
    }
    
    // Güncellenen kategorileri kontrol et
    const updatedCategories = await prisma.category.findMany({
      where: {
        image_url: { not: null }
      },
      select: {
        id: true,
        name: true,
        image_url: true
      }
    });
    
    console.log('\n📋 Categories with images:');
    updatedCategories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryImages();
