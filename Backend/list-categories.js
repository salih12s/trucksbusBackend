const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listCategories() {
  try {
    console.log('Listing all categories...\n');

    const categories = await prisma.categories.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${categories.length} categories:`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ID: ${cat.id}, Name: "${cat.name}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCategories();
