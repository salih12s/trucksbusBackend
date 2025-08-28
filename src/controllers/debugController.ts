import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export const debugAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔧 Debug Auth called');
    console.log('🔧 Environment check:');
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔧 AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
    console.log('🔧 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('🔧 Request body:', req.body);

    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email required for debug'
      });
      return;
    }

    // Test database connection
    console.log('🔧 Testing database connection...');
    await prisma.$connect();
    console.log('🔧 Database connected successfully');

    // Try to find user
    console.log('🔧 Searching for user:', email);
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        password: true
      }
    });

    console.log('🔧 User found:', {
      exists: !!user,
      email: user?.email,
      hasPassword: !!user?.password,
      isActive: user?.is_active
    });

    res.status(200).json({
      success: true,
      data: {
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          JWT_SECRET_exists: !!process.env.JWT_SECRET,
          AUTH_SECRET_exists: !!process.env.AUTH_SECRET,
          DATABASE_URL_exists: !!process.env.DATABASE_URL
        },
        user: user ? {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          hasPassword: !!user.password
        } : null
      }
    });

  } catch (error) {
    console.error('💥 Debug Auth Error:', error);
    logger.error('Debug auth error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
};

export const testConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🧪 Testing connections...');
    
    // Test database
    await prisma.$connect();
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database test successful:', testQuery);

    res.status(200).json({
      success: true,
      message: 'All connections working',
      data: {
        database: 'connected',
        testQuery: testQuery
      }
    });

  } catch (error) {
    console.error('💥 Connection test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined
      }
    });
  }
};
