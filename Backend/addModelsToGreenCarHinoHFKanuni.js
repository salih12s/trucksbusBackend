const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addModelsToExistingBrands() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    if (!vehicleType) {
      console.log('Kamyon & Kamyonet kategori bulunamadı');
      return;
    }

    // Green Car modelleri ekle
    console.log('Green Car modellerini ekliyorum...');
    const greenCarBrand = await prisma.brands.findFirst({
      where: { name: 'Green Car', vehicle_type_id: vehicleType.id }
    });

    if (greenCarBrand) {
      const greenCarModels = [
        { name: 'Cargo Maxi Plus', variants: ['Cargo Maxi Plus'] },
        { name: 'LSV Cargo', variants: ['LSV Cargo'] },
        { name: 'XL', variants: ['XL'] }
      ];

      for (const modelData of greenCarModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: greenCarBrand.id,
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

    // HFKanuni modelleri ekle
    console.log('\nHFKanuni modellerini ekliyorum...');
    const hfKanuniBrand = await prisma.brands.findFirst({
      where: { name: 'HFKanuni', vehicle_type_id: vehicleType.id }
    });

    if (hfKanuniBrand) {
      const hfKanuniModels = [
        { name: 'K Serisi', variants: ['K 970', 'K 971'] }
      ];

      for (const modelData of hfKanuniModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: hfKanuniBrand.id,
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

    // Hino modelleri ekle
    console.log('\nHino modellerini ekliyorum...');
    const hinoBrand = await prisma.brands.findFirst({
      where: { name: 'Hino', vehicle_type_id: vehicleType.id }
    });

    if (hinoBrand) {
      const hinoModels = [
        { name: '26260', variants: ['26260'] },
        { name: '26265', variants: ['26265'] },
        { name: '32260', variants: ['32260'] },
        { name: 'FB', variants: ['FB 110', 'FB 112'] }
      ];

      for (const modelData of hinoModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: hinoBrand.id,
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

    console.log('\nİlk grup modeller başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addModelsToExistingBrands();
