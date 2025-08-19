import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function initializeSocket(server: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user info from database
      const user = await prisma.userss.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          is_active: true
        }
      });

      if (!user || !user.is_active) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      socket.user = user;
      
      console.log(`🔌 User ${user.first_name} ${user.last_name} connected via Socket.IO`);
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: any) => {
    console.log(`✅ Socket connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join conversation rooms based on user's conversations
    socket.on('join_conversations', async () => {
      try {
        const conversations = await prisma.conversation_participants.findMany({
          where: { user_id: socket.userId },
          select: { conversation_id: true }
        });

        conversations.forEach((conv: any) => {
          socket.join(`conversation:${conv.conversation_id}`);
        });

        console.log(`📱 User ${socket.userId} joined ${conversations.length} conversation rooms`);
      } catch (error) {
        console.error('Error joining conversations:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { conversation_id: string }) => {
      socket.to(`conversation:${data.conversation_id}`).emit('user_typing', {
        user_id: socket.userId,
        conversation_id: data.conversation_id,
        user_name: `${socket.user.first_name} ${socket.user.last_name}`
      });
    });

    socket.on('typing_stop', (data: { conversation_id: string }) => {
      socket.to(`conversation:${data.conversation_id}`).emit('user_stopped_typing', {
        user_id: socket.userId,
        conversation_id: data.conversation_id
      });
    });

    // Handle message sending via socket (alternative to REST API)
    socket.on('send_message', async (data: { 
      conversation_id: string, 
      body: string, 
      attachment_url?: string 
    }) => {
      try {
        // Verify user is participant
        const participant = await prisma.conversation_participants.findFirst({
          where: {
            conversation_id: data.conversation_id,
            user_id: socket.userId
          }
        });

        if (!participant) {
          socket.emit('error', { message: 'Access denied to conversation' });
          return;
        }

        // Create message
        const message = await prisma.messagess.create({
          data: {
            conversation_id: data.conversation_id,
            sender_id: socket.userId,
            body: data.body,
            attachment_url: data.attachment_url || null,
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
        await prisma.conversation_counters.upsert({
          where: { conversation_id: data.conversation_id },
          create: {
            conversation_id: data.conversation_id,
            last_message_id: message.id,
            last_message_preview: data.body.substring(0, 160),
            last_message_at: new Date()
          },
          update: {
            last_message_id: message.id,
            last_message_preview: data.body.substring(0, 160),
            last_message_at: new Date()
          }
        });

        // Update unread counters for other participants
        await prisma.conversation_unread_counters.updateMany({
          where: {
            conversation_id: data.conversation_id,
            user_id: { not: socket.userId }
          },
          data: {
            unread_count: { increment: 1 }
          }
        });

        // Emit to conversation room
        const messageData = {
          id: message.id,
          conversation_id: message.conversation_id,
          body: message.body,
          attachment_url: message.attachment_url,
          sender: {
            id: message.users.id,
            name: `${message.users.first_name} ${message.users.last_name}`,
            avatar: message.users.avatar
          },
          status: message.status,
          created_at: message.created_at
        };

        io.to(`conversation:${data.conversation_id}`).emit('new_message', messageData);

        // Update unread badge counts for other users
        const otherParticipants = await prisma.conversation_participants.findMany({
          where: {
            conversation_id: data.conversation_id,
            user_id: { not: socket.userId }
          }
        });

        for (const participant of otherParticipants) {
          const totalUnread = await prisma.conversation_unread_counters.aggregate({
            where: { user_id: participant.user_id },
            _sum: { unread_count: true }
          });

          io.to(`user:${participant.user_id}`).emit('unread_count_updated', {
            total_unread: totalUnread._sum.unread_count || 0
          });
        }

      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read receipts
    socket.on('mark_conversation_read', async (data: { conversation_id: string }) => {
      try {
        // Get latest message
        const lastMessage = await prisma.messagess.findFirst({
          where: { conversation_id: data.conversation_id },
          orderBy: { created_at: 'desc' }
        });

        if (lastMessage) {
          // Update message reads
          await prisma.messages_reads.upsert({
            where: {
              conversation_id_user_id: {
                conversation_id: data.conversation_id,
                user_id: socket.userId
              }
            },
            create: {
              conversation_id: data.conversation_id,
              user_id: socket.userId,
              last_read_message_id: lastMessage.id
            },
            update: {
              last_read_message_id: lastMessage.id
            }
          });

          // Reset unread counter for this conversation
          await prisma.conversation_unread_counters.upsert({
            where: {
              conversation_id_user_id: {
                conversation_id: data.conversation_id,
                user_id: socket.userId
              }
            },
            create: {
              conversation_id: data.conversation_id,
              user_id: socket.userId,
              unread_count: 0
            },
            update: {
              unread_count: 0
            }
          });

          // Update total unread count
          const totalUnread = await prisma.conversation_unread_counters.aggregate({
            where: { user_id: socket.userId },
            _sum: { unread_count: true }
          });

          await prisma.users_unread_counters.upsert({
            where: { user_id: socket.userId },
            create: {
              user_id: socket.userId,
              total_unread: totalUnread._sum.unread_count || 0
            },
            update: {
              total_unread: totalUnread._sum.unread_count || 0
            }
          });

          // Emit read receipt to conversation
          socket.to(`conversation:${data.conversation_id}`).emit('message_read', {
            conversation_id: data.conversation_id,
            user_id: socket.userId,
            last_read_message_id: lastMessage.id
          });

          // Update user's unread badge
          socket.emit('unread_count_updated', {
            total_unread: totalUnread._sum.unread_count || 0
          });
        }

      } catch (error) {
        console.error('Error marking conversation as read:', error);
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.userId}, reason: ${reason}`);
    });
  });

  return io;
}
