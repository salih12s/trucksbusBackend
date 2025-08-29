const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDorseBrands() {
  try {
    const dorseVehicleTypeId = 'cme633w8v0001981ksnpl6dj5'; // Dorse
    
    console.log('🔍 Dorse kategorisindeki markalar:');
    
    const dorseBrands = await prisma.brands.findMany({
      where: {
        vehicle_type_id: dorseVehicleTypeId
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n📊 Toplam ${dorseBrands.length} dorse markası bulundu:\n`);
    
    dorseBrands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (ID: ${brand.id})`);
      console.log(`   Image URL: ${brand.image_url || 'YOK'}`);
      console.log('   ---');
    });
    
    // Resmi olmayan markaları özel olarak listele
    const brandsWithoutImages = dorseBrands.filter(b => !b.image_url || b.image_url.trim() === '');
    
    console.log(`\n❌ Resmi olmayan markalar (${brandsWithoutImages.length}):`);
    brandsWithoutImages.forEach(brand => {
      console.log(`- ${brand.name} (ID: ${brand.id})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDorseBrands();
