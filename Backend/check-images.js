const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListingImages() {
  console.log('🔍 İlan görsellerini kontrol ediyoruz...');

  try {
    const listings = await prisma.listings.findMany({
      select: {
        id: true,
        title: true,
        images: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Toplam ${listings.length} ilan bulundu\n`);

    for (const listing of listings) {
      console.log(`🔍 İlan: ${listing.id}`);
      console.log(`📝 Başlık: ${listing.title}`);
      console.log(`🖼️ İmages raw:`, typeof listing.images, listing.images);
      
      if (listing.images) {
        try {
          const parsed = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images;
          
          console.log(`🖼️ Parsed:`, parsed);
          console.log(`📊 Görsel sayısı:`, Array.isArray(parsed) ? parsed.length : 'Dizi değil');
        } catch (e) {
          console.log(`❌ Parse hatası:`, e.message);
        }
      } else {
        console.log(`❌ Images field NULL`);
      }
      console.log('---\n');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListingImages();
