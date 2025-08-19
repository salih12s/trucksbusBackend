import { Router } from 'express';
import { ReportsController } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';
import { 
  reportRateLimit, 
  adminActionRateLimit, 
  reportViewRateLimit 
} from '../middleware/reportRateLimit';
import { 
  sanitizeInput, 
  validateCreateReport, 
  validateAdminUpdate, 
  handleValidationErrors 
} from '../middleware/reportValidation';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// Input sanitization for all routes
router.use(sanitizeInput);

// POST /api/reports - Şikayet oluştur (Rate limited + Validated)
router.post('/', 
  reportRateLimit, 
  validateCreateReport, 
  handleValidationErrors, 
  ReportsController.createReport
);

// GET /api/reports/me - Kullanıcının şikayetleri (Rate limited)
router.get('/me', reportViewRateLimit, ReportsController.getMyReports);

export default router;
