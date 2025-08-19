import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
  io?: any;
}

export class ConversationsController {
  
  // Kullanıcının konuşmalarını getir
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

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
          },
          conversation_counters: {
            select: {
              last_message_at: true,
              last_message_preview: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        least_user_id: conv.least_user_id,
        greatest_user_id: conv.greatest_user_id,
        listing_id: conv.listing_id,
        listing: conv.listings,
        last_message_at: conv.conversation_counters?.last_message_at || conv.created_at,
        last_message_preview: conv.conversation_counters?.last_message_preview,
        created_at: conv.created_at
      }));

      return res.json({
        success: true,
        data: formattedConversations
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Konuşmalar alınırken hata oluştu.'
      });
    }
  }

  // Konuşma mesajlarını getir
  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check if user is participant
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
        return res.status(404).json({
          success: false,
          message: 'Konuşma bulunamadı veya erişim yetkiniz yok.'
        });
      }

      const messages = await prisma.messages.findMany({
        where: {
          conversation_id: conversationId
        },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
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
          id: msg.users.id,
          name: `${msg.users.first_name} ${msg.users.last_name}`,
          avatar: msg.users.avatar
        }
      }));

      return res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            least_user_id: conversation.least_user_id,
            greatest_user_id: conversation.greatest_user_id,
            listing_id: conversation.listing_id
          },
          messages: formattedMessages
        }
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar alınırken hata oluştu.'
      });
    }
  }

  // Mesaj gönder
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { conversationId, content, attachment_url } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Mesaj içeriği boş olamaz.'
        });
      }

      // Check if user is participant
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
        return res.status(404).json({
          success: false,
          message: 'Konuşma bulunamadı veya erişim yetkiniz yok.'
        });
      }

      // Create message with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create message
        const message = await tx.messages.create({
          data: {
            id: ulid(),
            conversation_id: conversationId,
            sender_id: userId,
            body: content,
            attachment_url: attachment_url || null,
            status: 'SENT'
          },
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                avatar: true
              }
            }
          }
        });

        // Update conversation counters
        await tx.conversation_counters.upsert({
          where: {
            conversation_id: conversationId
          },
          create: {
            id: ulid(),
            conversation_id: conversationId,
            last_message_id: message.id,
            last_message_preview: content.substring(0, 160),
            last_message_at: new Date()
          },
          update: {
            last_message_id: message.id,
            last_message_preview: content.substring(0, 160),
            last_message_at: new Date()
          }
        });

        // Update unread counters for the other user
        const otherUserId = conversation.least_user_id === userId 
          ? conversation.greatest_user_id 
          : conversation.least_user_id;

        await tx.conversation_unread_counters.upsert({
          where: {
            conversation_id_user_id: {
              conversation_id: conversationId,
              user_id: otherUserId
            }
          },
          create: {
            id: ulid(),
            conversation_id: conversationId,
            user_id: otherUserId,
            unread_count: 1
          },
          update: {
            unread_count: { increment: 1 }
          }
        });

        return message;
      });

      // Socket emit if available
      if (req.io) {
        req.io.to(`conversation:${conversationId}`).emit('new_message', {
          id: result.id,
          conversation_id: result.conversation_id,
          sender_id: result.sender_id,
          body: result.body,
          attachment_url: result.attachment_url,
          status: result.status,
          created_at: result.created_at,
          sender: {
            id: result.users.id,
            name: `${result.users.first_name} ${result.users.last_name}`,
            avatar: result.users.avatar
          }
        });
      }

      return res.json({
        success: true,
        data: {
          id: result.id,
          conversation_id: result.conversation_id,
          sender_id: result.sender_id,
          body: result.body,
          attachment_url: result.attachment_url,
          status: result.status,
          created_at: result.created_at,
          sender: {
            id: result.users.id,
            name: `${result.users.first_name} ${result.users.last_name}`,
            avatar: result.users.avatar
          }
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesaj gönderilirken hata oluştu.'
      });
    }
  }

  // Konuşma oluştur veya getir
  static async createOrGetConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { listingId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!listingId) {
        return res.status(400).json({
          success: false,
          message: 'Listing ID gerekli.'
        });
      }

      // Get listing to find other user
      const listing = await prisma.listings.findUnique({
        where: { id: listingId },
        select: { id: true, user_id: true, title: true }
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'İlan bulunamadı.'
        });
      }

      if (listing.user_id === userId) {
        return res.status(400).json({
          success: false,
          message: 'Kendi ilanınızla mesajlaşamazsınız.'
        });
      }

      // Sort user IDs for consistent least/greatest
      const [leastUserId, greatestUserId] = [userId, listing.user_id].sort();

      // Check for existing conversation
      let conversation = await prisma.conversations.findFirst({
        where: {
          least_user_id: leastUserId,
          greatest_user_id: greatestUserId,
          listing_id: listingId
        }
      });

      if (conversation) {
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
      }

      // Create new conversation
      conversation = await prisma.$transaction(async (tx) => {
        const newConversation = await tx.conversations.create({
          data: {
            id: ulid(),
            least_user_id: leastUserId,
            greatest_user_id: greatestUserId,
            listing_id: listingId
          }
        });

        // Create participants
        await tx.conversation_participants.createMany({
          data: [
            {
              id: ulid(),
              conversation_id: newConversation.id,
              user_id: userId
            },
            {
              id: ulid(),
              conversation_id: newConversation.id,
              user_id: listing.user_id
            }
          ]
        });

        // Initialize unread counters
        await tx.conversation_unread_counters.createMany({
          data: [
            {
              id: ulid(),
              conversation_id: newConversation.id,
              user_id: userId,
              unread_count: 0
            },
            {
              id: ulid(),
              conversation_id: newConversation.id,
              user_id: listing.user_id,
              unread_count: 0
            }
          ]
        });

        return newConversation;
      });

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
        message: 'Konuşma oluşturulurken hata oluştu.'
      });
    }
  }

  // Mesajları okundu olarak işaretle
  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check if user is participant
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
        return res.status(404).json({
          success: false,
          message: 'Konuşma bulunamadı veya erişim yetkiniz yok.'
        });
      }

      await prisma.$transaction(async (tx) => {
        // Reset unread count for this conversation
        await tx.conversation_unread_counters.upsert({
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
            unread_count: 0
          }
        });

        // Update message reads
        const lastMessage = await tx.messages.findFirst({
          where: { conversation_id: conversationId },
          orderBy: { created_at: 'desc' }
        });

        if (lastMessage) {
          await tx.message_reads.upsert({
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
              last_read_message_id: lastMessage.id
            },
            update: {
              last_read_message_id: lastMessage.id
            }
          });
        }
      });

      return res.json({
        success: true,
        message: 'Mesajlar okundu olarak işaretlendi.'
      });

    } catch (error) {
      console.error('Error marking as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar işaretlenirken hata oluştu.'
      });
    }
  }

  // Kullanıcının toplam okunmamış mesaj sayısı
  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const unreadCounter = await prisma.user_unread_counters.findUnique({
        where: { user_id: userId }
      });

      return res.json({
        success: true,
        data: {
          total_unread: unreadCounter?.total_unread || 0
        }
      });

    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({
        success: false,
        message: 'Okunmamış mesaj sayısı alınırken hata oluştu.'
      });
    }
  }
}
