import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

interface ConversationResponse {
  id: string;
  least_user_id: string;
  greatest_user_id: string;
  listing_id: string | null;
  other_participant: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  };
}

export class ConversationController {
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [
            { least_user_id: userId },
            { greatest_user_id: userId }
          ]
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  avatar: true
                }
              }
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              listing_images: {
                take: 1,
                orderBy: { sort_order: 'asc' },
                select: { url: true }
              },
              images: true
            }
          },
          counters: {
            select: {
              last_message_at: true,
              last_message_preview: true
            }
          },
          unread_counters: {
            where: { user_id: userId },
            select: { unread_count: true }
          }
        },
        orderBy: [
          { counters: { last_message_at: 'desc' } }
        ],
        skip: offset,
        take: limit
      });

      const formattedConversations = conversations.map(conversation => {
        const otherParticipant = conversation.participants.find(p => p.user_id !== userId)?.user;
        const unreadCounter = conversation.unread_counters.find(c => c.user_id === userId);

        let imageUrl = '';
        
        if (conversation.listing) {
          if (conversation.listing.listing_images && conversation.listing.listing_images.length > 0) {
            imageUrl = conversation.listing.listing_images[0].url;
          }
          // Fallback for legacy images stored as JSON
          else if (conversation.listing.images && Array.isArray(conversation.listing.images)) {
            const jsonImages = conversation.listing.images as string[];
            if (jsonImages.length > 0) {
              imageUrl = jsonImages[0];
            }
          }
        }

        const response: ConversationResponse = {
          id: conversation.id,
          least_user_id: conversation.least_user_id,
          greatest_user_id: conversation.greatest_user_id,
          listing_id: conversation.listing_id,
          other_participant: otherParticipant ? {
            id: otherParticipant.id,
            name: `${otherParticipant.first_name} ${otherParticipant.last_name}`,
            avatar: otherParticipant.avatar || undefined
          } : null,
          unread_count: unreadCounter?.unread_count || 0,
          last_message_at: conversation.counters?.last_message_at?.toISOString() || null,
          last_message_preview: conversation.counters?.last_message_preview || null,
          created_at: conversation.created_at.toISOString(),
          listing: conversation.listing ? {
            id: conversation.listing.id,
            title: conversation.listing.title,
            price: Number(conversation.listing.price),
            imageUrl
          } : undefined
        };

        return response;
      });

      return res.json({
        success: true,
        data: formattedConversations,
        meta: {
          page,
          limit,
          total: formattedConversations.length
        }
      });

    } catch (error) {
      console.error('Error getting user conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Konuşmalar alınırken hata oluştu.'
      });
    }
  }

  static async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const conversationId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Check if user is a participant
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: { user_id: userId }
          }
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              listing_images: {
                take: 1,
                orderBy: { sort_order: 'asc' },
                select: { url: true }
              },
              images: true
            }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Konuşma bulunamadı.'
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          conversation_id: conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      });

      // Get conversation metadata
      let imageUrl = '';
      
      if (conversation.listing) {
        if (conversation.listing.listing_images && conversation.listing.listing_images.length > 0) {
          imageUrl = conversation.listing.listing_images[0].url;
        }
        // Fallback for legacy images stored as JSON
        else if (conversation.listing.images && Array.isArray(conversation.listing.images)) {
          const jsonImages = conversation.listing.images as string[];
          if (jsonImages.length > 0) {
            imageUrl = jsonImages[0];
          }
        }
      }

      const conversationInfo = {
        id: conversation.id,
        least_user_id: conversation.least_user_id,
        greatest_user_id: conversation.greatest_user_id,
        listing_id: conversation.listing_id,
        created_at: conversation.created_at.toISOString(),
        listing: conversation.listing ? {
          id: conversation.listing.id,
          title: conversation.listing.title,
          price: Number(conversation.listing.price),
          imageUrl
        } : null
      };

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        body: msg.body,
        attachment_url: msg.attachment_url,
        status: msg.status,
        created_at: msg.created_at.toISOString(),
        sender: {
          id: msg.sender.id,
          name: `${msg.sender.first_name} ${msg.sender.last_name}`,
          avatar: msg.sender.avatar
        }
      }));

      return res.json({
        success: true,
        data: {
          conversation: conversationInfo,
          messages: formattedMessages.reverse() // En eski mesaj önce
        },
        meta: {
          page,
          limit,
          total: formattedMessages.length
        }
      });

    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar alınırken hata oluştu.'
      });
    }
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.userId!;
      const { conversationId, receiverId, content, attachment_url } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Mesaj içeriği boş olamaz.'
        });
      }

      let conversation;

      if (conversationId) {
        // Existing conversation - verify participant
        conversation = await prisma.conversations.findFirst({
          where: {
            id: conversationId,
            participants: {
              some: { user_id: senderId }
            }
          }
        });

        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: 'Konuşma bulunamadı.'
          });
        }
      } else if (receiverId) {
        // Create new conversation between two users
        const [leastUserId, greatestUserId] = [senderId, receiverId].sort();
        
        conversation = await prisma.conversations.findFirst({
          where: {
            least_user_id: leastUserId,
            greatest_user_id: greatestUserId,
            listing_id: null
          }
        });

        if (!conversation) {
          // Create new conversation
          const result = await prisma.$transaction(async (tx) => {
            const newConversation = await tx.conversations.create({
              data: {
                id: ulid(),
                least_user_id: leastUserId,
                greatest_user_id: greatestUserId,
                listing_id: null
              }
            });

            // Add participants
            await tx.conversation_participants.createMany({
              data: [
                {
                  conversation_id: newConversation.id,
                  user_id: senderId
                },
                {
                  conversation_id: newConversation.id,
                  user_id: receiverId
                }
              ]
            });

            // Initialize unread counters
            await tx.conversation_unread_counters.createMany({
              data: [
                {
                  conversation_id: newConversation.id,
                  user_id: senderId,
                  unread_count: 0
                },
                {
                  conversation_id: newConversation.id,
                  user_id: receiverId,
                  unread_count: 0
                }
              ]
            });

            return newConversation;
          });

          conversation = result;
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'ConversationId veya receiverId gerekli.'
        });
      }

      // Send message
      const result = await prisma.$transaction(async (tx) => {
        // Create message
        const message = await tx.message.create({
          data: {
            id: ulid(),
            conversation_id: conversation!.id,
            sender_id: senderId,
            body: content,
            attachment_url: attachment_url || null,
            status: 'SENT'
          },
          include: {
            sender: {
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
          where: { conversation_id: conversation!.id },
          create: {
            conversation_id: conversation!.id,
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

        // Update unread counters for receiver(s)
        await tx.conversation_unread_counters.updateMany({
          where: {
            conversation_id: conversation!.id,
            user_id: { not: senderId }
          },
          data: {
            unread_count: { increment: 1 }
          }
        });

        // Update total unread counter for receiver(s)
        const receiverIds = conversation!.least_user_id === senderId ? 
          [conversation!.greatest_user_id] : 
          [conversation!.least_user_id];

        for (const receiverId of receiverIds) {
          await tx.user_unread_counters.upsert({
            where: { user_id: receiverId },
            create: {
              user_id: receiverId,
              total_unread: 1
            },
            update: {
              total_unread: { increment: 1 }
            }
          });
        }

        return message;
      });

      // Emit socket event if available
      if (req.io) {
        req.io.to(`conversation:${conversation.id}`).emit('new_message', {
          id: result.id,
          conversation_id: result.conversation_id,
          sender_id: result.sender_id,
          body: result.body,
          attachment_url: result.attachment_url,
          status: result.status,
          created_at: result.created_at.toISOString(),
          sender: {
            id: result.sender.id,
            name: `${result.sender.first_name} ${result.sender.last_name}`,
            avatar: result.sender.avatar
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
          created_at: result.created_at.toISOString(),
          sender: {
            id: result.sender.id,
            name: `${result.sender.first_name} ${result.sender.last_name}`,
            avatar: result.sender.avatar
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

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const conversationId = req.params.id;

      // Verify user is a participant
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: { user_id: userId }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Konuşma bulunamadı.'
        });
      }

      await prisma.$transaction(async (tx) => {
        // Reset conversation unread counter for this user
        await tx.conversation_unread_counters.upsert({
          where: {
            conversation_id_user_id: {
              conversation_id: conversationId,
              user_id: userId
            }
          },
          create: {
            conversation_id: conversationId,
            user_id: userId,
            unread_count: 0
          },
          update: {
            unread_count: 0
          }
        });

        // Update user's total unread counter
        const totalUnread = await tx.conversation_unread_counters.aggregate({
          where: { user_id: userId },
          _sum: { unread_count: true }
        });

        await tx.user_unread_counters.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            total_unread: totalUnread._sum.unread_count || 0
          },
          update: {
            total_unread: totalUnread._sum.unread_count || 0
          }
        });

        // Update message reads
        const latestMessage = await tx.message.findFirst({
          where: { conversation_id: conversationId },
          orderBy: { created_at: 'desc' }
        });

        if (latestMessage) {
          await tx.message_reads.upsert({
            where: {
              conversation_id_user_id: {
                conversation_id: conversationId,
                user_id: userId
              }
            },
            create: {
              conversation_id: conversationId,
              user_id: userId,
              last_read_message_id: latestMessage.id
            },
            update: {
              last_read_message_id: latestMessage.id
            }
          });
        }
      });

      // Emit socket event if available
      if (req.io) {
        req.io.to(`user:${userId}`).emit('messages_read', {
          conversation_id: conversationId
        });
      }

      return res.json({
        success: true,
        message: 'Mesajlar okundu olarak işaretlendi.'
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Mesajlar okundu olarak işaretlenirken hata oluştu.'
      });
    }
  }

  static async createOrGetConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { listingId } = req.body;

      if (!listingId) {
        return res.status(400).json({
          success: false,
          message: 'Listing ID gerekli.'
        });
      }

      // Get listing info
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          user_id: true,
          title: true,
          price: true
        }
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

      // Check for existing conversation
      const [leastUserId, greatestUserId] = [userId, listing.user_id].sort();
      
      let existingConversation = await prisma.conversations.findFirst({
        where: {
          least_user_id: leastUserId,
          greatest_user_id: greatestUserId,
          listing_id: listingId
        }
      });

      if (existingConversation) {
        return res.json({
          success: true,
          data: {
            id: existingConversation.id,
            least_user_id: existingConversation.least_user_id,
            greatest_user_id: existingConversation.greatest_user_id,
            listing_id: existingConversation.listing_id,
            created_at: existingConversation.created_at.toISOString()
          }
        });
      }

      // Create new conversation
      const conversation = await prisma.$transaction(async (tx) => {
        const newConversation = await tx.conversations.create({
          data: {
            id: ulid(),
            least_user_id: leastUserId,
            greatest_user_id: greatestUserId,
            listing_id: listingId
          }
        });

        // Add participants
        await tx.conversation_participants.createMany({
          data: [
            {
              conversation_id: newConversation.id,
              user_id: userId
            },
            {
              conversation_id: newConversation.id,
              user_id: listing.user_id
            }
          ]
        });

        // Initialize unread counters
        await tx.conversation_unread_counters.createMany({
          data: [
            {
              conversation_id: newConversation.id,
              user_id: userId,
              unread_count: 0
            },
            {
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
          created_at: conversation.created_at.toISOString()
        }
      });

    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Konuşma oluşturulurken hata oluştu.'
      });
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;

      const unreadData = await prisma.user_unread_counters.findUnique({
        where: { user_id: userId },
        select: { total_unread: true }
      });

      return res.json({
        success: true,
        data: {
          total_unread: unreadData?.total_unread || 0
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
