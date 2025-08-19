const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });
    
    const targetBrands = ['Green Car', 'HFKanuni', 'Hino', 'Hyundai', 'International', 'Isuzu', 'Iveco'];
    
    for (const brandName of targetBrands) {
      const brand = await prisma.brands.findFirst({
        where: { 
          name: brandName,
          vehicle_type_id: vehicleType.id 
        }
      });
      
      if (brand) {
        const models = await prisma.models.findMany({
          where: { brand_id: brand.id },
          orderBy: { name: 'asc' }
        });
        
        console.log(`\n${brandName} (${models.length} model):`);
        for (const model of models) {
          const variants = await prisma.variants.findMany({
            where: { model_id: model.id },
            orderBy: { name: 'asc' }
          });
          console.log(`  - ${model.name} (${variants.length} varyant)`);
          if (variants.length > 0) {
            variants.forEach(variant => {
              console.log(`    * ${variant.name}`);
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingModels();
