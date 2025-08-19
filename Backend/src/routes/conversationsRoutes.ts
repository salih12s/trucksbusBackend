import express from 'express';
import { ConversationsController } from '../controllers/conversationsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// POST /conversations - Konuşma oluştur veya getir
router.post('/', ConversationsController.createOrGetConversation);

// POST /conversations/from-listing - İlan için konuşma oluştur
router.post('/from-listing', ConversationsController.createConversationFromListing);

// GET /conversations - Kullanıcının konuşmalarını listele
router.get('/', ConversationsController.getUserConversations);

// GET /conversations/:id/messages - Konuşmanın mesajları
router.get('/:id/messages', ConversationsController.getConversationMessages);

// POST /conversations/:id/messages - Mesaj gönder
router.post('/:id/messages', ConversationsController.sendMessage);

// PUT /conversations/:id/read - Konuşmayı okundu işaretle
router.put('/:id/read', ConversationsController.markAsRead);

// DELETE /conversations/:id - Konuşmayı sil (tek taraflı)
router.delete('/:id', ConversationsController.deleteConversation);

export default router;
