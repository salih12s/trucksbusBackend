const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllFeatures() {
  const listings = await prisma.listings.findMany({
    select: { id: true, title: true, features: true },
    take: 20
  });
  
  console.log('İlk 20 listing features durumu:');
  console.log('=====================================');
  
  listings.forEach((listing, index) => {
    console.log(`${index + 1}. ${listing.id}`);
    console.log(`   Title: ${listing.title}`);
    console.log(`   Features type: ${typeof listing.features}`);
    if (typeof listing.features === 'string') {
      if (listing.features.includes('[object Object]')) {
        console.log('   ❌ [object Object] sorunu var');
      } else {
        try {
          const parsed = JSON.parse(listing.features);
          console.log('   ✅ Geçerli JSON:', Object.keys(parsed).length, 'özellik');
        } catch (e) {
          console.log('   ❌ Geçersiz JSON');
        }
      }
    } else if (listing.features === null) {
      console.log('   ⚪ NULL - features yok');
    } else if (typeof listing.features === 'object') {
      console.log('   ✅ Object:', Object.keys(listing.features).length, 'özellik');
    }
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkAllFeatures().catch(console.error);
