const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategoriesAndVehicleTypes() {
  try {
    console.log('🔍 Categories:');
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true
      }
    });
    console.table(categories);

    console.log('\n🚛 Vehicle Types:');
    const vehicleTypes = await prisma.vehicle_types.findMany({
      select: {
        id: true,
        name: true,
        category_id: true
      }
    });
    console.table(vehicleTypes);

    console.log('\n🏷️ Brands:');
    const brands = await prisma.brands.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        vehicle_type_id: true
      }
    });
    console.table(brands);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoriesAndVehicleTypes();
