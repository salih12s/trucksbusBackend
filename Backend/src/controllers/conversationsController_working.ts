import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  
  // Kullanıcının konuşmalarını getir (mevcut DB yapısına uygun)
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Mevcut veritabanındaki gerçek field isimlerini kullan
      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [
            { participant1_id: userId },
            { participant2_id: userId }
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
        orderBy: {
          updated_at: 'desc'
        },
        take: 20
      });

      const result = conversations.map(conv => ({
        id: conv.id,
        participant1_id: conv.participant1_id,
        participant2_id: conv.participant2_id,
        listing_id: conv.listing_id,
        listing: conv.listings,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at
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

  // Konuşmanın mesajlarını getir
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Kullanıcının bu konuşmaya erişimi var mı kontrol et
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1_id: userId },
            { participant2_id: userId }
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
        }
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      // Mesajları getir - Prisma model ismi 'message' değil 'messages' olabilir
      const messages = await prisma.message.findMany({
        where: {
          conversation_id: conversationId
        },
        orderBy: {
          created_at: 'asc'
        },
        take: 100
      });

      return res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            participant1_id: conversation.participant1_id,
            participant2_id: conversation.participant2_id,
            listing_id: conversation.listing_id,
            listing: conversation.listings
          },
          messages: messages.map(msg => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            is_read: msg.is_read,
            is_edited: msg.is_edited
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

  // Mesaj gönder
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { conversationId, body, receiverId, listingId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!body || body.trim() === '') {
        return res.status(400).json({ success: false, message: 'Message body required' });
      }

      let conversation;

      // Mevcut konuşma varsa kullan
      if (conversationId) {
        conversation = await prisma.conversations.findFirst({
          where: {
            id: conversationId,
            OR: [
              { participant1_id: userId },
              { participant2_id: userId }
            ]
          }
        });

        if (!conversation) {
          return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
      }
      // Yeni konuşma oluştur
      else if (receiverId) {
        // Mevcut konuşma var mı kontrol et
        conversation = await prisma.conversations.findFirst({
          where: {
            OR: [
              { participant1_id: userId, participant2_id: receiverId, listing_id: listingId || null },
              { participant1_id: receiverId, participant2_id: userId, listing_id: listingId || null }
            ]
          }
        });

        // Yoksa yeni oluştur
        if (!conversation) {
          conversation = await prisma.conversations.create({
            data: {
              id: ulid(),
              participant1_id: userId,
              participant2_id: receiverId,
              listing_id: listingId || null,
              last_message_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      } else {
        return res.status(400).json({ success: false, message: 'conversationId or receiverId required' });
      }

      // Mesajı oluştur
      const message = await prisma.message.create({
        data: {
          id: ulid(),
          conversation_id: conversation.id,
          sender_id: userId,
          content: body.trim(),
          is_read: false,
          is_edited: false,
          updated_at: new Date()
        }
      });

      // Konuşmayı güncelle
      await prisma.conversations.update({
        where: { id: conversation.id },
        data: {
          last_message_at: new Date(),
          updated_at: new Date()
        }
      });

      return res.json({
        success: true,
        data: {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          created_at: message.created_at,
          is_read: message.is_read,
          is_edited: message.is_edited
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

  // Konuşma oluştur (test için)
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

      // Mevcut konuşma kontrol et
      let conversation = await prisma.conversations.findFirst({
        where: {
          OR: [
            { participant1_id: userId, participant2_id: receiverId, listing_id: listingId || null },
            { participant1_id: receiverId, participant2_id: userId, listing_id: listingId || null }
          ]
        }
      });

      // Yoksa yeni oluştur
      if (!conversation) {
        conversation = await prisma.conversations.create({
          data: {
            id: ulid(),
            participant1_id: userId,
            participant2_id: receiverId,
            listing_id: listingId || null,
            last_message_at: null,
            updated_at: new Date()
          }
        });
      }

      return res.json({
        success: true,
        data: {
          id: conversation.id,
          participant1_id: conversation.participant1_id,
          participant2_id: conversation.participant2_id,
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
