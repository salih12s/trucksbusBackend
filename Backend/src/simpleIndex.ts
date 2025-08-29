import express, { Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { logger } from './utils/logger';
import { prisma } from './utils/database';
import { SocketService } from './services/socketService';
import favoritesRoutes from './routes/favorites';
import meRoutes from './routes/meRoutes';

// Load environment variables  
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3005;

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Make socket service available to routes
app.set('socketService', socketService);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://truckbus.com.tr', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'TruckBus Backend API is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for checking pending listings without auth
app.get('/test/pending-listings', async (req, res) => {
  try {
    const listings = await prisma.listings.findMany({
      where: { status: 'PENDING' },
      include: {
        categories: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    logger.error('Test pending listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending listings'
    });
  }
});

// Debug route for authentication
app.get('/api/auth/whoami', async (req: any, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, first_name: true, last_name: true, is_active: true }
    });

    res.json({ success: true, user, decoded });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Test endpoint to check all users
app.get('/test/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true
      }
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Test endpoint to check all reports
app.get('/test/reports', async (req, res) => {
  try {
    const reports = await prisma.reports.findMany({
      include: {
        reporter: { select: { first_name: true, last_name: true } },
        listing: { select: { title: true } }
      }
    });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// Test endpoint to check categories
app.get('/test/categories', async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true
      }
    });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

// Test endpoint for creating a sample pending listing
app.post('/test/create-listing', async (req, res) => {
  try {
    // First get a valid user
    const user = await prisma.users.findFirst();
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'No user found in database' 
      });
    }

    // Create a sample listing
    const listing = await prisma.listings.create({
      data: {
        id: ulid(), // Add missing id
        title: "Test İlanı - 2020 Mercedes Actros",
        description: "Bu bir test ilanıdır.",
        price: 500000,
        year: 2020,
        km: 100000,
        category_id: "vehicle-category-001", // Vasıta category
        vehicle_type_id: "cme633w8v0001981ksnpl6dj4", // Minibüs & Midibüs from checkIds
        brand_id: "cme63joza00058jr35kfzpxii", // Fiat (Minibüs) from checkIds
        model_id: "cme6433k50001a81vx38fdgpl", // Starcraft from checkIds
        city_id: "cme60juon000q8vo1t9zrtn3v", // Afyonkarahisar from getCityIds
        district_id: "cme60juoq000r8vo1bultamcw", // Başmakçı from getCityIds
        seller_name: "Test Kullanıcı",
        seller_phone: "5555555555",
        seller_email: "test@example.com",
        color: "Beyaz",
        fuel_type: "Dizel",
        transmission: "Manuel",
        vehicle_condition: "İyi",
        user_id: user.id, // Gerçek user ID kullan
        status: 'PENDING',
        is_pending: true,
        is_active: false,
        is_approved: false,
        updated_at: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Test listing created',
      data: listing
    });
  } catch (error) {
    logger.error('Create test listing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating test listing',
      error: (error as Error).message
    });
  }
});

// Import routes
try {
  const categoryRoutes = require('./routes/categoryRoutes').default;
  app.use('/api/categories', categoryRoutes);
  logger.info('Category routes loaded');
} catch (error) {
  logger.error('Failed to load category routes:', error);
}

try {
  const authRoutes = require('./routes/authRoutes').default;
  app.use('/api/auth', authRoutes);
  logger.info('Auth routes loaded');
} catch (error) {
  logger.error('Failed to load auth routes:', error);
}

try {
  const locationRoutes = require('./routes/locationRoutes').default;
  app.use('/api/locations', locationRoutes);
  logger.info('Location routes loaded');
} catch (error) {
  logger.error('Failed to load location routes:', error);
}

try {
  const conversationsRoutes = require('./routes/conversationsRoutes').default;
  app.use('/api/conversations', conversationsRoutes);
  logger.info('Conversations routes loaded');
} catch (error) {
  logger.error('Failed to load conversations routes:', error);
}

try {
  const adminRoutes = require('./routes/adminRoutes').default;
  app.use('/api/admin', adminRoutes);
  logger.info('Admin routes loaded');
} catch (error) {
  logger.error('Failed to load admin routes:', error);
}

try {
  const listingRoutes = require('./routes/listingRoutes').default;
  app.use('/api/listings', listingRoutes);
  logger.info('Listing routes loaded');
} catch (error) {
  logger.error('Failed to load listing routes:', error);
}

try {
  if (!favoritesRoutes) {
    logger.error('favorites routes is undefined - check export');
  } else {
    app.use('/api/favorites', favoritesRoutes);
    logger.info('Favorites routes loaded');
  }
} catch (error) {
  logger.error('Failed to load favorites routes:', error);
}

try {
  if (!meRoutes) {
    logger.error('me routes is undefined - check export');
  } else {
    app.use('/api/me', meRoutes);
    logger.info('Me routes loaded');
  }
} catch (error) {
  logger.error('Failed to load me routes:', error);
}

try {
  const reportRoutes = require('./routes/reportRoutes').default;
  if (!reportRoutes) {
    logger.error('report routes is undefined - check export');
  } else {
    app.use('/api/reports', reportRoutes);
    logger.info('Report routes loaded');
  }
} catch (error) {
  logger.error('Failed to load report routes:', error);
}

try {
  const notificationRoutes = require('./routes/notificationRoutes').default;
  if (!notificationRoutes) {
    logger.error('notification routes is undefined - check export');
  } else {
    app.use('/api/notifications', notificationRoutes);
    logger.info('Notification routes loaded');
  }
} catch (error) {
  logger.error('Failed to load notification routes:', error);
}

try {
  const feedbackRoutes = require('./routes/feedbackRoutes').default;
  if (!feedbackRoutes) {
    logger.error('feedback routes is undefined - check export');
  } else {
    app.use('/api', feedbackRoutes);
    logger.info('Feedback routes loaded');
  }
} catch (error) {
  logger.error('Failed to load feedback routes:', error);
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Global error:', err);
  console.error('🔥 DETAILED ERROR:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    meta: err.meta,
    name: err.name
  });
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error_details: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      code: err.code,
      meta: err.meta
    } : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection first
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Socket.IO setup  
    logger.info('💬 Socket.IO enabled');
    
    server.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`); 
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
