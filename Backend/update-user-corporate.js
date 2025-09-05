const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserToCorporate() {
  try {
    console.log('🔍 Kullanıcı aranıyor...');
    
    // Kullanıcıyı bul
    const user = await prisma.users.findFirst({
      where: { email: 'serdar@codlean.com' }
    });
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }
    
    console.log('👤 Mevcut kullanıcı durumu:', {
      id: user.id,
      email: user.email,
      is_corporate: user.is_corporate,
      company_name: user.company_name,
      role: user.role
    });
    
    // Kurumsal olarak güncelle
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        is_corporate: true,
        company_name: user.company_name || 'Mağazam', // Varsayılan şirket adı
        role: 'CORPORATE',
        updated_at: new Date()
      }
    });
    
    console.log('✅ Kullanıcı başarıyla kurumsal hesaba dönüştürüldü:', {
      id: updatedUser.id,
      email: updatedUser.email,
      is_corporate: updatedUser.is_corporate,
      company_name: updatedUser.company_name,
      role: updatedUser.role
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserToCorporate();
