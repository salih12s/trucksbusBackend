const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkListings() {
  try {
    const totalCount = await prisma.listings.count();
    console.log('Toplam ilan sayısı:', totalCount);
    
    const activeCount = await prisma.listings.count({ 
      where: { is_active: true } 
    });
    console.log('Aktif ilan sayısı:', activeCount);
    
    const approvedCount = await prisma.listings.count({ 
      where: { is_approved: true } 
    });
    console.log('Onaylanmış ilan sayısı:', approvedCount);
    
    const pendingCount = await prisma.listings.count({ 
      where: { 
        is_active: true,
        is_approved: false 
      } 
    });
    console.log('Onay bekleyen ilan sayısı:', pendingCount);
    
    if (totalCount > 0) {
      const sampleListing = await prisma.listings.findFirst({
        select: {
          id: true,
          title: true,
          is_active: true,
          is_approved: true,
          created_at: true
        }
      });
      console.log('Örnek ilan:', sampleListing);
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListings();
