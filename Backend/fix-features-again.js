const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFeatures() {
  console.log('Fixing features data...');

  // Tüm listings'leri kontrol et
  const listings = await prisma.listings.findMany({
    select: { id: true, title: true, features: true }
  });

  console.log(`Found ${listings.length} listings`);

  for (const listing of listings) {
    let needsUpdate = false;
    let newFeatures = null;

    if (listing.features) {
      console.log(`\nListing ${listing.id}:`);
      console.log('Features type:', typeof listing.features);
      console.log('Features value:', listing.features);

      // Eğer string ise ve "[object Object]" ise null yap
      if (typeof listing.features === 'string') {
        if (listing.features === '[object Object]' || listing.features.includes('[object Object]')) {
          console.log('Found [object Object], setting to null');
          newFeatures = null;
          needsUpdate = true;
        } else {
          try {
            // Valid JSON string ise parse et
            JSON.parse(listing.features);
            console.log('Valid JSON string, keeping as is');
          } catch (e) {
            console.log('Invalid JSON, setting to null');
            newFeatures = null;
            needsUpdate = true;
          }
        }
      } else if (typeof listing.features === 'object') {
        // Eğer empty object ise, örnek data ekle
        if (Object.keys(listing.features).length === 0) {
          console.log('Empty object, adding sample data');
          newFeatures = JSON.stringify({
            abs: true,
            esp: true,
            klima: true,
            cruiseControl: true,
            parkingSensors: false
          });
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await prisma.listings.update({
          where: { id: listing.id },
          data: { features: newFeatures }
        });
        console.log('Updated!');
      }
    }
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

fixFeatures().catch(console.error);
