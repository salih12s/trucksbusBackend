import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { normalizePhoneTR, isValidPhoneTR } from '../utils/phone';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name, phone, city, district, kvkk_accepted } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !phone) {
      res.status(400).json({ 
        success: false, 
        message: 'E-posta, şifre, ad, soyad ve telefon alanları zorunludur.' 
      });
      return;
    }

    // KVKK kontrolü - temporarily disabled for Railway compatibility
    // if (!kvkk_accepted) {
    //   res.status(400).json({ 
    //     success: false, 
    //     message: 'KVKK Aydınlatma Metni kabul edilmelidir.' 
    //   });
    //   return;
    // }

    // Validate and normalize phone
    const normalizedPhone = normalizePhoneTR(String(phone).trim());
    if (!normalizedPhone) {
      res.status(400).json({ 
        success: false, 
        message: 'Geçerli bir telefon numarası giriniz (0xxx xxx xx xx).' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ 
        success: false, 
        message: 'Bu e-posta adresi ile zaten kayıtlı bir kullanıcı bulunmaktadır.' 
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.users.create({
      data: {
        id: ulid(),
        email,
        password: hashedPassword,
        first_name,
        last_name,
        phone: normalizedPhone,
        city,
        district,
        role: 'USER',
        is_active: true,
        is_email_verified: false,
        // KVKK fields temporarily removed for Railway compatibility
        // kvkk_accepted: true,
        // kvkk_accepted_at: new Date(),
        // kvkk_ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        // kvkk_version: 'v1.0',
        updated_at: new Date()
      }
    });

    // Generate JWT token
    const registerJwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'temporary-railway-debug-secret-2024';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      registerJwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Kayıt başarıyla tamamlandı.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          is_active: user.is_active,
          is_email_verified: user.is_email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token
      }
    });
  } catch (error) {
    logger.error('Error in register:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kayıt işlemi sırasında bir hata oluştu.' 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Login attempt started:', {
      hasEmail: !!req.body?.email,
      hasPassword: !!req.body?.password,
      rememberMe: req.body?.rememberMe,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET_exists: !!process.env.JWT_SECRET,
        AUTH_SECRET_exists: !!process.env.AUTH_SECRET,
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
      }
    });
    
    const { email, password, rememberMe } = req.body;

    // Test database connection first
    console.log('🔍 Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection test successful');
    } catch (dbTestError) {
      console.error('❌ Database connection test failed:', dbTestError);
      res.status(500).json({ 
        success: false, 
        message: 'Database bağlantısında sorun var.' 
      });
      return;
    }

    // JWT Secret check
    const loginJwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
    if (!loginJwtSecret) {
      console.error('❌ No JWT secret available');
      res.status(500).json({ 
        success: false, 
        message: 'Server configuration error: No JWT secret' 
      });
      return;
    }

    // Validate input
    if (!email || !password) {
      console.log('❌ Login failed: Missing credentials');
      res.status(400).json({ 
        success: false, 
        message: 'E-posta ve şifre alanları zorunludur.' 
      });
      return;
    }

    // Find user by email
    console.log('🔍 Searching for user:', email);
    const user = await prisma.users.findUnique({
      where: { email },
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
        is_email_verified: true,
        is_active: true,
        avatar: true,
        password: true,
        login_attempts: true,
        last_login: true,
        created_at: true,
        updated_at: true
      }
    });
    
    console.log('👤 User found:', {
      exists: !!user,
      email: user?.email,
      isActive: user?.is_active,
      hasPassword: !!user?.password
    });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Geçersiz e-posta veya şifre.' 
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({ 
        success: false, 
        message: 'Hesabınız devre dışı bırakılmıştır.' 
      });
      return;
    }

    // Verify password
    logger.info(`Login attempt for user ${email}`);
    logger.info(`Stored password hash: ${user.password?.substring(0, 10)}...`);
    
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    logger.info(`Password comparison result: ${isValidPassword}`);

    if (!isValidPassword) {
      logger.warn(`Failed login attempt for user ${email} - invalid password`);
      res.status(401).json({ 
        success: false, 
        message: 'Geçersiz e-posta veya şifre.' 
      });
      return;
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { 
        last_login: new Date(),
        login_attempts: 0,
        updated_at: new Date()
      }
    });

    // Generate JWT token with dynamic expiration
    const tokenExpiration = rememberMe ? '30d' : '24h'; // Remember me: 30 gün, normal: 24 saat
    
    const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'temporary-railway-debug-secret-2024';
    console.log('🔐 Using JWT secret from:', process.env.JWT_SECRET ? 'JWT_SECRET' : process.env.AUTH_SECRET ? 'AUTH_SECRET' : 'fallback');
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        rememberMe: Boolean(rememberMe)
      },
      jwtSecret,
      { expiresIn: tokenExpiration }
    );

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          phone: user.phone,
          city: user.city,
          district: user.district,
          role: user.role,
          is_email_verified: user.is_email_verified,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('💥 Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString()
    });
    
    logger.error('Error in login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Giriş işlemi sırasında bir hata oluştu.' 
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // For JWT-based authentication, logout is handled client-side
    // But we can add token blacklisting if needed in the future
    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı.'
    });
  } catch (error) {
    logger.error('Error in logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Çıkış işlemi sırasında bir hata oluştu.' 
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Yetkisiz erişim.' 
      });
      return;
    }

    const user = await prisma.users.findUnique({
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
        created_at: true
      }
    });

    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı.' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error in getMe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu.' 
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ 
        success: false, 
        message: 'Refresh token gereklidir.' 
      });
      return;
    }

    // For now, just verify the token and issue a new one
    // In production, you might want to store refresh tokens in database
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      const user = await prisma.users.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.is_active) {
        res.status(401).json({ 
          success: false, 
          message: 'Geçersiz token.' 
        });
        return;
      }

      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        data: { token: newToken }
      });
    } catch (jwtError) {
      res.status(401).json({ 
        success: false, 
        message: 'Geçersiz veya süresi dolmuş token.' 
      });
    }
  } catch (error) {
    logger.error('Error in refreshToken:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Token yenileme sırasında bir hata oluştu.' 
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ 
        success: false, 
        message: 'E-posta adresi gereklidir.' 
      });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({ 
        success: true, 
        message: 'Eğer bu e-posta adresi sistemde kayıtlı ise, şifre sıfırlama bağlantısı gönderilecektir.' 
      });
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetToken,
        reset_password_expires: new Date(Date.now() + 3600000), // 1 hour
        updated_at: new Date()
      }
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.first_name
    );

    if (!emailSent) {
      logger.error(`Failed to send password reset email to ${email}`);
      res.status(500).json({ 
        success: false, 
        message: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.' 
      });
      return;
    }

    logger.info(`Password reset email sent successfully to ${email}`);

    res.status(200).json({ 
      success: true, 
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.' 
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ 
        success: false, 
        message: 'Token ve yeni şifre gereklidir.' 
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ 
        success: false, 
        message: 'Şifre en az 6 karakter olmalıdır.' 
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      if (decoded.type !== 'password_reset') {
        res.status(400).json({ 
          success: false, 
          message: 'Geçersiz token türü.' 
        });
        return;
      }

      const user = await prisma.users.findFirst({
        where: {
          id: decoded.id,
          reset_password_token: token,
          reset_password_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        res.status(400).json({ 
          success: false, 
          message: 'Geçersiz veya süresi dolmuş token.' 
        });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      logger.info(`Updating password for user ${user.id} with email ${user.email}`);
      logger.info(`Old password hash: ${user.password.substring(0, 10)}...`);
      logger.info(`New password hash: ${hashedPassword.substring(0, 10)}...`);

      // Update password and clear reset token
      const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null,
          updated_at: new Date()
        }
      });

      logger.info(`Password updated successfully for user ${user.id}`);
      logger.info(`Updated password hash: ${updatedUser.password.substring(0, 10)}...`);

      res.status(200).json({ 
        success: true, 
        message: 'Şifreniz başarıyla sıfırlandı.' 
      });
    } catch (jwtError) {
      res.status(400).json({ 
        success: false, 
        message: 'Geçersiz veya süresi dolmuş token.' 
      });
    }
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.' 
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ 
        success: false, 
        message: 'Doğrulama token\'ı gereklidir.' 
      });
      return;
    }

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'your-secret-key') as any;

      if (decoded.type !== 'email_verification') {
        res.status(400).json({ 
          success: false, 
          message: 'Geçersiz token türü.' 
        });
        return;
      }

      const user = await prisma.users.findFirst({
        where: {
          id: decoded.id,
          email_verification_token: token as string,
          email_verification_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        res.status(400).json({ 
          success: false, 
          message: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.' 
        });
        return;
      }

      // Verify email
      await prisma.users.update({
        where: { id: user.id },
        data: {
          is_email_verified: true,
          email_verification_token: null,
          email_verification_expires: null,
          updated_at: new Date()
        }
      });

      res.status(200).json({ 
        success: true, 
        message: 'E-posta adresiniz başarıyla doğrulandı.' 
      });
    } catch (jwtError) {
      res.status(400).json({ 
        success: false, 
        message: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.' 
      });
    }
  } catch (error) {
    logger.error('Error in verifyEmail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'E-posta doğrulama işlemi sırasında bir hata oluştu.' 
    });
  }
};
