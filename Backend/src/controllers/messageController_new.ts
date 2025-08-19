import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  io?: Server;
}

export class MessageController {
  
  // Mesaj gönderme
  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const senderId = req.user!.id;
      const { conversation_id, content, attachment_url } = req.body;

      if (!conversation_id || !content) {
        return res.status(400).json({ error: 'conversation_id and content are required' });
      }

      // Konuşmaya katılım kontrolü
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversation_id,
          participants: {
            some: { user_id: senderId }
          }
        },
        include: {
          listing: true
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found or access denied' });
      }

      // Mesajı oluştur
      const messageId = ulid();
      const message = await prisma.message.create({
        data: {
          id: messageId,
          conversation_id: conversation_id,
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

      // Conversation counters güncelle
      await prisma.conversation_counters.upsert({
        where: { conversation_id },
        create: {
          conversation_id,
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

      // Socket.IO ile mesaj gönder
      if (req.io) {
        req.io.to(`conversation:${conversation_id}`).emit('new_message', {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          body: message.body,
          attachment_url: message.attachment_url,
          status: message.status,
          created_at: message.created_at.toISOString(),
          sender: {
            id: message.sender.id,
            name: `${message.sender.first_name} ${message.sender.last_name}`,
            avatar: message.sender.avatar
          }
        });
      }

      return res.json({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        body: message.body,
        attachment_url: message.attachment_url,
        status: message.status,
        created_at: message.created_at.toISOString()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mesajları getirme
  static async getMessages(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const conversationId = req.params.conversationId;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursor = req.query.cursor as string;

      // Konuşmaya katılım kontrolü
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: { user_id: userId }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const whereClause: any = { conversation_id: conversationId };
      if (cursor) {
        whereClause.id = { lt: cursor };
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
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
        orderBy: { created_at: 'desc' },
        take: limit
      });

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
        messages: formattedMessages.reverse(),
        hasMore: messages.length === limit,
        cursor: messages.length > 0 ? messages[messages.length - 1].id : null
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mesajı okundu olarak işaretle
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { messageId } = req.params;

      // Mesajı bul ve konuşmaya erişim kontrolü yap
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: {
              participants: {
                where: { user_id: userId }
              }
            }
          }
        }
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.conversation.participants.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Mesaj zaten bu kullanıcının değilse
      if (message.sender_id === userId) {
        return res.status(400).json({ error: 'Cannot mark own message as read' });
      }

      // Message reads güncelle
      await prisma.message_reads.upsert({
        where: {
          conversation_id_user_id: {
            conversation_id: message.conversation_id,
            user_id: userId
          }
        },
        create: {
          conversation_id: message.conversation_id,
          user_id: userId,
          last_read_message_id: messageId
        },
        update: {
          last_read_message_id: messageId
        }
      });

      return res.json({ message: 'Message marked as read' });

    } catch (error) {
      console.error('Error marking message as read:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Konuşmadaki tüm mesajları okundu olarak işaretle
  static async markConversationAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      // Konuşmaya erişim kontrolü
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: { user_id: userId }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Son mesajı bul
      const lastMessage = await prisma.message.findFirst({
        where: { conversation_id: conversationId },
        orderBy: { created_at: 'desc' }
      });

      if (lastMessage) {
        // Message reads güncelle
        await prisma.message_reads.upsert({
          where: {
            conversation_id_user_id: {
              conversation_id: conversationId,
              user_id: userId
            }
          },
          create: {
            conversation_id: conversationId,
            user_id: userId,
            last_read_message_id: lastMessage.id
          },
          update: {
            last_read_message_id: lastMessage.id
          }
        });

        // Unread counters sıfırla
        await prisma.conversation_unread_counters.upsert({
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
      }

      return res.json({ message: 'Conversation marked as read' });

    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
