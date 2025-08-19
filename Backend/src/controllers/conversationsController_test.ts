import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  
  // Test endpoint - hangi fieldlar mevcut görmek için
  static async testConversationFields(req: AuthenticatedRequest, res: Response) {
    try {
      // Basit bir konuşma oluşturmayı deneyelim
      const testData = {
        id: ulid(),
        participant1_id: 'test1',
        participant2_id: 'test2',
        listing_id: null
      };
      
      console.log('Attempting to create conversation with:', testData);
      
      const result = await prisma.conversations.create({
        data: testData
      });
      
      return res.json({
        success: true,
        message: 'Test successful',
        data: result
      });
      
    } catch (error: any) {
      console.error('Test error:', error.message);
      return res.json({
        success: false,
        error: error.message,
        message: 'Bu test bize hangi fieldların doğru olduğunu söyleyecek'
      });
    }
  }

  // Mevcut konuşmaları listele (basit)
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.userId!;

      const conversations = await prisma.conversations.findMany({
        take: 5 // Sadece 5 tane al
      });

      return res.json({
        success: true,
        data: conversations,
        message: `Found ${conversations.length} conversations`
      });

    } catch (error: any) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Basit mesaj listesi
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const conversation_id = req.params.id;

      const messages = await prisma.messages.findMany({
        where: { conversation_id },
        take: 10
      });

      return res.json({
        success: true,
        data: messages
      });

    } catch (error: any) {
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Basit mesaj gönderimi
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const sender_id = req.userId!;
      const { conversation_id, body } = req.body;

      if (!conversation_id || !body?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Konuşma ID ve mesaj içeriği gereklidir.'
        });
      }

      const message = await prisma.messages.create({
        data: {
          id: ulid(),
          conversation_id,
          sender_id,
          body: body.trim(),
          status: 'SENT'
        }
      });

      return res.json({
        success: true,
        data: message
      });

    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Dummy endpoints
  static async createOrGetConversation(req: AuthenticatedRequest, res: Response) {
    return this.testConversationFields(req, res);
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json({
        success: true,
        data: { total_unread: 0 }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
