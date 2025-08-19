import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  // Konuşma oluştur veya getir
  static async createOrGetConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const current_user_id = req.userId!;
      const { other_user_id, listing_id } = req.body;

      if (!other_user_id) {
        return res.status(400).json({
          success: false,
          message: 'Diğer kullanıcı ID gereklidir.'
        });
      }

      // Kullanıcı ID'lerini sıralayalım (unique constraint için)
      const [least_user_id, greatest_user_id] = [current_user_id, other_user_id].sort();

      // Mevcut konuşma var mı kontrol et
      let conversation = await prisma.conversations.findFirst({
        where: {
          least_user_id,
          greatest_user_id,
          listing_id: listing_id || null
        },
        include: {
          listings: { select: { id: true, title: true } }
        }
      });

      if (!conversation) {
        // Yeni konuşma oluştur
        const conversationId = ulid();
        
        conversation = await prisma.conversations.create({
          data: {
            id: conversationId,
            listing_id: listing_id || null,
            least_user_id,
            greatest_user_id
          },
          include: {
            listings: { select: { id: true, title: true } }
          }
        });

        // Participants oluştur
        await prisma.conversation_participants.createMany({
          data: [
            { id: ulid(), conversation_id: conversationId, user_id: current_user_id },
            { id: ulid(), conversation_id: conversationId, user_id: other_user_id }
          ]
        });

        // Counter oluştur
        await prisma.conversation_counters.create({
          data: { conversation_id: conversationId }
        });

        // Message reads oluştur
        await prisma.message_reads.createMany({
          data: [
            { id: ulid(), conversation_id: conversationId, user_id: current_user_id },
            { id: ulid(), conversation_id: conversationId, user_id: other_user_id }
          ]
        });

        // User unread counters oluştur/güncelle
        await prisma.user_unread_counters.upsert({
          where: { user_id: current_user_id },
          create: { user_id: current_user_id, total_unread: 0 },
          update: {}
        });
        await prisma.user_unread_counters.upsert({
          where: { user_id: other_user_id },
          create: { user_id: other_user_id, total_unread: 0 },
          update: {}
        });

        // Conversation unread counters oluştur
        await prisma.conversation_unread_counters.createMany({
          data: [
            { id: ulid(), conversation_id: conversationId, user_id: current_user_id, unread_count: 0 },
            { id: ulid(), conversation_id: conversationId, user_id: other_user_id, unread_count: 0 }
          ]
        });
      }

      // Başarılı response
      return res.json({
        success: true,
        data: {
          id: conversation.id,
          listing_id: conversation.listing_id,
          least_user_id: conversation.least_user_id,
          greatest_user_id: conversation.greatest_user_id,
          created_at: conversation.created_at,
          listing: conversation.listings
        }
      });

    } catch (error) {
      console.error('Create conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Konuşma oluşturulurken hata oluştu.'
      });
    }
  }

  // Kullanıcının konuşmalarını getir
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [
            { least_user_id: user_id },
            { greatest_user_id: user_id }
          ]
        },
        include: {
          listings: { select: { id: true, title: true, images: true } }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      });

      // Her konuşma için diğer kullanıcı bilgisini al
      const formattedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.least_user_id === user_id ? conv.greatest_user_id : conv.least_user_id;
          
          const otherUser = await prisma.users.findUnique({
            where: { id: otherUserId },
            select: { id: true, first_name: true, last_name: true, avatar: true }
          });

          return {
            id: conv.id,
            listing: conv.listings,
            other_user: otherUser,
            created_at: conv.created_at,
            last_message_preview: null,
            last_message_at: conv.created_at,
            unread_count: 0
          };
        })
      );

      return res.json({
        success: true,
        data: formattedConversations,
        meta: { page, limit, total: formattedConversations.length }
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Konuşmalar getirilirken hata oluştu.'
      });
    }
  }

  // Konuşmanın mesajlarını getir
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.userId!;
      const conversation_id = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Kullanıcının bu konuşmaya erişimi var mı kontrol et
      const participant = await prisma.conversation_participants.findFirst({
        where: {
          conversation_id,
          user_id
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Bu konuşmaya erişim yetkiniz yok.'
        });
      }

      // Mesajları getir
      const messages = await prisma.messages.findMany({
        where: { conversation_id },
        include: {
          sender: {
            select: { id: true, first_name: true, last_name: true, avatar: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        body: msg.body,
        attachment_url: msg.attachment_url,
        status: msg.status,
        created_at: msg.created_at,
        sender: {
          id: msg.sender.id,
          name: `${msg.sender.first_name} ${msg.sender.last_name}`,
          avatar: msg.sender.avatar
        }
      }));

      return res.json({
        success: true,
        data: formattedMessages.reverse(), // En eski mesaj önce
        meta: { page, limit, total: formattedMessages.length }
      });

    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar getirilirken hata oluştu.'
      });
    }
  }

  // Mesaj gönder
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const sender_id = req.userId!;
      const { conversation_id, body, attachment_url } = req.body;

      if (!conversation_id || !body?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Konuşma ID ve mesaj içeriği gereklidir.'
        });
      }

      // Kullanıcının bu konuşmaya erişimi var mı kontrol et
      const participant = await prisma.conversation_participants.findFirst({
        where: {
          conversation_id,
          user_id: sender_id
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Bu konuşmaya mesaj gönderme yetkiniz yok.'
        });
      }

      // Mesaj oluştur
      const message = await prisma.messages.create({
        data: {
          id: ulid(),
          conversation_id,
          sender_id,
          body: body.trim(),
          attachment_url: attachment_url || null,
          status: 'SENT'
        },
        include: {
          sender: {
            select: { id: true, first_name: true, last_name: true, avatar: true }
          }
        }
      });

      // Conversation counter güncelle
      await prisma.conversation_counters.upsert({
        where: { conversation_id },
        create: {
          conversation_id,
          last_message_id: message.id,
          last_message_preview: body.substring(0, 160),
          last_message_at: new Date()
        },
        update: {
          last_message_id: message.id,
          last_message_preview: body.substring(0, 160),
          last_message_at: new Date()
        }
      });

      // Diğer kullanıcıların unread counter'larını artır
      await prisma.conversation_unread_counters.updateMany({
        where: {
          conversation_id,
          user_id: { not: sender_id }
        },
        data: {
          unread_count: { increment: 1 }
        }
      });

      // Socket ile mesajı yayınla (varsa)
      if (req.io) {
        req.io.to(`conversation:${conversation_id}`).emit('new_message', {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          body: message.body,
          attachment_url: message.attachment_url,
          status: message.status,
          created_at: message.created_at,
          sender: {
            id: message.sender.id,
            name: `${message.sender.first_name} ${message.sender.last_name}`,
            avatar: message.sender.avatar
          }
        });
      }

      return res.json({
        success: true,
        data: {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          body: message.body,
          attachment_url: message.attachment_url,
          status: message.status,
          created_at: message.created_at,
          sender: {
            id: message.sender.id,
            name: `${message.sender.first_name} ${message.sender.last_name}`,
            avatar: message.sender.avatar
          }
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesaj gönderilirken hata oluştu.'
      });
    }
  }

  // Mesajları okundu olarak işaretle
  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.userId!;
      const conversation_id = req.params.id;

      // Kullanıcının bu konuşmaya erişimi var mı kontrol et
      const participant = await prisma.conversation_participants.findFirst({
        where: {
          conversation_id,
          user_id
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Bu konuşmaya erişim yetkiniz yok.'
        });
      }

      // En son mesajı bul
      const lastMessage = await prisma.messages.findFirst({
        where: { conversation_id },
        orderBy: { created_at: 'desc' }
      });

      if (lastMessage) {
        // Message read güncelle
        await prisma.message_reads.upsert({
          where: {
            conversation_id_user_id: {
              conversation_id,
              user_id
            }
          },
          create: {
            id: ulid(),
            conversation_id,
            user_id,
            last_read_message_id: lastMessage.id
          },
          update: {
            last_read_message_id: lastMessage.id
          }
        });
      }

      // Conversation unread counter sıfırla
      await prisma.conversation_unread_counters.updateMany({
        where: {
          conversation_id,
          user_id
        },
        data: {
          unread_count: 0
        }
      });

      // Socket ile okundu bilgisini yayınla (varsa)
      if (req.io) {
        req.io.to(`conversation:${conversation_id}`).emit('messages_read', {
          conversation_id,
          user_id
        });
      }

      return res.json({
        success: true,
        message: 'Mesajlar okundu olarak işaretlendi.'
      });

    } catch (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar okundu olarak işaretlenirken hata oluştu.'
      });
    }
  }

  // Kullanıcının toplam okunmamış mesaj sayısı
  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const user_id = req.userId!;

      const totalUnread = await prisma.conversation_unread_counters.aggregate({
        where: { user_id },
        _sum: { unread_count: true }
      });

      return res.json({
        success: true,
        data: {
          total_unread: totalUnread._sum.unread_count || 0
        }
      });

    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json({
        success: false,
        message: 'Okunmamış mesaj sayısı alınırken hata oluştu.'
      });
    }
  }
}
