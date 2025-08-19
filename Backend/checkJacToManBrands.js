const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTargetBrands() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });
    
    const targetBrands = ['JAC', 'Junda', 'Kia', 'Kuba', 'Lada', 'MAN'];
    
    console.log('Aranılan brandların durumu:');
    for (const brandName of targetBrands) {
      const brand = await prisma.brands.findFirst({
        where: { 
          name: brandName,
          vehicle_type_id: vehicleType.id 
        }
      });
      
      if (brand) {
        console.log(`✓ ${brandName} - MEVCUT (ID: ${brand.id})`);
        
        // Check existing models
        const models = await prisma.models.findMany({
          where: { brand_id: brand.id }
        });
        
        if (models.length > 0) {
          console.log(`  -> ${models.length} model mevcut`);
        } else {
          console.log(`  -> Model yok`);
        }
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

checkTargetBrands();
