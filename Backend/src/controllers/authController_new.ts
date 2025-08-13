import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
        phone,
        is_active: true,
        is_verified: false,
        role: 'USER',
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        is_email_verified: true,
        created_at: true,
      }
    });

    // Generate token
    const token = generateToken(user.id);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        phone: true,
        city: true,
        district: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default-secret') as any;

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, is_active: true }
    });

    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If email exists, password reset instructions have been sent',
      });
      return;
    }

    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link

    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'If email exists, password reset instructions have been sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // In a real app, you would:
    // 1. Validate the reset token
    // 2. Check if it's not expired
    // 3. Update the user's password
    // 4. Invalidate the reset token

    // For now, just return an error since we don't have token validation implemented
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // In a real app, you would:
    // 1. Validate the verification token
    // 2. Check if it's not expired
    // 3. Update the user's verification status
    // 4. Invalidate the verification token

    // For now, just return an error since we don't have token validation implemented
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
