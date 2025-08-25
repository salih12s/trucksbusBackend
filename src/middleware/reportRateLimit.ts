import rateLimit from 'express-rate-limit';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// Enhanced report rate limiting with 429 status for 24h duplicates
export const reportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reports per hour per IP
  message: {
    success: false,
    message: 'Çok fazla şikayet gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.',
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip || 'unknown';
  },
});

// Admin işlemleri için daha yüksek limit
export const adminActionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 100, // 100 actions per 15 minutes
  message: {
    success: false,
    message: 'Çok fazla admin işlemi gerçekleştirdiniz.',
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id || req.ip || 'unknown',
});

// Şikayet detayı görüntüleme için rate limit
export const reportViewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 view requests per 15 minutes
  statusCode: 429,
  message: {
    success: false,
    message: 'Çok fazla şikayet detayı isteğinde bulunuyorsunuz. Lütfen bekleyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
