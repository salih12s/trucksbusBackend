import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/auth';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export class UserController {
  // GET /users/profile - User profile bilgileri getir
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
          created_at: true,
          avatar: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
      return;
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /users/profile - User profile güncelle (sadece phone ve avatar)
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { phone, avatar } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateData: any = {};
      if (phone !== undefined) updateData.phone = phone || null;
      if (avatar !== undefined) updateData.avatar = avatar || null;

      const updatedUser = await prisma.users.update({
        where: {
          id: userId,
        },
        data: updateData,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
        },
      });

      res.json(updatedUser);
      return;
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /users/stats - User istatistikleri getir
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Kullanıcının ilanlarını say
      const totalListings = await prisma.listings.count({
        where: {
          user_id: userId,
        },
      });

      // Aktif ilanları say (approved ve active status)
      const activeListings = await prisma.listings.count({
        where: {
          user_id: userId,
          is_approved: true,
          // status: 'ACTIVE', // Eğer status field'ı varsa uncomment et
        },
      });

      // Kullanıcının join tarihini al
      const user = await prisma.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          created_at: true,
        },
      });

      res.json({
        totalListings,
        activeListings,
        totalViews: 0, // Şimdilik 0, ileride views tablosu eklenebilir
        joinDate: user?.created_at || new Date(),
      });
      return;
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /users/change-password - Şifre değiştir
  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      // Kullanıcıyı bul
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
      });

      if (!user || !user.password) {
        return res.status(404).json({ error: 'User not found or invalid password' });
      }

      // Mevcut şifreyi kontrol et
      const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Yeni şifreyi hash'le
      const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

      // Şifreyi güncelle
      await prisma.users.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      res.json({ message: 'Password changed successfully' });
      return;
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
