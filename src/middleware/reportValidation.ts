import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention - remove common attack vectors
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    }
  }
  next();
};

// Validation rules for report creation
export const validateCreateReport = [
  body('listingId')
    .isString()
    .notEmpty()
    .withMessage('İlan ID gereklidir')
    .isLength({ max: 50 })
    .withMessage('İlan ID çok uzun'),
  
  body('reasonCode') // 👈 reasonCode olmalı
    .isIn(['FRAUD', 'NUDITY', 'WRONG_CATEGORY', 'MISLEADING_INFO', 'COPYRIGHT', 'OTHER'])
    .withMessage('Geçerli bir sebep seçin'),
  
  body('description')
    .isString()
    .notEmpty()
    .withMessage('Açıklama gereklidir')
    .isLength({ min: 10, max: 500 }) // pratikte 500 ideal
    .withMessage('Açıklama 10-500 karakter olmalıdır')
    .matches(/^[^<>]*$/)
    .withMessage('Açıklama geçersiz karakterler içeriyor'),
];

// Validation rules for admin status update
export const validateAdminUpdate = [
  body('status')
    .isIn(['OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'])
    .withMessage('Geçerli bir durum seçin'),
  
  body('resolutionNote')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Çözüm notu 500 karakterden kısa olmalıdır'),
  
  body('removeListing')
    .optional()
    .isBoolean()
    .withMessage('İlan kaldırma seçeneği boolean olmalıdır'),
];

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Girdi doğrulama hatası',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg,
      })),
    });
    return;
  }
  
  next();
};
