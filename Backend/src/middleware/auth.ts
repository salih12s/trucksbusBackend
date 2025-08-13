import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    username: string | null;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          role: true,
          is_active: true,
          is_email_verified: true,
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Access denied. User not found.',
        });
        return;
      }

      if (!user.is_active) {
        res.status(401).json({
          success: false,
          message: 'Access denied. Account is deactivated.',
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      logger.error('JWT verification error:', jwtError);
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
      });
      return;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
    return;
  }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
    return;
  }
};

export const superAdminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Super admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
    return;
  }
};

export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          role: true,
          is_active: true,
          is_email_verified: true,
        }
      });

      if (user && user.is_active) {
        req.user = user;
      }
    } catch (jwtError) {
      // Invalid token, but continue without authentication
      logger.warn('Optional auth - invalid token:', jwtError);
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue despite error
  }
};

export type { AuthRequest };
