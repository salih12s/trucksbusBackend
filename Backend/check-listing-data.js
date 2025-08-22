const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkListingData() {
  try {
    const listings = await prisma.listings.findMany({
      select: {
        id: true,
        title: true,
        brand_id: true,
        model_id: true,
        city_id: true,
        district_id: true,
        brands: { select: { name: true } },
        models: { select: { name: true } },
        cities: { select: { name: true } },
        districts: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    console.log('🔍 Son 5 ilanın brand/model/konum bilgileri:\n');

    listings.forEach(listing => {
      console.log(`📋 ${listing.id}: ${listing.title}`);
      console.log(`   Brand ID: ${listing.brand_id} | Name: ${listing.brands?.name || 'NULL'}`);
      console.log(`   Model ID: ${listing.model_id} | Name: ${listing.models?.name || 'NULL'}`);
      console.log(`   City ID: ${listing.city_id} | Name: ${listing.cities?.name || 'NULL'}`);
      console.log(`   District ID: ${listing.district_id} | Name: ${listing.districts?.name || 'NULL'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkListingData();
