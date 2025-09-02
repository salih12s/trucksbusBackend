const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function addCorporateFields() {
  const prisma = new PrismaClient();

  try {
    console.log('✅ Database connected');

    // Raw SQL ile kurumsal hesap alanlarını ekle
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT false;`;
    console.log('✅ is_corporate column added');

    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;`;
    console.log('✅ company_name column added');

    console.log('🎉 Corporate fields added successfully!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCorporateFields();
