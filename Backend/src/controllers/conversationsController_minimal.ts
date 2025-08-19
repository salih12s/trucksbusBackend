import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  
  // Basit test fonksiyonu - konuşmaları listeleme
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Mevcut veritabanı yapısına uygun sorgu
      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [
            { least_user_id: userId },
            { greatest_user_id: userId }
          ]
        },
        include: {
          listings: {
            select: {
              id: true,
              title: true,
              price: true
            }
          }
        },
        take: 10
      });

      const result = conversations.map(conv => ({
        id: conv.id,
        least_user_id: conv.least_user_id,
        greatest_user_id: conv.greatest_user_id,
        listing_id: conv.listing_id,
        listing: conv.listings,
        created_at: conv.created_at
      }));

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Mesajları getirme
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Kullanıcı bu konuşmaya dahil mi kontrol et
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          OR: [
            { least_user_id: userId },
            { greatest_user_id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      // Mesajları getir
      const messages = await prisma.messages.findMany({
        where: {
          conversation_id: conversationId
        },
        orderBy: {
          created_at: 'asc'
        },
        take: 50
      });

      return res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            least_user_id: conversation.least_user_id,
            greatest_user_id: conversation.greatest_user_id,
            listing_id: conversation.listing_id
          },
          messages: messages.map(msg => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            body: msg.body,
            created_at: msg.created_at,
            status: msg.status
          }))
        }
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Mesaj gönderme
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { conversationId, body, receiverId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!body || body.trim() === '') {
        return res.status(400).json({ success: false, message: 'Message body required' });
      }

      let conversation;

      // Existing conversation
      if (conversationId) {
        conversation = await prisma.conversations.findFirst({
          where: {
            id: conversationId,
            OR: [
              { least_user_id: userId },
              { greatest_user_id: userId }
            ]
          }
        });

        if (!conversation) {
          return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
      }
      // Create new conversation
      else if (receiverId) {
        const [least, greatest] = [userId, receiverId].sort();
        
        // Check if conversation already exists
        conversation = await prisma.conversations.findFirst({
          where: {
            least_user_id: least,
            greatest_user_id: greatest,
            listing_id: null
          }
        });

        // Create new if doesn't exist
        if (!conversation) {
          conversation = await prisma.conversations.create({
            data: {
              id: ulid(),
              least_user_id: least,
              greatest_user_id: greatest,
              listing_id: null
            }
          });
        }
      } else {
        return res.status(400).json({ success: false, message: 'conversationId or receiverId required' });
      }

      // Create message
      const message = await prisma.messages.create({
        data: {
          id: ulid(),
          conversation_id: conversation.id,
          sender_id: userId,
          body: body.trim(),
          status: 'SENT'
        }
      });

      return res.json({
        success: true,
        data: {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          body: message.body,
          created_at: message.created_at,
          status: message.status
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Test endpoint - create conversation
  static async createConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { receiverId, listingId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'receiverId required' });
      }

      const [least, greatest] = [userId, receiverId].sort();

      // Check if exists
      let conversation = await prisma.conversations.findFirst({
        where: {
          least_user_id: least,
          greatest_user_id: greatest,
          listing_id: listingId || null
        }
      });

      // Create if doesn't exist
      if (!conversation) {
        conversation = await prisma.conversations.create({
          data: {
            id: ulid(),
            least_user_id: least,
            greatest_user_id: greatest,
            listing_id: listingId || null
          }
        });
      }

      return res.json({
        success: true,
        data: {
          id: conversation.id,
          least_user_id: conversation.least_user_id,
          greatest_user_id: conversation.greatest_user_id,
          listing_id: conversation.listing_id,
          created_at: conversation.created_at
        }
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
