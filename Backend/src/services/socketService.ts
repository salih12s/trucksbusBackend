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

  constructor(server: HTTPServer, existingIO?: SocketIOServer) {
    // Use existing IO instance if provided, otherwise create new one
    if (existingIO) {
      this.io = existingIO;
      console.log('✅ SocketService using shared IO instance');
    } else {
      this.io = new SocketIOServer(server, {
        cors: { 
          origin: process.env.NODE_ENV === 'production' 
            ? [
                "https://trucksbus.com", 
                "https://www.trucksbus.com",
                "https://trucksbus.com.tr", 
                "https://www.trucksbus.com.tr"
              ]
            : "*", // Development - all origins
          credentials: true 
        }
      });
      console.log('⚠️ SocketService created new IO instance');
    }

    this.setupMiddleware();
    this.setupEventHandlers();
    logger.info('Socket.IO service initialized');
  }

  // ✨ Participant kontrolü yardımcı fonksiyonu
  private async isParticipant(userId: string, conversationId: string): Promise<boolean> {
    try {
      const conv = await prisma.conversations.findUnique({
        where: { id: conversationId },
        select: { least_user_id: true, greatest_user_id: true }
      }) as any;
      
      if (!conv) return false;
      return conv.least_user_id === userId || conv.greatest_user_id === userId;
    } catch (error) {
      logger.error('Error checking participant status:', error);
      return false;
    }
  }

  // 🔒 Güvenli mesaj oluşturma ve yayınlama
  private async createAndBroadcastMessage(conversation_id: string, senderId: string, body: string) {
    // 1) katılım doğrulama
    const conv = await prisma.conversations.findUnique({ where: { id: conversation_id } }) as any;
    if (!conv) throw new Error('Conversation not found');

    if (![conv.least_user_id, conv.greatest_user_id].includes(senderId)) {
      throw new Error('Not a participant');
    }

    // 2) mesaj yaz
    const message = await (prisma as any).messages.create({
      data: { 
        id: ulid(), 
        conversation_id, 
        sender_id: senderId, 
        body, 
        status: 'SENT' 
      }
    });

    // 3) sender info
    const senderInfo = await prisma.users.findUnique({
      where: { id: senderId }, 
      select: { 
        id: true, 
        first_name: true, 
        last_name: true, 
        username: true 
      }
    });

    const completeMessage = {
      id: message.id,
      conversation_id,
      sender_id: senderId,
      content: message.body,
      created_at: message.created_at,
      users: senderInfo
    };

    // 4) odaya yayınla
    this.io.to(`conversation:${conversation_id}`).emit('message:new', { 
      conversation_id, 
      message: completeMessage 
    });

    // 6) unread counter güncelleme
    const receiverIds = [conv.least_user_id, conv.greatest_user_id].filter((id: string) => id !== senderId);
    for (const receiverId of receiverIds) {
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
      
      const totalAgg = await (prisma as any).conversation_unread_counters.aggregate({
        _sum: { unread_count: true }, 
        where: { user_id: receiverId }
      });
      const totalUnread = totalAgg._sum.unread_count || 0;
      
      await (prisma as any).user_unread_counters.upsert({
        where: { user_id: receiverId },
        create: { user_id: receiverId, total_unread: totalUnread },
        update: { total_unread: totalUnread, updated_at: new Date() }
      });
      
      this.io.to(`user:${receiverId}`).emit('badge:update', { total_unread: totalUnread });
    }

    return completeMessage;
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        
        console.log(`🔐 Socket auth attempt, token exists: ${!!token}`);
        
        if (!token) {
          console.error('❌ No token provided in socket auth');
          return next(new Error('NO_TOKEN'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.id; // Ensure we're using decoded.id
        
        console.log(`✅ Socket authenticated for user: ${decoded.id}`);
        logger.info(`Socket authenticated for user: ${decoded.id}`);
        next();
      } catch (error) {
        console.error('❌ Socket authentication failed:', error);
        logger.error('Socket authentication failed:', error);
        next(new Error('BAD_TOKEN'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 NEW SOCKET CONNECTION: ${socket.id}`);
      
      const userId = socket.userId;
      
      console.log(`🔍 Socket userId from auth: ${userId}`);
      
      if (!userId) {
        console.error(`❌ No userId found, disconnecting socket: ${socket.id}`);
        socket.disconnect();
        return;
      }
      
      // Store user connection
      this.connectedUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Join user to their personal room
      socket.join(`user:${userId}`);
      console.log(`🏠 User ${userId} joined personal room: user:${userId}`);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // 🏠 Handle user joining their personal room (explicit)
      socket.on("user:join", (data: { user_id: string }) => {
        const room = `user:${data.user_id}`;
        socket.join(room);
        logger.info(`🏠 Socket ${socket.id} joined user room: ${room}`);
      });
      
      // 🏠 Handle generic room joining (admin, etc.)
      socket.on("join", (data: { room: string }) => {
        logger.info(`🏠 Socket ${socket.id} joining room: ${data.room}`);
        socket.join(data.room);
      });

      // 🔒 Güvenli conversation join
      socket.on('conversation:join', async ({ conversation_id }: { conversation_id: string }, cb?: (r:any)=>void) => {
        try {
          if (!conversation_id) {
            cb?.({ ok: false, reason: 'no_conversation_id' });
            return;
          }
          const ok = await this.isParticipant(userId, conversation_id);
          if (!ok) {
            logger.warn(`🚫 Forbidden join attempt by ${userId} to ${conversation_id}`);
            socket.emit('error:forbidden', { resource: 'conversation', id: conversation_id });
            cb?.({ ok: false, reason: 'forbidden' });
            return;
          }
          socket.join(`conversation:${conversation_id}`);
          cb?.({ ok: true });
          logger.info(`✅ User ${userId} joined conversation: ${conversation_id}`);
        } catch (error) {
          logger.error('join error:', error);
          cb?.({ ok: false, reason: 'error' });
        }
      });

      // 🔒 Legacy alias for join_conversation - güvenli
      socket.on('join_conversation', async (conversationId: string, cb?: (r:any)=>void) => {
        try {
          if (!conversationId) {
            cb?.({ ok: false, reason: 'no_conversation_id' });
            return;
          }
          const ok = await this.isParticipant(userId, conversationId);
          if (!ok) {
            logger.warn(`🚫 Forbidden legacy join attempt by ${userId} to ${conversationId}`);
            socket.emit('error:forbidden', { resource: 'conversation', id: conversationId });
            cb?.({ ok: false, reason: 'forbidden' });
            return;
          }
          socket.join(`conversation:${conversationId}`);
          cb?.({ ok: true });
          logger.info(`✅ User ${userId} joined conversation (legacy): ${conversationId}`);
        } catch (error) {
          logger.error('legacy join error:', error);
          cb?.({ ok: false, reason: 'error' });
        }
      });

      // 🔒 Güvenli conversation leave
      socket.on('conversation:leave', async ({ conversation_id }: { conversation_id: string }) => {
        try {
          if (!conversation_id) return;
          const ok = await this.isParticipant(userId, conversation_id);
          if (!ok) return; // sessizce ignore et
          socket.leave(`conversation:${conversation_id}`);
          logger.info(`👋 User ${userId} left conversation: ${conversation_id}`);
        } catch (error) {
          logger.error('leave error:', error);
        }
      });

      // 🔒 Legacy alias for leave_conversation - güvenli  
      socket.on('leave_conversation', async (conversationId: string) => {
        try {
          if (!conversationId) return;
          const ok = await this.isParticipant(userId, conversationId);
          if (!ok) return; // sessizce ignore et
          socket.leave(`conversation:${conversationId}`);
          logger.info(`👋 User ${userId} left conversation (legacy): ${conversationId}`);
        } catch (error) {
          logger.error('legacy leave error:', error);
        }
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

      // 🔒 Güvenli mesaj gönderme - ana handler
      socket.on('message:send', async (payload: { conversation_id: string; body: string }, cb?: (ack: any) => void) => {
        console.log(`🔥 message:send received from user ${userId}:`, payload);
        try {
          const res = await this.createAndBroadcastMessage(payload.conversation_id, userId, payload.body);
          console.log(`✅ message:send success, sending ack:`, { ok: true, message: res });
          cb?.({ ok: true, message: res });
        } catch (err: any) {
          console.error(`❌ message:send error for user ${userId}:`, err);
          logger.error('message:send error:', err);
          cb?.({ ok: false, error: err?.message || 'Failed to send' });
        }
      });

      // 🔒 Legacy alias - güvenli
      socket.on('send_message', async (payload: { conversationId: string; content?: string; body?: string }, cb?: (ack: any) => void) => {
        console.log(`🔥 send_message received from user ${userId}:`, payload);
        try {
          const messageBody = payload.content || payload.body || '';
          const res = await this.createAndBroadcastMessage(payload.conversationId, userId, messageBody);
          console.log(`✅ send_message success, sending ack:`, { ok: true, message: res });
          cb?.({ ok: true, message: res });
        } catch (err: any) {
          console.error(`❌ send_message error for user ${userId}:`, err);
          logger.error('send_message error:', err);
          cb?.({ ok: false, error: err?.message || 'Failed to send' });
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

  // Send notification to specific user
  public async sendNotificationToUser(userId: string, notification: any) {
    const userSocketId = this.connectedUsers.get(userId);
    if (userSocketId) {
      this.io.to(userSocketId).emit('notification', notification);
    }
  }

  // Send notification to admin users
  public async sendNotificationToAdmins(notification: any) {
    // Find all connected admin users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      try {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { role: true }
        });
        
        if (user && user.role === 'ADMIN') {
          this.io.to(socketId).emit('notification', notification);
        }
      } catch (error) {
        logger.error('Error checking user role for notification:', error);
      }
    }
  }

  // Broadcast feedback status update
  public broadcastFeedbackUpdate(feedbackId: string, status: string) {
    this.io.emit('feedback_status_update', {
      feedbackId,
      status
    });
  }
}

// Extend Socket interface
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}
