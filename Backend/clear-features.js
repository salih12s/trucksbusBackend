const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearFeatures() {
  console.log('Clearing all features data...');

  // Tüm listings'lerdeki features'ı temizle
  const result = await prisma.listings.updateMany({
    data: { features: null }
  });

  console.log(`Cleared features from ${result.count} listings`);
  await prisma.$disconnect();
}

clearFeatures().catch(console.error);
