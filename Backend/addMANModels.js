const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addMANModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    // MAN modelleri ekle
    console.log('MAN modellerini ekliyorum...');
    const manBrand = await prisma.brands.findFirst({
      where: { name: 'MAN', vehicle_type_id: vehicleType.id }
    });

    if (manBrand) {
      const manModels = [
        { 
          name: '12', 
          variants: ['12.153', '12.160', '12.163'] 
        },
        { 
          name: '15', 
          variants: ['15.168'] 
        },
        { 
          name: '18', 
          variants: [
            '18.290 (4x4)',
            '18.430',
            '18.220 FAX (4x4) Yataksız',
            '18.220 HOCL Şase',
            '18.230 HOCL Şase',
            '18.410',
            '18.430',
            '18.480'
          ] 
        },
        { 
          name: '19', 
          variants: [
            '19.270 F (4x2) Yataksız',
            '19.270 FLT (4x2) Yataklı',
            '19.270 FS (4x2) Yataklı',
            '19.281',
            '19.292',
            '19.321',
            '19.350 (4x2)',
            '19.372',
            '19.422',
            '19.463',
            '19.463 Yataklı'
          ] 
        },
        { 
          name: '20', 
          variants: ['20.190'] 
        },
        { 
          name: '22', 
          variants: ['22.190', '22.321'] 
        },
        { 
          name: '25', 
          variants: ['25.270 FN (6X2)', '25.372'] 
        },
        { 
          name: '26', 
          variants: [
            '26.230',
            '26.270',
            '26.290',
            '26.230 Yataklı',
            '26.240',
            '26.270',
            '26.270 DFK/TM Yataksız (6x4)',
            '26.280 Yataklı',
            '26.280 Yataksız (6x4)',
            '26.281',
            '26.321',
            '26.350 (6x2-2)',
            '26.350 (6x4)'
          ] 
        },
        { 
          name: '28', 
          variants: [
            '28.260 HOCL Şase',
            '28.310 HOCL Şase',
            '28.350 (6x2-2)'
          ] 
        },
        { 
          name: '32', 
          variants: ['32.240', '32.270', '32.310', '32.360'] 
        },
        { 
          name: '33', 
          variants: [
            '33.350 (6x4)',
            '33.372 DF (6x4) Yataksız',
            '33.372 DFK/TM (6x4) Yataksız',
            '33.372 DFS (6x4) Yataklı',
            '33.372 DFS (6x4) Yataksız',
            '33.410 (6x4)'
          ] 
        },
        { 
          name: '41', 
          variants: [
            '41.423 VFC (8x4)',
            '41.423 VFK (8x4)'
          ] 
        },
        { 
          name: '520 HN', 
          variants: ['520 HN'] 
        },
        { 
          name: 'TGA', 
          variants: [
            '33.360',
            '39.390',
            '40.480',
            '41.360',
            '41.480'
          ] 
        },
        { 
          name: 'TGE', 
          variants: [
            '3.140',
            '3.180',
            '5.140',
            '5.160',
            '5.180',
            '6.180'
          ] 
        },
        { 
          name: 'TGL', 
          variants: [
            '8.150',
            '8.180',
            '12.180',
            '12.190',
            '12.220',
            '12.250'
          ] 
        },
        { 
          name: 'TGM', 
          variants: ['15.250'] 
        },
        { 
          name: 'TGS', 
          variants: [
            '26.320',
            '26.400',
            '32.360',
            '33.360',
            '33.400',
            '33.420',
            '33.430',
            '33.440',
            '33.510',
            '41.360',
            '41.400',
            '41.420',
            '41.430',
            '41.440',
            '41.480',
            '41.500',
            '41.510',
            '41.520',
            '41.540'
          ] 
        }
      ];

      for (const modelData of manModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: manBrand.id,
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

    console.log('\nMAN modelleri başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMANModels();
