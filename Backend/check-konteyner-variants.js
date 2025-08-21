const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVariants() {
  console.log('🔍 Konteyner Taşıyıcı & Şasi Gr. için tüm veriler:');
  
  try {
    // 1. Category kontrol
    const category = await prisma.category.findFirst({
      where: { name: 'Dorse' }
    });
    console.log('📂 Dorse Category:', category);
    
    // 2. VehicleType kontrol
    const vehicleType = await prisma.vehicleType.findFirst({
      where: { 
        name: 'Konteyner Taşıyıcı & Şasi Gr.',
        categoryId: category?.id 
      }
    });
    console.log('🚛 Vehicle Type:', vehicleType);
    
    // 3. Brand kontrol
    const brands = await prisma.brand.findMany({
      where: { vehicleTypeId: vehicleType?.id }
    });
    console.log('🏷️ Brands:', brands);
    
    // 4. Her brand için model kontrol
    for (const brand of brands) {
      const models = await prisma.model.findMany({
        where: { brandId: brand.id }
      });
      console.log(`📋 ${brand.name} Models:`, models);
      
      // 5. Her model için variant kontrol
      for (const model of models) {
        const variants = await prisma.variant.findMany({
          where: { modelId: model.id }
        });
        console.log(`🎯 ${brand.name} -> ${model.name} Variants:`, variants);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
