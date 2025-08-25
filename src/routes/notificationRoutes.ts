import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/notifications/unread-count
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);

// GET /api/notifications
router.get('/', authenticateToken, NotificationController.getNotifications);

// POST /api/notifications/:id/read
router.post('/:id/read', authenticateToken, NotificationController.markAsRead);

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, NotificationController.markAllAsRead);

export default router;
