const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVehicleTypes() {
  try {
    console.log('🔍 Checking vehicle types...');
    const vehicleTypes = await prisma.vehicle_types.findMany();
    console.log('Found vehicle types:');
    vehicleTypes.forEach(vt => {
      console.log(`- ID: ${vt.id}, Name: ${vt.name}, Category: ${vt.category_id}`);
    });
    
    // Check if Frigofirik exists
    const frigofirik = await prisma.vehicle_types.findFirst({
      where: { name: { contains: 'Frigofirik', mode: 'insensitive' } }
    });
    
    if (frigofirik) {
      console.log('✅ Frigofirik vehicle type exists:', frigofirik);
    } else {
      console.log('❌ Frigofirik vehicle type NOT found');
      
      // Add Frigofirik vehicle type
      const newFrigofirik = await prisma.vehicle_types.create({
        data: {
          id: 'vehicle-type-frigofirik-001',
          name: 'Frigofirik',
          category_id: 'vehicle-category-001',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created Frigofirik vehicle type:', newFrigofirik);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicleTypes();
