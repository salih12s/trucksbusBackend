import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';
import * as feedbackController from '../controllers/feedbackController';

const router = express.Router();

// ULID regex pattern for validation
const ULID_RE = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

// Validation error handler
const validate = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array()
        });
        return;
    }
    next();
};

// Kullanıcı feedback routes
router.post('/feedback', 
    authMiddleware,
    [
        body('subject')
            .notEmpty()
            .withMessage('Konu alanı gereklidir')
            .isLength({ max: 200 })
            .withMessage('Konu en fazla 200 karakter olabilir'),
        body('message')
            .notEmpty()
            .withMessage('Mesaj alanı gereklidir')
            .isLength({ max: 2000 })
            .withMessage('Mesaj en fazla 2000 karakter olabilir'),
        body('type')
            .optional()
            .isIn(['COMPLAINT', 'SUGGESTION', 'BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL'])
            .withMessage('Geçersiz feedback türü'),
        body('priority')
            .optional()
            .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
            .withMessage('Geçersiz öncelik seviyesi')
    ],
    validate,
    feedbackController.createFeedback
);

router.get('/feedback/my-feedbacks', 
    authMiddleware,
    feedbackController.getUserFeedbacks
);

// Admin feedback routes
router.get('/admin/feedback',
    authMiddleware,
    adminMiddleware,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Sayfa numarası pozitif bir sayı olmalı'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit 1-50 arasında olmalı'),
        query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).withMessage('Geçersiz durum'),
        query('type').optional().isIn(['COMPLAINT', 'SUGGESTION', 'BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL']).withMessage('Geçersiz tip'),
        query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Geçersiz öncelik')
    ],
    validate,
    feedbackController.getAllFeedbacks
);

router.get('/admin/feedback/stats',
    authMiddleware,
    adminMiddleware,
    feedbackController.getFeedbackStats
);

router.get('/admin/feedback/:id',
    authMiddleware,
    adminMiddleware,
    [
        param('id').matches(ULID_RE).withMessage('Geçersiz feedback ID')
    ],
    feedbackController.getFeedbackDetail
);

router.post('/admin/feedback/:id/respond',
    authMiddleware,
    adminMiddleware,
    [
        param('id').matches(ULID_RE).withMessage('Geçersiz feedback ID'),
        body('response')
            .notEmpty()
            .withMessage('Yanıt mesajı gereklidir')
            .isLength({ max: 2000 })
            .withMessage('Yanıt en fazla 2000 karakter olabilir'),
        body('status')
            .optional()
            .isIn(['IN_PROGRESS', 'RESOLVED', 'CLOSED'])
            .withMessage('Geçersiz durum')
    ],
    validate,
    feedbackController.respondToFeedback
);

router.put('/admin/feedback/:id/status',
    authMiddleware,
    adminMiddleware,
    [
        param('id').matches(ULID_RE).withMessage('Geçersiz feedback ID'),
        body('status')
            .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
            .withMessage('Geçersiz durum')
    ],
    feedbackController.updateFeedbackStatus
);

export default router;
