const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCekiciVehicleType() {
  try {
    console.log('🔍 Çekici Vehicle Types:');
    const vehicleTypes = await prisma.vehicle_types.findMany({
      where: { 
        name: { contains: 'Çekici' }
      },
      select: {
        id: true,
        name: true,
        category_id: true
      }
    });
    console.table(vehicleTypes);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCekiciVehicleType();
