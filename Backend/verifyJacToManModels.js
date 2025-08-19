const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyJacToManModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });
    
    const targetBrands = ['JAC', 'Junda', 'Kia', 'Kuba', 'Lada', 'MAN'];
    
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
          if (variants.length <= 5) {
            variants.forEach(variant => {
              console.log(`    * ${variant.name}`);
            });
          } else {
            // Show first 3 and last 2 for long lists
            variants.slice(0, 3).forEach(variant => {
              console.log(`    * ${variant.name}`);
            });
            console.log(`    ... (${variants.length - 5} tane daha) ...`);
            variants.slice(-2).forEach(variant => {
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

verifyJacToManModels();
