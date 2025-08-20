import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Ana kategorileri oluştur
  const categories = [
    { id: 'cekici', name: 'Çekici' },
    { id: 'dorse', name: 'Dorse' },
    { id: 'kamyon', name: 'Kamyon & Kamyonet' },
    { id: 'karoser', name: 'Karoser & Üst Yapı' },
    { id: 'minibus', name: 'Minibüs & Midibüs' },
    { id: 'otobus', name: 'Otobüs' },
    { id: 'kurtarici', name: 'Oto Kurtarıcı & Taşıyıcı' },
    { id: 'romork', name: 'Römork' }
  ];

  console.log('📝 Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  // Vehicle types oluştur
  const vehicleTypes = [
    // Çekici alt kategorileri
    { id: 'cekici-4x2', name: '4x2 Çekici', category_id: 'cekici' },
    { id: 'cekici-6x2', name: '6x2 Çekici', category_id: 'cekici' },
    { id: 'cekici-6x4', name: '6x4 Çekici', category_id: 'cekici' },
    
    // Dorse alt kategorileri
    { id: 'dorse-kuruyuk', name: 'Kuru Yük Dorsesi', category_id: 'dorse' },
    { id: 'dorse-tenteli', name: 'Tenteli Dorse', category_id: 'dorse' },
    { id: 'dorse-frigofirik', name: 'Frigofirik Dorse', category_id: 'dorse' },
    
    // Kamyon alt kategorileri
    { id: 'kamyon-kamyonet', name: 'Kamyonet', category_id: 'kamyon' },
    { id: 'kamyon-orta', name: 'Orta Kamyon', category_id: 'kamyon' },
    { id: 'kamyon-agir', name: 'Ağır Kamyon', category_id: 'kamyon' },
    
    // Diğer kategoriler için temel vehicle types
    { id: 'karoser-genel', name: 'Karoser & Üst Yapı', category_id: 'karoser' },
    { id: 'minibus-genel', name: 'Minibüs & Midibüs', category_id: 'minibus' },
    { id: 'otobus-genel', name: 'Otobüs', category_id: 'otobus' },
    { id: 'kurtarici-genel', name: 'Oto Kurtarıcı & Taşıyıcı', category_id: 'kurtarici' },
    { id: 'romork-genel', name: 'Römork', category_id: 'romork' }
  ];

  console.log('🚗 Creating vehicle types...');
  for (const vehicleType of vehicleTypes) {
    await prisma.vehicle_types.upsert({
      where: { id: vehicleType.id },
      update: {},
      create: {
        id: vehicleType.id,
        name: vehicleType.name,
        category_id: vehicleType.category_id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created vehicle type: ${vehicleType.name}`);
  }

  // Örnek markalar oluştur
  const brands = [
    // Mercedes markaları
    { id: 'mercedes', name: 'Mercedes', vehicle_type_id: 'cekici-4x2' },
    { id: 'man', name: 'MAN', vehicle_type_id: 'cekici-4x2' },
    { id: 'volvo', name: 'Volvo', vehicle_type_id: 'cekici-4x2' },
    { id: 'scania', name: 'Scania', vehicle_type_id: 'cekici-4x2' },
    { id: 'daf', name: 'DAF', vehicle_type_id: 'cekici-4x2' },
    { id: 'iveco', name: 'Iveco', vehicle_type_id: 'cekici-4x2' },
    { id: 'ford', name: 'Ford', vehicle_type_id: 'kamyon-kamyonet' },
    { id: 'isuzu', name: 'Isuzu', vehicle_type_id: 'kamyon-kamyonet' },
    { id: 'mitsubishi', name: 'Mitsubishi', vehicle_type_id: 'kamyon-kamyonet' }
  ];

  console.log('🏷️ Creating brands...');
  for (const brand of brands) {
    await prisma.brands.upsert({
      where: { id: brand.id },
      update: {},
      create: {
        id: brand.id,
        name: brand.name,
        vehicle_type_id: brand.vehicle_type_id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created brand: ${brand.name}`);
  }

  // Örnek modeller oluştur
  const models = [
    { id: 'actros', name: 'Actros', brand_id: 'mercedes' },
    { id: 'arocs', name: 'Arocs', brand_id: 'mercedes' },
    { id: 'tgx', name: 'TGX', brand_id: 'man' },
    { id: 'tgs', name: 'TGS', brand_id: 'man' },
    { id: 'fh', name: 'FH', brand_id: 'volvo' },
    { id: 'fm', name: 'FM', brand_id: 'volvo' }
  ];

  console.log('🏎️ Creating models...');
  for (const model of models) {
    await prisma.models.upsert({
      where: { id: model.id },
      update: {},
      create: {
        id: model.id,
        name: model.name,
        brand_id: model.brand_id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created model: ${model.name}`);
  }

  // Örnek varyantlar oluştur
  const variants = [
    { id: 'actros-1845', name: '1845', model_id: 'actros' },
    { id: 'actros-1851', name: '1851', model_id: 'actros' },
    { id: 'tgx-18-440', name: '18.440', model_id: 'tgx' },
    { id: 'tgx-18-480', name: '18.480', model_id: 'tgx' }
  ];

  console.log('⚙️ Creating variants...');
  for (const variant of variants) {
    await prisma.variants.upsert({
      where: { id: variant.id },
      update: {},
      create: {
        id: variant.id,
        name: variant.name,
        model_id: variant.model_id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✅ Created variant: ${variant.name}');
  }

  // Cities oluştur
  const cities = [
    { id: 'istanbul', name: 'İstanbul' },
    { id: 'ankara', name: 'Ankara' },
    { id: 'izmir', name: 'İzmir' },
    { id: 'bursa', name: 'Bursa' },
    { id: 'antalya', name: 'Antalya' }
  ];

  console.log('🏙️ Creating cities...');
  for (const city of cities) {
    await prisma.cities.upsert({
      where: { id: city.id },
      update: {},
      create: {
        id: city.id,
        name: city.name,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created city: ${city.name}`);
  }

  // Districts oluştur
  const districts = [
    { id: 'kadikoy', name: 'Kadıköy', city_id: 'istanbul' },
    { id: 'besiktas', name: 'Beşiktaş', city_id: 'istanbul' },
    { id: 'cankaya', name: 'Çankaya', city_id: 'ankara' },
    { id: 'kecioren', name: 'Keçiören', city_id: 'ankara' },
    { id: 'konak', name: 'Konak', city_id: 'izmir' }
  ];

  console.log('🏘️ Creating districts...');
  for (const district of districts) {
    await prisma.districts.upsert({
      where: { id: district.id },
      update: {},
      create: {
        id: district.id,
        name: district.name,
        city_id: district.city_id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ Created district: ${district.name}`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
