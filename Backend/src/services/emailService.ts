import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration - Update with your SMTP settings
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  return nodemailer.createTransport(config);
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  firstName: string
): Promise<boolean> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured, skipping email send');
      return false;
    }

    const transporter = createTransporter();

    // Frontend URL for reset password page
    const frontendUrl = process.env.FRONTEND_URL || 'https://trucksbus.com';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"TruckBus" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Şifre Sıfırlama - TruckBus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Şifre Sıfırlama</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #E14D43; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #E14D43; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TruckBus</h1>
              <p>Şifre Sıfırlama</p>
            </div>
            
            <div class="content">
              <h2>Merhaba ${firstName},</h2>
              
              <p>Şifre sıfırlama talebiniz alınmıştır. Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
              </div>
              
              <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
              
              <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <p><strong>Güvenlik İpucu:</strong> Hiçbir zaman şifrenizi e-posta ile paylaşmayınız.</p>
            </div>
            
            <div class="footer">
              <p>Bu e-posta TruckBus tarafından gönderilmiştir.</p>
              <p>© ${new Date().getFullYear()} TruckBus - Türkiye'nin Güvenilir Ticari Araç Platformu</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent successfully to ${to}`);
    return true;

  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  to: string,
  firstName: string
): Promise<boolean> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured, skipping email send');
      return false;
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'https://trucksbus.com';

    const mailOptions = {
      from: `"TruckBus" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Hoş Geldiniz - TruckBus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hoş Geldiniz</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #E14D43; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #E14D43; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TruckBus</h1>
              <p>Hoş Geldiniz!</p>
            </div>
            
            <div class="content">
              <h2>Merhaba ${firstName},</h2>
              
              <p>TruckBus ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
              
              <p>Artık:</p>
              <ul>
                <li>✓ İlan verebilir</li>
                <li>✓ Favori ilanlarınızı kaydedebilir</li>
                <li>✓ Diğer kullanıcılarla mesajlaşabilir</li>
                <li>✓ Gelişmiş filtreleme özelliklerini kullanabilirsiniz</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${frontendUrl}" class="button">Platformu Keşfet</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Bu e-posta TruckBus tarafından gönderilmiştir.</p>
              <p>© ${new Date().getFullYear()} TruckBus - Türkiye'nin Güvenilir Ticari Araç Platformu</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent successfully to ${to}`);
    return true;

  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendTestEmail = async (): Promise<boolean> => {
  try {
    const testResult = await sendPasswordResetEmail(
      'test@example.com',
      'test-token',
      'Test User'
    );
    return testResult;
  } catch (error) {
    logger.error('Error in test email:', error);
    return false;
  }
};
