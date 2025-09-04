import { Router } from 'express';
import { ConversationsController } from '../controllers/conversationsController';
import { authenticateToken } from '../middleware/auth';
import requireConversationParticipant from '../middleware/requireConversationParticipant';

const router = Router();

router.use(authenticateToken);

// Liste
router.get('/', ConversationsController.getUserConversations);
// Tek konuşma detayları
router.get('/:id', requireConversationParticipant, ConversationsController.getConversationById);
// Tek konuşma mesajları
router.get('/:id/messages', requireConversationParticipant, ConversationsController.getConversationMessages);
// Mesaj gönder
router.post('/:id/messages', requireConversationParticipant, ConversationsController.sendMessage);
// Okundu
router.put('/:id/read', requireConversationParticipant, ConversationsController.markAsRead);
// Sil (gizle)
router.delete('/:id', requireConversationParticipant, ConversationsController.deleteConversation);

// 🔥 İlandan konuşma oluşturma (karşı tarafa gizli)
router.post('/from-listing', ConversationsController.createConversationFromListing);

export default router;
