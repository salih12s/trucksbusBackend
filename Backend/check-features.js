// Database'deki features verilerini kontrol et
const { PrismaClient } = require('@prisma/client');

async function checkFeatures() {
  const prisma = new PrismaClient();
  
  try {
    // İlk 5 listing'i features ile birlikte getir
    const listings = await prisma.listings.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        features: true
      }
    });
    
    console.log('Database Features Check:');
    console.log('========================');
    
    listings.forEach((listing, index) => {
      console.log(`\n${index + 1}. Listing ID: ${listing.id}`);
      console.log(`   Title: ${listing.title}`);
      console.log(`   Features type: ${typeof listing.features}`);
      console.log(`   Features value: ${listing.features}`);
      
      if (listing.features) {
        try {
          const parsed = JSON.parse(listing.features);
          console.log(`   Parsed features:`, parsed);
        } catch (e) {
          console.log(`   Parse error: ${e.message}`);
        }
      }
    });
    
    // Features alanı null olmayan kayıtları say
    const withFeatures = await prisma.listings.count({
      where: {
        features: { not: null }
      }
    });
    
    const total = await prisma.listings.count();
    
    console.log(`\n\nSummary:`);
    console.log(`Total listings: ${total}`);
    console.log(`Listings with features: ${withFeatures}`);
    console.log(`Listings without features: ${total - withFeatures}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeatures();
