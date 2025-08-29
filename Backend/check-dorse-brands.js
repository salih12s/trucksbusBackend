const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/ilanSitesi"
    }
  }
});

async function checkDorseCategories() {
  try {
    const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDorseBrands() {
  try {
    console.log('🔍 Checking dorse category brands...
');

    // First get the dorse category ID
    const dorseCategory = await prisma.categories.findFirst({
      where: {
        name: {
          contains: 'Dorse',
          mode: 'insensitive'
        }
      }
    });

    if (!dorseCategory) {
      console.log('❌ Dorse category not found');
      return;
    }

    console.log('📂 Found dorse category:', dorseCategory.name, '(ID:', dorseCategory.id + ')');

    // Get all brands in dorse category
    const dorseBrands = await prisma.brands.findMany({
      where: {
        category_id: dorseCategory.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('
📊 Dorse brands found:', dorseBrands.length);
    console.log('═'.repeat(60));

    dorseBrands.forEach((brand, index) => {
      const hasImage = brand.image_url ? '✅' : '❌';
      console.log(`${index + 1}. ${brand.name}`);
      console.log(`   ID: ${brand.id}`);
      console.log(`   Image: ${hasImage} ${brand.image_url || 'NO IMAGE'}`);
      console.log(`   Created: ${brand.created_at}`);
      console.log('-'.repeat(50));
    });

    // Check specifically for problem brands
    const problemBrands = dorseBrands.filter(brand => 
      !brand.image_url || 
      brand.image_url.includes('undefined') || 
      brand.image_url === ''
    );

    if (problemBrands.length > 0) {
      console.log('
🚨 PROBLEM BRANDS (No image or invalid image URL):');
      problemBrands.forEach(brand => {
        console.log(`- ${brand.name} (ID: ${brand.id}) - Image: "${brand.image_url}"`);
      });
    } else {
      console.log('
✅ All dorse brands have valid image URLs');
    }

  } catch (error) {
    console.error('❌ Error checking dorse brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDorseBrands();
    
    // Dorse kategorilerini bul
    const categories = await prisma.categories.findMany({
      where: {
        name: {
          contains: 'dorse',
          mode: 'insensitive'
        }
      }
    });
    console.log('📂 Dorse kategorileri:', categories);
    
    // FRIGOFIRIK ve SILOBAS markalarını bul
    const brands = await prisma.brands.findMany({
      where: {
        OR: [
          { name: { contains: 'FRIGOFIRIK', mode: 'insensitive' } },
          { name: { contains: 'SILOBAS', mode: 'insensitive' } },
          { name: { contains: 'FRIGOR', mode: 'insensitive' } },
          { name: { contains: 'SILO', mode: 'insensitive' } }
        ]
      }
    });
    console.log('🏷️ FRIGOFIRIK/SILOBAS markaları:', brands);
    
    // Tüm dorse kategorisindeki markaları kontrol et
    if (categories.length > 0) {
      const dorseCategory = categories[0];
      const dorseBrands = await prisma.brands.findMany({
        where: {
          category_id: dorseCategory.id
        }
      });
      console.log('🚛 Dorse kategorisindeki tüm markalar:', dorseBrands);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDorseCategories();
