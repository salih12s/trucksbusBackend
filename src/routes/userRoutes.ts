import express from 'express';
import { ConversationsController } from '../controllers/conversationsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// GET /me/unread-count - Toplam okunmamış mesaj sayısı
router.get('/unread-count', ConversationsController.getUnreadCount);

export default router;
