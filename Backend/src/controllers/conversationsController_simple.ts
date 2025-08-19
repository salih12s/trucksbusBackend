import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  
  // Test endpoint - basit konuşma listesi
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Prisma client'ın desteklediği field'ları kullan
      const conversations = await prisma.conversations.findMany({
        take: 10
      });

      return res.json({
        success: true,
        data: conversations
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Test endpoint - mesajları getir
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Basit mesaj listesi
      const messages = await prisma.messages.findMany({
        where: {
          conversation_id: conversationId
        },
        take: 50
      });

      return res.json({
        success: true,
        data: messages
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Test endpoint - mesaj gönder
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { body, conversationId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!body) {
        return res.status(400).json({ success: false, message: 'Message body required' });
      }

      // Basit mesaj oluştur
      const message = await prisma.messages.create({
        data: {
          id: ulid(),
          conversation_id: conversationId || 'test-conv-id',
          sender_id: userId,
          body: body,
          status: 'SENT'
        }
      });

      return res.json({
        success: true,
        data: message
      });

    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Test endpoint
  static async createConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { receiverId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Basit konuşma oluştur
      const conversation = await prisma.conversations.create({
        data: {
          id: ulid(),
          least_user_id: userId < receiverId ? userId : receiverId,
          greatest_user_id: userId > receiverId ? userId : receiverId,
          listing_id: null
        }
      });

      return res.json({
        success: true,
        data: conversation
      });

    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}
