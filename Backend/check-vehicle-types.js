const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVehicleTypes() {
  try {
    console.log('🔍 Vehicle Types listesi:');
    
    const vehicleTypes = await prisma.vehicle_types.findMany({
      orderBy: { name: 'asc' }
    });
    
    vehicleTypes.forEach((vt, index) => {
      console.log(`${index + 1}. ID: ${vt.id} - Name: ${vt.name}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicleTypes();
