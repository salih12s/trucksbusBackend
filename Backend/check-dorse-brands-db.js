const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDorseBrands() {
  try {
    console.log('Checking dorse category brands...\n');

    // First get the dorse category ID
    const dorseCategory = await prisma.categories.findFirst({
      where: {
        name: {
          contains: 'Dorse',
          mode: 'insensitive'
        }
      }
    });

    if (!dorseCategory) {
      console.log('Dorse category not found');
      return;
    }

    console.log('Found dorse category:', dorseCategory.name, '(ID:', dorseCategory.id + ')');

    // Get all brands in dorse category
    const dorseBrands = await prisma.brands.findMany({
      where: {
        category_id: dorseCategory.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\nDorse brands found:', dorseBrands.length);
    console.log('='.repeat(60));

    dorseBrands.forEach((brand, index) => {
      const hasImage = brand.image_url ? 'YES' : 'NO';
      console.log(`${index + 1}. ${brand.name}`);
      console.log(`   ID: ${brand.id}`);
      console.log(`   Image: ${hasImage} ${brand.image_url || 'NO IMAGE'}`);
      console.log(`   Created: ${brand.created_at}`);
      console.log('-'.repeat(50));
    });

    // Check specifically for problem brands
    const problemBrands = dorseBrands.filter(brand => 
      !brand.image_url || 
      brand.image_url.includes('undefined') || 
      brand.image_url === ''
    );

    if (problemBrands.length > 0) {
      console.log('\nPROBLEM BRANDS (No image or invalid image URL):');
      problemBrands.forEach(brand => {
        console.log(`- ${brand.name} (ID: ${brand.id}) - Image: "${brand.image_url}"`);
      });
    } else {
      console.log('\nAll dorse brands have valid image URLs');
    }

  } catch (error) {
    console.error('Error checking dorse brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDorseBrands();
