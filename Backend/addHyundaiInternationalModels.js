const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addHyundaiInternationalModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    // Hyundai modelleri ekle
    console.log('Hyundai modellerini ekliyorum...');
    const hyundaiBrand = await prisma.brands.findFirst({
      where: { name: 'Hyundai', vehicle_type_id: vehicleType.id }
    });

    if (hyundaiBrand) {
      const hyundaiModels = [
        { name: 'H', variants: ['100', '350', 'Porter II'] },
        { name: 'HD', variants: ['35', '72-77'] },
        { name: 'Starex Kamyonet', variants: ['Starex Kamyonet'] }
      ];

      for (const modelData of hyundaiModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: hyundaiBrand.id,
            updated_at: new Date()
          }
        });

        for (const variantName of modelData.variants) {
          await prisma.variants.create({
            data: {
              id: ulid(),
              name: variantName,
              model_id: model.id,
              updated_at: new Date()
            }
          });
        }
        console.log(`  ✓ ${modelData.name} (${modelData.variants.length} varyant)`);
      }
    }

    // International modelleri ekle
    console.log('\nInternational modellerini ekliyorum...');
    const internationalBrand = await prisma.brands.findFirst({
      where: { name: 'International', vehicle_type_id: vehicleType.id }
    });

    if (internationalBrand) {
      const internationalModels = [
        { name: 'Enter TOE 1800', variants: ['Enter TOE 1800'] },
        { name: 'Enter TOE 1830', variants: ['Enter TOE 1830'] },
        { name: 'Enter TOE 1860', variants: ['Enter TOE 1860'] }
      ];

      for (const modelData of internationalModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: internationalBrand.id,
            updated_at: new Date()
          }
        });

        for (const variantName of modelData.variants) {
          await prisma.variants.create({
            data: {
              id: ulid(),
              name: variantName,
              model_id: model.id,
              updated_at: new Date()
            }
          });
        }
        console.log(`  ✓ ${modelData.name} (${modelData.variants.length} varyant)`);
      }
    }

    console.log('\nHyundai ve International modelleri başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHyundaiInternationalModels();
