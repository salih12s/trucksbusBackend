import { prisma } from '../utils/prisma';
import { NotificationType } from '@prisma/client';
import { getIO } from '../utils/socket';

export interface NotificationData {
  reportId: string;
  reportTitle?: string;
  oldStatus?: string;
  newStatus?: string;
  resolutionNote?: string;
}

export class NotificationService {
  static async createReportNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: NotificationData
  ) {
    try {
      // Create persistent notification
      const notification = await prisma.notifications.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          type,
          title,
          message,
          data: data ? (data as any) : undefined,
        },
      });

      // Update unread counter
      await prisma.user_unread_counters.upsert({
        where: { user_id: userId },
        update: {
          total_unread: { increment: 1 },
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          total_unread: 1,
        },
      });

      // Send real-time notification if user is online
      const io = getIO();
      io.to(`user:${userId}`).emit('notification', {
        ...notification,
        data: data || null,
      });

      // Emit unread count update
      const counter = await prisma.user_unread_counters.findUnique({
        where: { user_id: userId },
      });
      
      io.to(`user:${userId}`).emit('unreadCountUpdate', {
        total_unread: counter?.total_unread || 0,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async markAsRead(notificationIds: string[], userId: string) {
    try {
      const result = await prisma.notifications.updateMany({
        where: {
          id: { in: notificationIds },
          user_id: userId,
          is_read: false,
        },
        data: { is_read: true },
      });

      // Update unread counter
      await prisma.user_unread_counters.update({
        where: { user_id: userId },
        data: {
          total_unread: { decrement: result.count },
          updated_at: new Date(),
        },
      });

      // Emit updated unread count
      const io = getIO();
      const counter = await prisma.user_unread_counters.findUnique({
        where: { user_id: userId },
      });
      
      io.to(`user:${userId}`).emit('unreadCountUpdate', {
        total_unread: Math.max(0, counter?.total_unread || 0),
      });

      return result;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, isRead?: boolean) {
    return prisma.notifications.findMany({
      where: {
        user_id: userId,
        ...(isRead !== undefined && { is_read: isRead }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getUnreadCount(userId: string) {
    const counter = await prisma.user_unread_counters.findUnique({
      where: { user_id: userId },
    });
    return counter?.total_unread || 0;
  }
}
