import express from 'express';
import { ConversationsController } from '../controllers/conversationsController';
import { authenticateToken } from '../middleware/auth';
import requireConversationParticipant from '../middleware/requireConversationParticipant';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// POST /conversations - Konuşma oluştur veya getir
router.post('/', ConversationsController.createOrGetConversation);

// POST /conversations/from-listing - İlan için konuşma oluştur
router.post('/from-listing', ConversationsController.createConversationFromListing);

// GET /conversations - Kullanıcının konuşmalarını listele (zaten user bazlı filtreli)
router.get('/', ConversationsController.getUserConversations);

// 🔒 Participant kontrolü gereken route'lar
// GET /conversations/:id/messages - Konuşmanın mesajları
router.get('/:id/messages', requireConversationParticipant, ConversationsController.getConversationMessages);

// POST /conversations/:id/messages - Mesaj gönder
router.post('/:id/messages', requireConversationParticipant, ConversationsController.sendMessage);

// PUT /conversations/:id/read - Konuşmayı okundu işaretle
router.put('/:id/read', requireConversationParticipant, ConversationsController.markAsRead);

// DELETE /conversations/:id - Konuşmayı sil (tek taraflı)
router.delete('/:id', requireConversationParticipant, ConversationsController.deleteConversation);

export default router;
