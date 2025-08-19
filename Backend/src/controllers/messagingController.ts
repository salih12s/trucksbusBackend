import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class MessagingController {
  // POST /api/messages/send - Basit mesaj gönderme
  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { receiver_id, listing_id, content } = req.body;
      const sender_id = req.user!.id;

      if (!receiver_id || !content) {
        return res.status(400).json({ error: 'receiver_id and content are required' });
      }

      if (sender_id === receiver_id) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
      }

      // İki kullanıcı arasında konuşma oluştur/bul (mevcut field'lara göre)
      const [least_user_id, greatest_user_id] = [sender_id, receiver_id].sort();

      let conversation = await prisma.conversations.findFirst({
        where: {
          least_user_id,
          greatest_user_id,
          listing_id: listing_id || null
        }
      });

      if (!conversation) {
        // Yeni konuşma oluştur
        conversation = await prisma.conversations.create({
          data: {
            id: ulid(),
            least_user_id,
            greatest_user_id,
            listing_id: listing_id || null
          }
        });
      }

      // Mesajı oluştur
      const message = await prisma.messages.create({
        data: {
          id: ulid(),
          conversation_id: conversation.id,
          sender_id,
          body: content,
          status: 'SENT'
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.body,
          created_at: message.created_at
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/messages/conversations - Kullanıcının konuşmaları
  static async getConversations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user_id = req.user!.id;

      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [
            { least_user_id: user_id },
            { greatest_user_id: user_id }
          ]
        },
        orderBy: { created_at: 'desc' },
        take: 50
      });

      return res.json({
        success: true,
        data: conversations.map(conv => ({
          id: conv.id,
          other_user_id: conv.least_user_id === user_id ? conv.greatest_user_id : conv.least_user_id,
          listing_id: conv.listing_id,
          last_message_at: conv.created_at,
          created_at: conv.created_at
        }))
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/messages/:conversationId - Konuşmanın mesajları
  static async getMessages(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user_id = req.user!.id;
      const conversation_id = req.params.conversationId;

      // Kullanıcının bu konuşmanın sahibi olduğunu kontrol et
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversation_id,
          OR: [
            { least_user_id: user_id },
            { greatest_user_id: user_id }
          ]
        }
      });

      if (!conversation) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const messages = await prisma.messages.findMany({
        where: { conversation_id },
        orderBy: { created_at: 'asc' },
        take: 100
      });

      return res.json({
        success: true,
        data: messages.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          content: msg.body,
          is_read: msg.status === 'READ',
          created_at: msg.created_at,
          is_own: msg.sender_id === user_id
        }))
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /api/messaging/conversations/:conversationId - Konuşmayı gerçek olarak sil
  static async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user_id = req.user!.id;
      const conversation_id = req.params.conversationId;

      // Kullanıcının bu konuşmanın sahibi olduğunu kontrol et
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversation_id,
          OR: [
            { least_user_id: user_id },
            { greatest_user_id: user_id }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // WhatsApp-style deletion: Kullanıcının conversation_participants kaydını sil
      // Böylece o kullanıcı için konuşma görünmez olur ama diğer kullanıcı için durur
      await prisma.conversation_participants.deleteMany({
        where: {
          conversation_id: conversation_id,
          user_id: user_id
        }
      });

      // Eğer hiç participant kalmadıysa konuşmayı tamamen sil
      const remainingParticipants = await prisma.conversation_participants.count({
        where: { conversation_id: conversation_id }
      });

      if (remainingParticipants === 0) {
        await prisma.conversations.delete({
          where: { id: conversation_id }
        });
      }

      return res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
