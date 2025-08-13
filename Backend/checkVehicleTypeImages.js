const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVehicleTypeImages() {
  try {
    console.log('🔍 Checking vehicle type images...');
    
    const vehicleTypes = await prisma.vehicle_types.findMany({
      select: {
        id: true,
        name: true,
        image_url: true,
        category_id: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('\n🚗 Vehicle Types:');
    vehicleTypes.forEach(vt => {
      console.log(`  - ${vt.name}`);
      console.log(`    ID: ${vt.id}`);
      console.log(`    Category: ${vt.category_id}`);
      console.log(`    Image URL: ${vt.image_url || 'NOT SET'}`);
      console.log('');
    });
    
    console.log(`\n📊 Total vehicle types: ${vehicleTypes.length}`);
    console.log(`📊 With images: ${vehicleTypes.filter(vt => vt.image_url).length}`);
    console.log(`📊 Without images: ${vehicleTypes.filter(vt => !vt.image_url).length}`);
    
  } catch (error) {
    console.error('❌ Error checking vehicle type images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicleTypeImages();
