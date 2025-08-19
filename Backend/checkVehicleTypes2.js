const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVehicleTypes() {
  try {
    const vehicleTypes = await prisma.vehicle_types.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('Mevcut vehicle types:');
    vehicleTypes.forEach(vt => {
      console.log(`- ${vt.name} (ID: ${vt.id})`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicleTypes();
