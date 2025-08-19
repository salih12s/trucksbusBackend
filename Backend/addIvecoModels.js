const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');
const prisma = new PrismaClient();

async function addIvecoModels() {
  try {
    const vehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Kamyon & Kamyonet' }
    });

    // Iveco modelleri ekle
    console.log('Iveco modellerini ekliyorum...');
    const ivecoBrand = await prisma.brands.findFirst({
      where: { name: 'Iveco', vehicle_type_id: vehicleType.id }
    });

    if (ivecoBrand) {
      const ivecoModels = [
        { 
          name: '35', 
          variants: [
            '35.10',
            '35.8',
            '35.9',
            '35 NC',
            '35 S',
            'C 11 Daily Şasi',
            'C 12 Daily Şasi',
            'C 13 Daily Şasi',
            'C 15 Daily Şasi',
            'C 16 Daily Şasi',
            'C 18 Daily Şasi',
            'C21'
          ] 
        },
        { name: '49', variants: ['49.10'] },
        { name: '50', variants: ['50C', '50.9', '50 NC'] },
        { name: '55', variants: ['S 17 Daily', 'S 18 Daily'] },
        { name: '65', variants: ['3750', '4350', '65.9', 'C 15'] },
        { 
          name: '70', 
          variants: [
            '12 C',
            '15 3750',
            '15 4100',
            '15 4350',
            '15 4750',
            '16 4350',
            '16 4750',
            '17 V',
            '18 3750'
          ] 
        },
        { name: '72', variants: ['150', '160', '170', '180'] },
        { name: '75', variants: ['75.12'] },
        { name: '80', variants: ['80.12'] },
        { name: '85', variants: ['85 - 12', '85 - 14'] },
        { name: '120', variants: ['120.14'] },
        { name: '250', variants: ['E 21', 'E 24', 'E 27'] },
        { name: '330', variants: ['26', '30', '35', '36', '42', '48'] },
        { 
          name: 'EuroCargo', 
          variants: [
            '85E13',
            '80EL16',
            '100E15',
            '100E18',
            '100E19',
            '120E18',
            '120E19',
            '120EL19',
            '120EL21',
            '130E15',
            '150E18',
            '150E21',
            '150E22P',
            '150E25D',
            '160E22',
            '160E24',
            '160E25',
            '160E25/P',
            '160E30',
            '160E32',
            '180E25',
            '180E28',
            '180E30',
            '180E32',
            '220E21',
            '250E21'
          ] 
        },
        { name: 'Stralis', variants: ['260 S 32'] },
        { name: 'S-Way', variants: ['570'] },
        { name: 'Trakker', variants: ['380', '420'] },
        { name: 'T-Way', variants: ['340', '360', '410', '450', '510'] }
      ];

      for (const modelData of ivecoModels) {
        const model = await prisma.models.create({
          data: {
            id: ulid(),
            name: modelData.name,
            brand_id: ivecoBrand.id,
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

    console.log('\nIveco modelleri başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addIvecoModels();
