import { Router } from 'express';
import { MessagingController } from '../controllers/messagingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All messaging routes require authentication
router.use(authMiddleware);

// POST /api/messaging/send - Send a message
router.post('/send', MessagingController.sendMessage);

// GET /api/messaging/conversations - Get user's conversations
router.get('/conversations', MessagingController.getConversations);

// GET /api/messaging/:conversationId - Get messages in a conversation
router.get('/:conversationId', MessagingController.getMessages);

// DELETE /api/messaging/conversations/:conversationId - Delete a conversation for current user
router.delete('/conversations/:conversationId', MessagingController.deleteConversation);

export default router;
