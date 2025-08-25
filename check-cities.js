const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCitiesAndDistricts() {
  try {
    const citiesCount = await prisma.cities.count();
    const districtsCount = await prisma.districts.count();
    
    console.log('Cities count:', citiesCount);
    console.log('Districts count:', districtsCount);
    
    if (citiesCount === 0) {
      console.log('❌ Cities tablosu boş!');
    } else {
      const sampleCities = await prisma.cities.findMany({ take: 5 });
      console.log('📍 İlk 5 şehir:', sampleCities.map(c => ({ id: c.id, name: c.name, plate_code: c.plate_code })));
    }
    
    if (districtsCount === 0) {
      console.log('❌ Districts tablosu boş!');
    } else {
      const sampleDistricts = await prisma.districts.findMany({ 
        take: 5,
        include: { cities: true }
      });
      console.log('🏘️ İlk 5 ilçe:', sampleDistricts.map(d => ({ id: d.id, name: d.name, city: d.cities.name })));
    }

    // İlanları kontrol et
    const listingsWithLocation = await prisma.listings.count({
      where: {
        OR: [
          { city_id: { not: null } },
          { district_id: { not: null } }
        ]
      }
    });
    console.log('📋 Konumu olan ilan sayısı:', listingsWithLocation);

    const totalListings = await prisma.listings.count();
    console.log('📋 Toplam ilan sayısı:', totalListings);
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCitiesAndDistricts();
