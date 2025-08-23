const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVehicleTypes() {
  try {
    const vehicleTypes = await prisma.vehicle_types.findMany({
      select: {
        id: true,
        name: true,
        category_id: true,
        image_url: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\n� Veritabanındaki Vehicle Types:');
    console.log('=====================================');
    
    if (vehicleTypes.length === 0) {
      console.log('❌ Hiç vehicle type bulunamadı!');
    } else {
      vehicleTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.name}`);
        console.log(`   - ID: ${type.id}`);
        console.log(`   - Category ID: ${type.category_id}`);
        if (type.image_url) {
          console.log(`   - Image: ${type.image_url}`);
        }
        console.log('');
      });
    }
    
    console.log(`\n📈 Toplam vehicle type sayısı: ${vehicleTypes.length}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicleTypes();
