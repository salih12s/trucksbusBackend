const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDorseData() {
  try {
    console.log('🚛 Dorse Vehicle Type ID: cme633w8v0001981ksnpl6dj5');
    
    console.log('\n🏷️ Dorse Brands:');
    const dorseBrands = await prisma.brands.findMany({
      where: {
        vehicle_type_id: 'cme633w8v0001981ksnpl6dj5'
      },
      select: {
        id: true,
        name: true
      }
    });
    console.table(dorseBrands);

    console.log('\n📱 Dorse Models:');
    for (const brand of dorseBrands) {
      console.log(`\n--- ${brand.name} Modelleri ---`);
      const models = await prisma.models.findMany({
        where: {
          brand_id: brand.id
        },
        select: {
          id: true,
          name: true,
          brand_id: true
        }
      });
      console.table(models);

      // Her model için varyantları da göster
      for (const model of models) {
        console.log(`\n    ${model.name} Varyantları:`);
        const variants = await prisma.variants.findMany({
          where: {
            model_id: model.id
          },
          select: {
            id: true,
            name: true,
            model_id: true
          }
        });
        console.table(variants);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDorseData();
