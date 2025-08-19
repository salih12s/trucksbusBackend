const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addIsuzuModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    // Isuzu modelleri ekle
    console.log('Isuzu modellerini ekliyorum...');
    const isuzuBrand = await prisma.brands.findFirst({
      where: { name: 'Isuzu', vehicle_type_id: vehicleType.id }
    });

    if (isuzuBrand) {
      const isuzuModels = [
        { 
          name: 'D-Max', 
          variants: [
            '2.5 4x2 HT',
            '2.5 4x2 LTD',
            'Çift Kabin 4x2',
            'Çift Kabin 4x2 Limited',
            'Tek Kabin 4x2'
          ] 
        },
        { name: 'KB', variants: ['Çift Kabin', 'Tek Kabin'] },
        { name: 'KS', variants: ['KS'] },
        { 
          name: 'NKR', 
          variants: [
            '5.0',
            '5.5 E 04',
            'Low',
            'NKR',
            'Wide',
            'Wide LX'
          ] 
        },
        { name: 'NLR', variants: ['Long', 'NLR'] },
        { name: 'NNR', variants: ['Long', 'NNR'] },
        { 
          name: 'NPR', 
          variants: [
            '3D',
            '8',
            '8 Long',
            '10',
            '10 Long',
            '10 Xlong',
            '75 E5',
            'HP',
            'Long',
            'NPR'
          ] 
        },
        { name: 'NQR', variants: ['3D', '70P'] },
        { name: 'N-WIDE', variants: ['N-Wide', 'N-Wide Long'] },
        { 
          name: 'TF', 
          variants: [
            'Tek Kabin 4x2',
            'Çift Kabin 4x2',
            'Çift Kabin 4x4'
          ] 
        },
        { 
          name: 'TORA', 
          variants: [
            'Tora',
            'Tora Long',
            'Tora 3D'
          ] 
        }
      ];

      for (const modelData of isuzuModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: isuzuBrand.id,
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

    console.log('\nIsuzu modelleri başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addIsuzuModels();
