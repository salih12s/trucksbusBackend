const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testListing() {
  const listing = await prisma.listings.findFirst({
    where: { features: { not: null } },
    select: { id: true, title: true, features: true }
  });
  console.log('Listing ID:', listing.id);
  console.log('Features type:', typeof listing.features);
  console.log('Features value:', listing.features);
  if (typeof listing.features === 'string') {
    try {
      const parsed = JSON.parse(listing.features);
      console.log('Parsed features:', parsed);
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  }
  await prisma.$disconnect();
}

testListing().catch(console.error);
