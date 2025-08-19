const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingBrands() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });
    
    if (!vehicleType) {
      console.log('KAMYON & KAMYONET kategori bulunamadı');
      return;
    }
    
    console.log('Vehicle Type ID:', vehicleType.id);
    
    const brands = await prisma.brands.findMany({
      where: { vehicle_type_id: vehicleType.id },
      orderBy: { name: 'asc' }
    });
    
    console.log('\nMevcut KAMYON & KAMYONET brandları:');
    brands.forEach(brand => {
      console.log('- ' + brand.name);
    });
    
    // Check specifically for the brands mentioned by user
    const targetBrands = ['Green Car', 'HFKanuni', 'Hino', 'Hyundai', 'International', 'Isuzu', 'Iveco'];
    
    console.log('\nAranılan brandların durumu:');
    for (const brandName of targetBrands) {
      const brand = brands.find(b => b.name === brandName);
      if (brand) {
        console.log(`✓ ${brandName} - MEVCUT (ID: ${brand.id})`);
      } else {
        console.log(`✗ ${brandName} - BULUNAMADI`);
      }
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingBrands();
