const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDorseBrandImages() {
  console.log('🔧 Dorse marka resimlerini düzeltiliyor...\n');

  try {
    // Dorse vehicle_type_id'sini bul
    const dorseVehicleType = await prisma.vehicle_types.findFirst({
      where: { name: 'Dorse' }
    });

    if (!dorseVehicleType) {
      console.log('❌ Dorse kategorisi bulunamadı!');
      return;
    }

    console.log(`✅ Dorse kategorisi bulundu: ${dorseVehicleType.id}\n`);

    // Düzeltilmesi gereken markalar
    const fixes = [
      {
        name: 'Kuru Yük',
        currentImageUrl: '/ModelImage/Kuruyük.png',
        newImageUrl: '/ModelImage/Kuru-Yuk.png'
      },
      {
        name: 'Özel Amaçlı Dorseler', 
        currentImageUrl: '/ModelImage/Özel Amaçlı dorseler.png',
        newImageUrl: '/ModelImage/Ozel-Amacli-Dorseler.png'
      }
    ];

    for (const fix of fixes) {
      console.log(`🔍 ${fix.name} markasını arıyor...`);
      
      const brand = await prisma.brands.findFirst({
        where: {
          name: fix.name,
          vehicle_type_id: dorseVehicleType.id
        }
      });

      if (brand) {
        console.log(`   Mevcut resim: ${brand.image_url}`);
        console.log(`   Yeni resim: ${fix.newImageUrl}`);
        
        // Resim URL'ini güncelle
        await prisma.brands.update({
          where: { id: brand.id },
          data: { image_url: fix.newImageUrl }
        });
        
        console.log(`   ✅ ${fix.name} markasının resmi güncellendi!\n`);
      } else {
        console.log(`   ❌ ${fix.name} markası bulunamadı!\n`);
      }
    }

    // Güncellenmiş durumu kontrol et
    console.log('📊 Güncelleme sonrası durum:');
    const updatedBrands = await prisma.brands.findMany({
      where: {
        vehicle_type_id: dorseVehicleType.id,
        name: { in: fixes.map(f => f.name) }
      }
    });

    updatedBrands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name}`);
      console.log(`   Image URL: ${brand.image_url}\n`);
    });

    console.log('🎉 Dorse marka resimleri başarıyla düzeltildi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDorseBrandImages();
