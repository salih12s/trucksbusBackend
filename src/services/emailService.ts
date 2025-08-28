import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Email transporter configuration
const createTransporter = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production email settings
    return nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
      },
    });
  } else {
    // Development - use the same Gmail settings for testing
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Fallback to Ethereal for testing if no Gmail credentials
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  firstName: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Determine the frontend URL based on environment
    const frontendUrl = isProduction 
      ? process.env.FRONTEND_URL || 'https://truckbus.com.tr'
      : 'https://truckbus.com.tr';
    
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: isProduction 
        ? process.env.EMAIL_FROM || 'noreply@truckbus.com'
        : 'test@ethereal.email',
      to: email,
      subject: 'TruckBus - Şifre Sıfırlama',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2D3748; margin: 0;">TruckBus</h1>
            <p style="color: #666; margin: 10px 0;">Ticari Araç İlan Platformu</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2D3748; margin-bottom: 20px;">Merhaba ${firstName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              TruckBus hesabınız için şifre sıfırlama talebinde bulundunuz. 
              Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #E14D43; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Bu bağlantı 1 saat süreyle geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, 
              bu e-postayı görmezden gelebilirsiniz.
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Bağlantıya tıklayamıyorsanız, aşağıdaki URL'yi tarayıcınıza kopyalayıp yapıştırın:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 TruckBus. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isProduction) {
      logger.info(`Password reset email sent to ${email}`);
    } else {
      logger.info(`Password reset email sent to ${email}`);
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const isProduction = process.env.NODE_ENV === 'production';
    
    const frontendUrl = isProduction 
      ? process.env.FRONTEND_URL || 'https://your-domain.com'
      : 'https://truckbus.com.tr';
    
    const mailOptions = {
      from: isProduction 
        ? process.env.EMAIL_FROM || 'noreply@truckbus.com'
        : 'test@ethereal.email',
      to: email,
      subject: 'TruckBus\'a Hoş Geldiniz!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2D3748; margin: 0;">TruckBus</h1>
            <p style="color: #666; margin: 10px 0;">Ticari Araç İlan Platformu</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2D3748; margin-bottom: 20px;">Merhaba ${firstName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              TruckBus ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu ve 
              artık platformumuzdaki tüm özelliklerden yararlanabilirsiniz.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2D3748; margin-bottom: 15px;">Neler yapabilirsiniz?</h3>
              <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Ticari araç ilanları oluşturabilirsiniz</li>
                <li>Binlerce ilan arasından arama yapabilirsiniz</li>
                <li>Beğendiğiniz ilanları favorilerinize ekleyebilirsiniz</li>
                <li>Satıcılarla doğrudan mesajlaşabilirsiniz</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}" 
                 style="background: #E14D43; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                Platforma Git
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 TruckBus. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isProduction) {
      logger.info(`Welcome email sent to ${email}`);
    } else {
      logger.info(`Welcome email sent to ${email}`);
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
};
