const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllListings() {
  try {
    const allListings = await prisma.listings.findMany({
      select: {
        id: true,
        title: true,
        is_active: true,
        is_approved: true,
        created_at: true,
        user_id: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    console.log('Tüm ilanlar:');
    allListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Aktif: ${listing.is_active}`);
      console.log(`   Onaylı: ${listing.is_approved}`);
      console.log(`   Kullanıcı ID: ${listing.user_id}`);
      console.log(`   Tarih: ${listing.created_at}`);
      console.log('---');
    });
    
    // Özellikle pending olanları göster
    const pendingListings = allListings.filter(l => l.is_active && !l.is_approved);
    console.log('\nOnay bekleyen ilanlar:');
    if (pendingListings.length === 0) {
      console.log('Onay bekleyen ilan yok!');
    } else {
      pendingListings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
      });
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllListings();
