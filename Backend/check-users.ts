import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('📊 Total users found:', users.length);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    const adminUsers = users.filter(u => u.role === 'ADMIN');
    console.log('👑 Admin users found:', adminUsers.length);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.email} (ID: ${admin.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
