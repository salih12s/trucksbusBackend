import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { prisma } from './utils/database';

// Load environment variables  
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
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

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
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
    
    app.listen(PORT, () => {
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
