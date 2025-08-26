const { PrismaClient } = require('@prisma/client');

// Railway database URL'sini doğrudan kullan
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:IGLVdvErlrDmxWfasprOJPLnxSKaVMTp@ballast.proxy.rlwy.net:19163/railway"
    }
  }
});

async function checkCitiesAndDistricts() {
  try {
    console.log('🔍 Railway database bağlantısı test ediliyor...\n');
    
    // Cities kontrol
    const cityCount = await prisma.cities.count();
    console.log(`📍 Cities tablosunda ${cityCount} şehir var`);
    
    if (cityCount > 0) {
      const sampleCities = await prisma.cities.findMany({
        take: 5,
        orderBy: { name: 'asc' }
      });
      console.log('İlk 5 şehir:');
      sampleCities.forEach(city => {
        console.log(`  - ${city.name} (ID: ${city.id})`);
      });
    }
    
    console.log('');
    
    // Districts kontrol
    const districtCount = await prisma.districts.count();
    console.log(`🏘️ Districts tablosunda ${districtCount} ilçe var`);
    
    if (districtCount > 0) {
      const sampleDistricts = await prisma.districts.findMany({
        take: 5,
        include: {
          cities: true
        },
        orderBy: { name: 'asc' }
      });
      console.log('İlk 5 ilçe:');
      sampleDistricts.forEach(district => {
        console.log(`  - ${district.name} (${district.cities.name}) (ID: ${district.id})`);
      });
    }
    
    console.log('');
    
    // Listings'de city ve district kullanımını kontrol et
    const listingsWithCities = await prisma.listings.count({
      where: {
        city_id: { not: null }
      }
    });
    
    const listingsWithDistricts = await prisma.listings.count({
      where: {
        district_id: { not: null }
      }
    });
    
    console.log(`🏠 Listings tablosunda:`);
    console.log(`  - ${listingsWithCities} ilan şehir bilgisine sahip`);
    console.log(`  - ${listingsWithDistricts} ilan ilçe bilgisine sahip`);
    
    // Sample listings with location info
    const sampleListings = await prisma.listings.findMany({
      where: {
        OR: [
          { city_id: { not: null } },
          { district_id: { not: null } }
        ]
      },
      include: {
        cities: true,
        districts: true
      },
      take: 5
    });
    
    if (sampleListings.length > 0) {
      console.log('\nÖrnek ilanların lokasyon bilgileri:');
      sampleListings.forEach(listing => {
        console.log(`  - ${listing.title.substring(0, 50)}...`);
        console.log(`    Şehir: ${listing.cities?.name || 'YOK'}`);
        console.log(`    İlçe: ${listing.districts?.name || 'YOK'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCitiesAndDistricts();
