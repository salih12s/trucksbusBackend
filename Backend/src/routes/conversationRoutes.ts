import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ConversationsController } from '../controllers/conversationsController';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// POST /api/conversations - Konuşma başlat/getir
router.post('/', ConversationsController.createOrGetConversation);

// GET /api/conversations - Kullanıcının tüm konuşmalarını getir
router.get('/', ConversationsController.getUserConversations);

// GET /api/conversations/:id/messages - Konuşma mesajlarını getir
router.get('/:id/messages', ConversationsController.getConversationMessages);

// POST /api/conversations/:id/messages - Mesaj gönder
router.post('/:id/messages', ConversationsController.sendMessage);

// PUT /api/conversations/:id/read - Konuşmayı okundu olarak işaretle
router.put('/:id/read', ConversationsController.markAsRead);

export default router;
