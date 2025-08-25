import { Request, Response } from 'express';
import { prisma } from '../utils/database';

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

export class NotificationController {
  // GET /api/notifications/unread-count
  static async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const unreadCount = await prisma.notifications.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });

      return res.json({ success: true, unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // POST /api/notifications/:id/read
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await prisma.notifications.updateMany({
        where: {
          id: notificationId,
          user_id: userId
        },
        data: {
          is_read: true
        }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // POST /api/notifications/read-all
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await prisma.notifications.updateMany({
        where: {
          user_id: userId,
          is_read: false
        },
        data: {
          is_read: true
        }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // GET /api/notifications
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const notifications = await prisma.notifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 50
      });

      return res.json({ success: true, notifications });
    } catch (error) {
      console.error('Error getting notifications:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
