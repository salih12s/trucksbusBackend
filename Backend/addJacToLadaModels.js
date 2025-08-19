const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addJacToLadaModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    // JAC modelleri ekle
    console.log('JAC modellerini ekliyorum...');
    const jacBrand = await prisma.brands.findFirst({
      where: { name: 'JAC', vehicle_type_id: vehicleType.id }
    });

    if (jacBrand) {
      const jacModels = [
        { 
          name: 'HFC', 
          variants: [
            '1020',
            '1020K',
            '1040',
            '1045',
            '1048',
            '1061',
            '1063',
            '1083',
            '3045K'
          ] 
        }
      ];

      for (const modelData of jacModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: jacBrand.id,
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

    // Junda modelleri ekle
    console.log('\nJunda modellerini ekliyorum...');
    const jundaBrand = await prisma.brands.findFirst({
      where: { name: 'Junda', vehicle_type_id: vehicleType.id }
    });

    if (jundaBrand) {
      const jundaModels = [
        { name: '1021', variants: ['1021'] }
      ];

      for (const modelData of jundaModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: jundaBrand.id,
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

    // Kia modelleri ekle
    console.log('\nKia modellerini ekliyorum...');
    const kiaBrand = await prisma.brands.findFirst({
      where: { name: 'Kia', vehicle_type_id: vehicleType.id }
    });

    if (kiaBrand) {
      const kiaModels = [
        { name: 'Asia', variants: ['Towner'] },
        { 
          name: 'Bongo', 
          variants: [
            '3000',
            'K2500 DLX',
            'K2700 DLX',
            'K2700 II DLX',
            'K2900',
            'W/BOX'
          ] 
        },
        { name: 'Cerez', variants: ['2200', '2400'] },
        { 
          name: 'K', 
          variants: [
            '2400',
            '2500 TCI',
            '2500 TD',
            '3000S',
            '3000S DLX',
            '3500S',
            '3600S'
          ] 
        }
      ];

      for (const modelData of kiaModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: kiaBrand.id,
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

    // Kuba modelleri ekle
    console.log('\nKuba modellerini ekliyorum...');
    const kubaBrand = await prisma.brands.findFirst({
      where: { name: 'Kuba', vehicle_type_id: vehicleType.id }
    });

    if (kubaBrand) {
      const kubaModels = [
        { name: 'e-Kamyonet', variants: ['e-Kamyonet'] }
      ];

      for (const modelData of kubaModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: kubaBrand.id,
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

    // Lada modelleri ekle
    console.log('\nLada modellerini ekliyorum...');
    const ladaBrand = await prisma.brands.findFirst({
      where: { name: 'Lada', vehicle_type_id: vehicleType.id }
    });

    if (ladaBrand) {
      const ladaModels = [
        { name: '1.6', variants: ['1.6'] }
      ];

      for (const modelData of ladaModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: ladaBrand.id,
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

    console.log('\nJAC, Junda, Kia, Kuba, Lada modelleri başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addJacToLadaModels();
