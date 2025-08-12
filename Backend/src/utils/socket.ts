import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { prisma } from './database';

interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  user?: any;
}

export function initializeSocket(io: SocketIOServer) {
  // Authentication middleware for socket.io
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          avatar: true,
          isActive: true,
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: any) => {
    logger.info(`User ${socket.user.name} connected (${socket.userId})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      listingId?: string;
    }) => {
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: socket.userId,
            conversationId: data.conversationId,
            listingId: data.listingId,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            },
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              }
            }
          }
        });

        // Emit message to conversation room
        io.to(`conversation:${data.conversationId}`).emit('new_message', {
          ...message,
          createdAt: message.createdAt.toISOString(),
        });

        logger.info(`Message sent in conversation ${data.conversationId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('mark_message_read', async (messageId: string) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true }
        });

        socket.emit('message_read', { messageId });
        logger.info(`Message ${messageId} marked as read by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
      });
    });

    // Handle user status updates
    socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        status,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User ${socket.user.name} disconnected (${socket.userId})`);
      
      // Broadcast user offline status
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        status: 'offline',
      });
    });

    // Handle listing view notifications
    socket.on('listing_viewed', async (listingId: string) => {
      try {
        // Increment view count
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            views: {
              increment: 1
            }
          }
        });

        // Get listing owner
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { userId: true, title: true }
        });

        if (listing && listing.userId !== socket.userId) {
          // Notify listing owner
          io.to(`user:${listing.userId}`).emit('listing_view_notification', {
            listingId,
            listingTitle: listing.title,
            viewerId: socket.userId,
            viewerName: socket.user.name,
          });
        }
      } catch (error) {
        logger.error('Error handling listing view:', error);
      }
    });
  });

  return io;
}
