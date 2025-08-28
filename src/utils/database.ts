import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Database URL kontrolü
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔗 Database URL configured:', databaseUrl.replace(/:[^:]*@/, ':***@'));

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  datasources: {
    db: {
      url: databaseUrl
    }
  },
});

// Log database events
prisma.$on('error', (e) => {
  console.error('❌ Prisma Error:', e);
  logger.error('Prisma error:', e);
});

prisma.$on('warn', (e) => {
  console.warn('⚠️ Prisma Warning:', e);
  logger.warn('Prisma warning:', e);
});

// Log database queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    console.log(`🔍 Query: ${e.query}`);
    console.log(`⏱️ Duration: ${e.duration}ms`);
    logger.info(`Query: ${e.query}`);
    logger.info(`Duration: ${e.duration}ms`);
  });
}

export { prisma };
