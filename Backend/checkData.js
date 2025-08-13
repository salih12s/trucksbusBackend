const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...');
    
    // Kategorileri kontrol et
    const categories = await prisma.category.findMany({
      include: {
        vehicle_types: {
          include: {
            brands: {
              include: {
                models: {
                  include: {
                    variants: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log('\n📋 Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
      console.log(`    Vehicle Types: ${cat.vehicle_types?.length || 0}`);
      cat.vehicle_types?.forEach(vt => {
        console.log(`      - ${vt.name} (${vt.brands?.length || 0} brands)`);
      });
    });
    
    // Toplam sayılar
    const vehicleTypesCount = await prisma.vehicle_types.count();
    const brandsCount = await prisma.brands.count();
    const modelsCount = await prisma.models.count();
    const variantsCount = await prisma.variants.count();
    
    console.log('\n📊 Database Statistics:');
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Vehicle Types: ${vehicleTypesCount}`);
    console.log(`  Brands: ${brandsCount}`);
    console.log(`  Models: ${modelsCount}`);
    console.log(`  Variants: ${variantsCount}`);
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
