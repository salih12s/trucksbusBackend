import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: { 
        origin: ["http://localhost:5173"], 
        credentials: true 
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    logger.info('Socket.IO service initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        
        if (!token) {
          return next(new Error('NO_TOKEN'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.id; // Ensure we're using decoded.id
        
        logger.info(`Socket authenticated for user: ${decoded.id}`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('BAD_TOKEN'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      
      if (!userId) {
        socket.disconnect();
        return;
      }
      
      // Store user connection
      this.connectedUsers.set(userId, socket.id);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Join user to their personal room
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Join conversation rooms
      socket.on('conversation:join', ({ conversation_id }: { conversation_id: string }) => {
        socket.join(`conversation:${conversation_id}`);
        logger.info(`User ${userId} joined conversation: ${conversation_id}`);
      });

      // Legacy alias for join_conversation
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${userId} joined conversation (legacy): ${conversationId}`);
      });

      // Leave conversation rooms
      socket.on('conversation:leave', ({ conversation_id }: { conversation_id: string }) => {
        socket.leave(`conversation:${conversation_id}`);
        logger.info(`User ${userId} left conversation: ${conversation_id}`);
      });

      // Legacy alias for leave_conversation  
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        logger.info(`User ${userId} left conversation (legacy): ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { conversationId?: string; conversation_id?: string }) => {
        const convId = data.conversationId || data.conversation_id;
        if (!convId) return;
        
        socket.to(`conversation:${convId}`).emit('user_typing', {
          userId: userId,
          typing: true
        });
      });

      socket.on('typing_stop', (data: { conversationId?: string; conversation_id?: string }) => {
        const convId = data.conversationId || data.conversation_id;
        if (!convId) return;
        
        socket.to(`conversation:${convId}`).emit('user_typing', {
          userId: userId,
          typing: false
        });
      });

      // Message send handler
      socket.on('message:send', async (payload: { conversation_id: string; body: string }, cb?: (ack: any) => void) => {
        try {
          const { conversation_id, body } = payload;
          const senderId = userId;

          // Message send handler - updated for database fields  
          logger.info(`📤 Socket message:send from ${senderId} to conversation ${conversation_id}: "${body}"`);

          // 1) Check participant access
          const conversation = await prisma.conversations.findUnique({
            where: { id: conversation_id }
          }) as any;

          if (!conversation) {
            return cb?.({ ok: false, error: 'Conversation not found' });
          }

          const isParticipant = [conversation.least_user_id, conversation.greatest_user_id].includes(senderId);
          if (!isParticipant) {
            return cb?.({ ok: false, error: 'Not a participant' });
          }

          // 2) Create message
          const message = await (prisma as any).messages.create({
            data: {
              id: ulid(),
              conversation_id,
              sender_id: senderId,
              body: body,
              status: 'SENT'
            }
          });

          // 3) Get sender info for complete ACK
          const senderInfo = await prisma.users.findUnique({
            where: { id: senderId },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true
            }
          });

          // 4) Format complete message for ACK
          const completeMessage = {
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            content: message.body,
            created_at: message.created_at,
            users: senderInfo
          };

          // 5) BROADCAST to conversation room
          logger.info(`🚀 Emitting message:new to conversation:${conversation_id}`);
          this.io.to(`conversation:${conversation_id}`).emit('message:new', {
            conversation_id,
            message: completeMessage
          });

          // 6) Update unread counters for receivers using real database counters
          const receiverIds = [conversation.least_user_id, conversation.greatest_user_id]
            .filter(id => id !== senderId);

          for (const receiverId of receiverIds) {
            // Update conversation-specific unread counter
            await (prisma as any).conversation_unread_counters.upsert({
              where: { 
                conversation_id_user_id: { 
                  conversation_id, 
                  user_id: receiverId 
                } 
              },
              create: { 
                id: ulid(), 
                conversation_id, 
                user_id: receiverId, 
                unread_count: 1 
              },
              update: { 
                unread_count: { increment: 1 },
                updated_at: new Date()
              }
            });

            // Recalculate total unread for user
            const totalAgg = await (prisma as any).conversation_unread_counters.aggregate({
              _sum: { unread_count: true },
              where: { user_id: receiverId }
            });
            const totalUnread = totalAgg._sum.unread_count || 0;

            // Update user's total unread counter
            await (prisma as any).user_unread_counters.upsert({
              where: { user_id: receiverId },
              create: { user_id: receiverId, total_unread: totalUnread },
              update: { total_unread: totalUnread, updated_at: new Date() }
            });

            // Send real badge update
            this.io.to(`user:${receiverId}`).emit('badge:update', { total_unread: totalUnread });
          }

          // 7) Return complete message in ACK (not just {ok, id})
          cb?.({ 
            ok: true, 
            message: completeMessage
          });
        } catch (error) {
          logger.error('Error handling message:send:', error);
          cb?.({ ok: false, error: 'Failed to send message' });
        }
      });

      // Legacy alias for send_message
      socket.on('send_message', async (payload: { conversationId: string; content?: string; body?: string }, cb?: (ack: any) => void) => {
        try {
          const { conversationId, content, body } = payload;
          const messageBody = content || body || '';
          
          logger.info(`📤 Socket send_message (legacy) from ${userId} to conversation ${conversationId}: "${messageBody}"`);
          
          // Redirect to main handler
          socket.emit('message:send', { conversation_id: conversationId, body: messageBody }, cb);
        } catch (error) {
          logger.error('Error handling send_message (legacy):', error);
          cb?.({ ok: false, error: 'Failed to send message' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (userId) {
          this.connectedUsers.delete(userId);
          logger.info(`User ${userId} disconnected`);
        }
      });
    });
  }

  // Send new message notification
  public emitNewMessage(conversationId: string, message: any) {
    logger.info(`Emitting new message to conversation: ${conversationId}`, message);
    
    // Emit to conversation room - doğru oda!
    this.io.to(`conversation:${conversationId}`).emit('message:new', {
      conversation_id: conversationId,
      message
    });
  }

  // Send badge update
  public emitBadgeUpdate(userId: string, totalUnread: number) {
    logger.info(`Emitting badge update to user: ${userId}, total: ${totalUnread}`);
    this.io.to(`user:${userId}`).emit('badge:update', { total_unread: totalUnread });
  }

  // Send message status updates
  public emitMessageStatus(conversationId: string, messageId: string, status: string) {
    this.io.to(`conversation:${conversationId}`).emit('message_status_update', {
      messageId,
      status
    });
  }

  // Get online status
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get Socket.IO instance for controllers
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Extend Socket interface
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}
