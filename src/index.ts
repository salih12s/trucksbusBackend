import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIO } from './middleware/socket';
import { initSocket } from './utils/socket';
import { SocketService } from './services/socketService';

// Import routes
import authRoutes from './routes/authRoutes';
import listingRoutes from './routes/listingRoutes';
import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import locationRoutes from './routes/locationRoutes';
import conversationsRoutes from './routes/conversationsRoutes';
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import favoritesRoutes from './routes/favorites';
import meRoutes from './routes/meRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

// Import utils
import { logger } from './utils/logger';
import { prisma } from './utils/database';

// Load environment variables - development environment için
  dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          "https://trucksbus.com", 
          "https://www.trucksbus.com",
          "https://trucksbus.com.tr", 
          "https://www.trucksbus.com.tr"
        ]
      : "*", // Development - all origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting - Production için çok gevşek ayarlar
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'production' ? 1000 : 200, // Production'da 1000/dakika, development'ta 200/dakika
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        "https://trucksbus.com", 
        "https://www.trucksbus.com",
        "https://trucksbus.com.tr", 
        "https://www.trucksbus.com.tr",
        "https://trucksbusbackend-production-0e23.up.railway.app",
        "*" // Geçici olarak tüm origin'lere izin ver
      ]
    : "*", // Development - all origins
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files serving - uploaded images için  
const uploadsPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '..', 'public', 'uploads')
  : path.resolve('C:/Users/salih/Desktop/TruckBus/Backend/public/uploads');
console.log('🖼️ Static uploads path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Socket.IO middleware - req'e io instance ekle
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Very simple health check - no dependencies
app.get('/api/health', (req, res) => {
  console.log('Health check called at:', new Date().toISOString());
  res.status(200).send('OK');
});

// Also add root endpoint for quick test
app.get('/', (req, res) => {
  res.status(200).send('TruckBus Backend is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);

// Yeni Mesajlaşma Sistemi Routes
app.use('/api/conversations', conversationsRoutes);
app.use('/api/me', meRoutes);

// Favorites Routes - BEFORE reports to avoid conflict
app.use('/api/favorites', favoritesRoutes);

// Reports Routes - Specific path instead of broad /api
app.use('/api/reports', reportRoutes);

// Notifications Routes
app.use('/api/notifications', notificationRoutes);

// Feedback Routes
app.use('/api', feedbackRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler - ALWAYS returns JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error('❌ Global Error Handler:', {
    status,
    message,
    url: req.url,
    method: req.method,
    stack: err.stack
  });
  
  res.status(status).json({ 
    success: false, 
    message,
    ...(err.details ? { details: err.details } : {})
  });
});

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    // Don't exit - let the caller decide
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  console.log('🔧 Starting server...');
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 PORT:', process.env.PORT);
  console.log('🔧 DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // Try to connect to database but don't fail if it fails
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');
      logger.info('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed, but server will continue:', dbError);
      logger.error('❌ Database connection failed, but server will continue:', dbError);
    }
    
    // Initialize room-based Socket.IO
    initSocket(io);
    console.log('✅ Socket.IO initialized');
    
    // Initialize SocketService for messaging - PASS EXISTING IO INSTANCE
    console.log('🔥 Creating SocketService...');
    const socketService = new SocketService(server, io);  // ✅ PASS IO INSTANCE
    app.set('socketService', socketService);
    console.log('✅ SocketService initialized with shared IO instance');
    console.log('🔥 SocketService setup complete, event handlers should be active');
    
    const actualPort = Number(process.env.PORT) || 3001;
    console.log('🔧 Attempting to listen on port:', actualPort);
    
    server.listen(actualPort, '0.0.0.0', () => {
      console.log(`🚀 Server running on 0.0.0.0:${actualPort}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://trucksbus.com'}`);
      console.log(`💬 Socket.IO enabled with room management`);
      console.log(`🩺 Health check available at /api/health`);
      
      logger.info(`🚀 Server running on 0.0.0.0:${actualPort}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://trucksbus.com'}`);
      logger.info(`💬 Socket.IO enabled with room management`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app };
