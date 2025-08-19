import express from 'express';
import { ConversationsController } from '../controllers/conversationsController';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// GET /users/unread-count - Toplam okunmamış mesaj sayısı
router.get('/unread-count', ConversationsController.getUnreadCount);

// GET /users/profile - User profile bilgileri
router.get('/profile', UserController.getProfile);

// PUT /users/profile - User profile güncelle
router.put('/profile', UserController.updateProfile);

// GET /users/stats - User istatistikleri
router.get('/stats', UserController.getStats);

// PUT /users/change-password - Şifre değiştir
router.put('/change-password', UserController.changePassword);

export default router;
