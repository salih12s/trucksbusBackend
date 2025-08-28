import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixModelImages() {
  console.log('🔧 Model resimlerini veritabanında düzeltme başlatılıyor...');

  try {
    // 1. Kuruyük modellerini düzelt
    console.log('\n📋 Kuruyük modelleri düzeltiliyor...');
    const kuruyukUpdate = await prisma.model.updateMany({
      where: {
        OR: [
          { name: { contains: 'Kuruyük', mode: 'insensitive' } },
          { name: { contains: 'Kuruyuk', mode: 'insensitive' } },
          { name: { contains: 'kuruyük', mode: 'insensitive' } },
          { name: { contains: 'kuruyuk', mode: 'insensitive' } }
        ]
      },
      data: {
        image: '/ModelImage/Kuruyük.png'
      }
    });
    console.log(`✅ ${kuruyukUpdate.count} adet Kuruyük modeli güncellendi`);

    // 2. Özel Amaçlı Dorseler modellerini düzelt
    console.log('\n📋 Özel Amaçlı Dorseler modelleri düzeltiliyor...');
    const ozelUpdate = await prisma.model.updateMany({
      where: {
        OR: [
          { name: { contains: 'Özel Amaçlı dorseler', mode: 'insensitive' } },
          { name: { contains: 'Özel amaçlı dorseler', mode: 'insensitive' } },
          { name: { contains: 'Özel Amaçlı Dorseler', mode: 'insensitive' } },
          { name: { contains: 'ÖZEL AMAÇLI DORSELER', mode: 'insensitive' } },
          { name: { equals: 'Özel Amaçlı dorseler' } }
        ]
      },
      data: {
        image: '/ModelImage/Ozel-Amacli-Dorseler.png'
      }
    });
    console.log(`✅ ${ozelUpdate.count} adet Özel Amaçlı Dorseler modeli güncellendi`);

    // 3. Irizar modellerini düzelt
    console.log('\n📋 Irizar modelleri düzeltiliyor...');
    const irizarUpdate = await prisma.model.updateMany({
      where: {
        OR: [
          { name: { contains: 'Irizar', mode: 'insensitive' } },
          { name: { contains: 'IRIZAR', mode: 'insensitive' } },
          { name: { contains: 'irizar', mode: 'insensitive' } },
          { name: { contains: 'Irızar', mode: 'insensitive' } }
        ]
      },
      data: {
        image: '/ModelImage/Irizar.png'
      }
    });
    console.log(`✅ ${irizarUpdate.count} adet Irizar modeli güncellendi`);

    console.log('\n🎉 Tüm model resimleri başarıyla güncellendi!');
    console.log(`📊 Toplam güncelleme: ${kuruyukUpdate.count + ozelUpdate.count + irizarUpdate.count} model`);

    // Güncellenen modelleri kontrol et
    console.log('\n🔍 Güncellenen modeller kontrol ediliyor...');
    
    const kuruyukModels = await prisma.model.findMany({
      where: {
        name: { contains: 'Kuruyük', mode: 'insensitive' }
      },
      select: { id: true, name: true, image: true }
    });
    
    const ozelModels = await prisma.model.findMany({
      where: {
        name: { contains: 'Özel Amaçlı', mode: 'insensitive' }
      },
      select: { id: true, name: true, image: true }
    });
    
    const irizarModels = await prisma.model.findMany({
      where: {
        name: { contains: 'Irizar', mode: 'insensitive' }
      },
      select: { id: true, name: true, image: true }
    });

    console.log('\n📋 Kuruyük Modelleri:');
    kuruyukModels.forEach(model => {
      console.log(`  - ${model.name}: ${model.image}`);
    });

    console.log('\n📋 Özel Amaçlı Modelleri:');
    ozelModels.forEach(model => {
      console.log(`  - ${model.name}: ${model.image}`);
    });

    console.log('\n📋 Irizar Modelleri:');
    irizarModels.forEach(model => {
      console.log(`  - ${model.name}: ${model.image}`);
    });

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Veritabanı bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
fixModelImages();
