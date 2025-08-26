import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';
import { SocketService } from '../services/socketService';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    username: string | null;
  };
}

export class ConversationsController {
  
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Get conversations where user is a participant and not hidden by this user
      // @ts-ignore - Prisma model type issue
      const rawConversations = await prisma.conversations.findMany({
        where: {
          OR: [
            // @ts-ignore - Prisma model type issue
            { least_user_id: userId },
            // @ts-ignore - Prisma model type issue
            { greatest_user_id: userId }
          ],
          // Exclude conversations hidden by this user
          NOT: {
            conversation_hidden: {
              some: {
                user_id: userId
              }
            }
          }
        },
        take: 20,
        orderBy: { created_at: 'desc' }
      });

      // Process conversations to add participant info
      const conversations = [];
      
      for (const conv of rawConversations) {
        // Determine the other participant ID
        // @ts-ignore - Prisma model type issue
        const otherParticipantId = conv.least_user_id === userId 
          // @ts-ignore - Prisma model type issue
          ? conv.greatest_user_id 
          // @ts-ignore - Prisma model type issue
          : conv.least_user_id;

        // Get other participant details
        // @ts-ignore - Prisma model type issue
        const otherParticipant = await prisma.users.findUnique({
          where: { id: otherParticipantId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true
          }
        });

        // Get listing details if exists
        let listing = null;
        if (conv.listing_id) {
          // @ts-ignore - Prisma model type issue
          listing = await prisma.listings.findUnique({
            where: { id: conv.listing_id },
            select: {
              id: true,
              title: true,
              price: true,
              images: true
            }
          });
        }

        // Get last message
        // @ts-ignore - Prisma model type issue
        const lastMessage = await prisma.messages.findFirst({
          where: { conversation_id: conv.id },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            body: true,
            created_at: true,
            sender_id: true
          }
        });

        // Get unread count for this user
        // @ts-ignore - Prisma model type issue
        const unreadCounter = await prisma.conversation_unread_counters.findUnique({
          where: { 
            conversation_id_user_id: { 
              conversation_id: conv.id, 
              user_id: userId 
            } 
          },
          select: { unread_count: true }
        });

        const processedConversation = {
          id: conv.id,
          // @ts-ignore - Prisma model type issue
          least_user_id: conv.least_user_id,
          // @ts-ignore - Prisma model type issue
          greatest_user_id: conv.greatest_user_id,
          // @ts-ignore - Prisma model type issue
          listing_id: conv.listing_id,
          created_at: conv.created_at,
          otherParticipant: otherParticipant ? {
            id: otherParticipant.id,
            first_name: otherParticipant.first_name,
            last_name: otherParticipant.last_name,
            username: otherParticipant.username
          } : null,
          listing: listing,
          lastMessage: lastMessage ? {
            content: lastMessage.body,
            created_at: lastMessage.created_at,
            sender_id: lastMessage.sender_id,
            sender_name: lastMessage.sender_id === userId ? 'Sen' : 
              (otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Bilinmeyen')
          } : null,
          unreadCount: unreadCounter?.unread_count || 0
        };

        conversations.push(processedConversation);
      }

      return res.json({
        success: true,
        conversations: conversations
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // @ts-ignore - Prisma model type issue
      const messages = await prisma.messages.findMany({
        where: {
          conversation_id: conversationId
        },
        orderBy: { created_at: 'asc' },
        take: 100,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      });

      // Map database fields to API response format
      const formattedMessages = messages.map((message: any) => ({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.body, // Map body to content for frontend
        created_at: message.created_at,
        users: message.users
      }));

      return res.json({
        success: true,
        messages: formattedMessages
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      const { content } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!content) {
        return res.status(400).json({ success: false, message: 'Message content required' });
      }

      console.log(`📤 Sending message from user ${userId} to conversation ${conversationId}`);

      // Check conversation exists and user is participant
      // @ts-ignore - Prisma model type issue
      const conv = await prisma.conversations.findUnique({ 
        where: { id: conversationId } 
      });

      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      // @ts-ignore - Prisma field names issue
      const isParticipant = [conv.least_user_id, conv.greatest_user_id].includes(userId);
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Not a participant' });
      }

      // @ts-ignore - Prisma field names issue
      const receiverIds = [conv.least_user_id, conv.greatest_user_id].filter(id => id !== userId);

      const result = await prisma.$transaction(async (tx) => {
        // UNHIDE: receiver'lar için konuşmayı geri görünür yap
        if (receiverIds.length) {
          // @ts-ignore - Prisma model type issue
          await tx.conversation_hidden.deleteMany({
            where: { 
              conversation_id: conversationId, 
              user_id: { in: receiverIds } 
            }
          });
        }

        // Mesaj oluştur
        // @ts-ignore - Prisma model type issue
        const message = await tx.messages.create({
          data: {
            id: ulid(),
            conversation_id: conversationId,
            sender_id: userId,
            body: content,
            status: 'SENT'
          }
        });

        // Unread counters: receiver'lar için +1
        for (const receiverId of receiverIds) {
          // @ts-ignore - Prisma model type issue
          await tx.conversation_unread_counters.upsert({
            where: { 
              conversation_id_user_id: { 
                conversation_id: conversationId, 
                user_id: receiverId 
              } 
            },
            create: { 
              id: ulid(), 
              conversation_id: conversationId, 
              user_id: receiverId, 
              unread_count: 1 
            },
            update: { 
              unread_count: { increment: 1 },
              updated_at: new Date()
            }
          });
        }

        // Total'leri güncelle (receiver bazında)
        for (const receiverId of receiverIds) {
          // @ts-ignore - Prisma model type issue
          const total = await tx.conversation_unread_counters.aggregate({
            _sum: { unread_count: true },
            where: { user_id: receiverId }
          });
          const sum = total._sum.unread_count || 0;

          // @ts-ignore - Prisma model type issue
          await tx.user_unread_counters.upsert({
            where: { user_id: receiverId },
            create: { user_id: receiverId, total_unread: sum },
            update: { total_unread: sum, updated_at: new Date() }
          });
        }

        return { message };
      });

      // SOCKET yayınları
      const socketService = req.app.get('socketService') as SocketService;
      if (socketService) {
        // Sender bilgisini de ekle
        const sender = await prisma.users.findUnique({
          where: { id: userId },
          select: { id: true, first_name: true, last_name: true, username: true }
        });

        const formattedMessage = {
          id: result.message.id,
          conversation_id: result.message.conversation_id,
          sender_id: result.message.sender_id,
          content: result.message.body,
          created_at: result.message.created_at,
          users: sender // ✅ Frontend'in beklediği sender bilgisi
        };

        console.log(`🔔 Broadcasting message to conversation:${conversationId}`, formattedMessage);

        // 1) Sohbet odasına mesaj - RESTful yayını
        socketService.getIO()
          .to(`conversation:${conversationId}`)
          .emit('message:new', { conversation_id: conversationId, message: formattedMessage });

        // 2) Receiver'lara gerçek total ile badge
        for (const receiverId of receiverIds) {
          // @ts-ignore - Prisma model type issue
          const total = await prisma.user_unread_counters.findUnique({ 
            where: { user_id: receiverId } 
          });
          socketService.getIO()
            .to(`user:${receiverId}`)
            .emit('badge:update', { total_unread: total?.total_unread || 0 });

          // 3) "Konuşma geri geldi/güncellendi" bildir
          socketService.getIO()
            .to(`user:${receiverId}`)
            .emit('conversation:upsert', {
              id: conversationId,
              lastMessage: {
                content: formattedMessage.content,
                created_at: formattedMessage.created_at,
                sender_id: formattedMessage.sender_id,
              }
            });
        }
      }

      return res.json({
        success: true,
        message: {
          id: result.message.id,
          conversation_id: result.message.conversation_id,
          sender_id: result.message.sender_id,
          content: result.message.body,
          created_at: result.message.created_at
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

  static async createConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { receiverId, listingId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Simple create without complex where clauses for now
      const conversation = await prisma.conversations.create({
        data: {
          id: ulid(),
          least_user_id: userId < receiverId ? userId : receiverId,
          greatest_user_id: userId > receiverId ? userId : receiverId,
          listing_id: listingId || null
        } as any
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

  // Route compatibility methods
  static async createOrGetConversation(req: AuthenticatedRequest, res: Response) {
    return ConversationsController.createConversation(req, res);
  }

  static async createConversationFromListing(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { listingId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!listingId) {
        return res.status(400).json({ 
          success: false, 
          message: 'listingId is required' 
        });
      }

      // Get listing details to find the owner (receiver)
      // @ts-ignore - Prisma model type issue
      const listing = await prisma.listings.findUnique({
        where: { id: listingId }
      });

      if (!listing) {
        return res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }

      const receiverId = listing.user_id;

      // Check if user is trying to message their own listing
      if (userId === receiverId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot message your own listing' 
        });
      }

      // İki kullanıcı arasındaki mevcut konuşmayı kontrol et
      const leastUserId = userId < receiverId ? userId : receiverId;
      const greatestUserId = userId < receiverId ? receiverId : userId;

      // @ts-ignore - Prisma model type issue
      let conversation = await prisma.conversations.findFirst({
        where: {
          // @ts-ignore - Prisma model type issue
          least_user_id: leastUserId,
          // @ts-ignore - Prisma model type issue
          greatest_user_id: greatestUserId
        }
      });

      // Konuşma yoksa oluştur
      if (!conversation) {
        // @ts-ignore - Prisma model type issue
        conversation = await prisma.conversations.create({
          data: {
            id: ulid(),
            // @ts-ignore - Prisma model type issue
            least_user_id: leastUserId,
            // @ts-ignore - Prisma model type issue
            greatest_user_id: greatestUserId,
            // @ts-ignore - Prisma model type issue
            listing_id: listingId
          }
        });
      }

      return res.json({
        success: true,
        conversation: conversation
      });

    } catch (error) {
      console.error('Error creating conversation from listing:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!conversationId) {
        return res.status(400).json({ success: false, message: 'Conversation ID required' });
      }

      // Bu kullanıcının bu konuşmadaki unread'ini 0la
      // @ts-ignore - Prisma model type issue
      await prisma.conversation_unread_counters.upsert({
        where: { 
          conversation_id_user_id: { 
            conversation_id: conversationId, 
            user_id: userId 
          } 
        },
        create: { 
          id: ulid(), 
          conversation_id: conversationId, 
          user_id: userId, 
          unread_count: 0 
        },
        update: { 
          unread_count: 0,
          updated_at: new Date()
        }
      });

      // Total'i yeniden hesapla
      // @ts-ignore - Prisma model type issue
      const totalAgg = await prisma.conversation_unread_counters.aggregate({
        _sum: { unread_count: true },
        where: { user_id: userId }
      });
      const sum = totalAgg._sum.unread_count || 0;

      // @ts-ignore - Prisma model type issue
      await prisma.user_unread_counters.upsert({
        where: { user_id: userId },
        create: { user_id: userId, total_unread: sum },
        update: { total_unread: sum, updated_at: new Date() }
      });

      // Badge güncelle
      const socketService = req.app.get('socketService') as SocketService;
      if (socketService) {
        socketService.getIO()
          .to(`user:${userId}`)
          .emit('badge:update', { total_unread: sum });
      }

      return res.json({ success: true, message: 'Read status updated' });

    } catch (error) {
      console.error('Error marking as read:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to mark as read' 
      });
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // User'ın toplam unread count'unu al
      // @ts-ignore - Prisma model type issue
      const userUnreadCounter = await prisma.user_unread_counters.findUnique({
        where: { user_id: userId },
        select: { total_unread: true }
      });

      const totalUnread = userUnreadCounter?.total_unread || 0;

      return res.json({ 
        success: true, 
        data: { count: totalUnread } 
      });

    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get unread count' 
      });
    }
  }

  static async deleteConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!conversationId) {
        return res.status(400).json({ success: false, message: 'Conversation ID required' });
      }

      // Check if conversation exists and user is a participant
      // @ts-ignore - Prisma model type issue
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          OR: [
            // @ts-ignore - Prisma model type issue
            { least_user_id: userId },
            // @ts-ignore - Prisma model type issue
            { greatest_user_id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      // WhatsApp-style deletion: Hide conversation for this user only
      // If they already have it hidden, update the timestamp
      // @ts-ignore - Prisma model type issue
      await prisma.conversation_hidden.upsert({
        where: {
          conversation_id_user_id: {
            conversation_id: conversationId,
            user_id: userId
          }
        },
        update: {
          hidden_at: new Date()
        },
        create: {
          id: ulid(),
          conversation_id: conversationId,
          user_id: userId,
          hidden_at: new Date()
        }
      });

      // Gizlenen konuşmanın unread sayacını sıfırla
      // @ts-ignore - Prisma model type issue
      await prisma.conversation_unread_counters.upsert({
        where: { 
          conversation_id_user_id: { 
            conversation_id: conversationId, 
            user_id: userId 
          } 
        },
        create: { 
          id: ulid(), 
          conversation_id: conversationId, 
          user_id: userId, 
          unread_count: 0 
        },
        update: { 
          unread_count: 0,
          updated_at: new Date()
        }
      });

      // Total'i yeniden hesapla
      // @ts-ignore - Prisma model type issue
      const totalAgg = await prisma.conversation_unread_counters.aggregate({
        _sum: { unread_count: true },
        where: { user_id: userId }
      });
      const sum = totalAgg._sum.unread_count || 0;

      // @ts-ignore - Prisma model type issue
      await prisma.user_unread_counters.upsert({
        where: { user_id: userId },
        create: { user_id: userId, total_unread: sum },
        update: { total_unread: sum, updated_at: new Date() }
      });

      // Badge güncelle
      const socketService = req.app.get('socketService') as SocketService;
      if (socketService) {
        socketService.getIO()
          .to(`user:${userId}`)
          .emit('badge:update', { total_unread: sum });
      }

      return res.json({ 
        success: true, 
        message: 'Conversation hidden successfully' 
      });

    } catch (error) {
      console.error('Error hiding conversation:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to hide conversation' 
      });
    }
  }
}

export default ConversationsController;
