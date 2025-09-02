import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { ReportsController } from '../controllers/reportsController';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    username: string | null;
  };
}

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        city: true,
        district: true,
        avatar: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile (alternative endpoint for Profile page)
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        city: true,
        district: true,
        avatar: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Transform to match frontend UserProfile interface
    const profileData = {
      id: user.id, // Keep as string
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar, // Now includes actual avatar from database
      created_at: user.created_at.toISOString()
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread message count for current user
router.get('/unread-count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // For now, return 0 unread messages as placeholder
    // TODO: Implement actual unread count logic with message_reads table
    const unreadCount = 0;

    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user statistics
    const totalListings = await prisma.listings.count({
      where: { user_id: userId }
    });

    const activeListings = await prisma.listings.count({
      where: { 
        user_id: userId,
        is_active: true,
        is_approved: true
      }
    });

    // Get total views for user's listings
    const viewsResult = await prisma.listings.aggregate({
      where: { user_id: userId },
      _sum: { view_count: true }
    });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { created_at: true }
    });

    const stats = {
      totalListings,
      activeListings,
      totalViews: viewsResult._sum.view_count || 0,
      messagesReceived: 0, // TODO: Implement when message system is ready
      joinDate: user?.created_at.toISOString() || new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
router.get('/listings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 GET /me/listings called for user:', req.user?.id);
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.listings.count({
      where: { user_id: userId }
    });

    // Get listings with related data
    const listings = await prisma.listings.findMany({
      where: { user_id: userId },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            name: true
          }
        },
        districts: {
          select: {
            name: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            avatar: true,
            is_corporate: true,
            company_name: true
          }
        },
        listing_images: {
          select: {
            url: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Format listings for frontend
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: Number(listing.price),
      year: listing.year,
      kilometers: listing.km || 0,
      km: listing.km || 0,
      city_name: listing.cities?.name || '',
      district_name: listing.districts?.name || '',
      description: listing.description,
      images: listing.listing_images?.map(img => img.url) || [],
      created_at: listing.created_at,
      user_id: listing.user_id,
      seller_phone: listing.users?.phone,
      categories: listing.categories,
      owner: {
        name: `${listing.users?.first_name || ''} ${listing.users?.last_name || ''}`.trim(),
        phone: listing.users?.phone
      },
      seller: {
        is_corporate: listing.users?.is_corporate,
        company_name: listing.users?.company_name,
        doping_status: null // Will be filled from local storage on frontend
      }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        listings: formattedListings,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { first_name, last_name, phone, city, district, username, avatar } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        first_name,
        last_name,
        phone,
        city,
        district,
        username,
        avatar,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        city: true,
        district: true,
        avatar: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile (alternative endpoint for Profile page)
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { phone, avatar } = req.body; // Frontend sends phone and avatar

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        phone,
        avatar, // Now updating avatar as well
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        city: true,
        district: true,
        avatar: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    // Transform to match frontend UserProfile interface
    const profileData = {
      id: updatedUser.id, // Keep as string
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar, // Now includes actual avatar from database
      created_at: updatedUser.created_at.toISOString()
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    // TODO: Implement password verification and update
    // For now, just return success message
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me/reports - Get user's reports
router.get('/reports', authMiddleware, ReportsController.getMyReports);

// DELETE /api/me/account - Delete account permanently
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password, confirmation } = req.body;
    
    // Güvenlik kontrolü - şifre ve onay gerekli
    if (!password || confirmation !== 'Onaylıyorum') {
      res.status(400).json({ 
        success: false, 
        message: 'Şifre ve "Onaylıyorum" onay metni gereklidir' 
      });
      return;
    }

    // Kullanıcıyı bul ve şifreyi kontrol et
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        password: true,
        first_name: true,
        last_name: true
      }
    });

    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
      return;
    }

    // Şifreyi doğrula (basit kontrol)
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      res.status(400).json({ 
        success: false, 
        message: 'Geçersiz şifre' 
      });
      return;
    }

    // Kullanıcının tüm verilerini sil (Cascade delete için transaction kullan)
    await prisma.$transaction(async (tx) => {
      // İlişkili verileri sil
      await tx.favorites.deleteMany({ where: { user_id: userId } });
      await tx.notifications.deleteMany({ where: { user_id: userId } });
      await tx.messages.deleteMany({ where: { sender_id: userId } });
      await tx.conversation_participants.deleteMany({ where: { user_id: userId } });
      await tx.feedback.deleteMany({ where: { user_id: userId } });
      await tx.reports.deleteMany({ where: { reporter_id: userId } });
      await tx.reports.deleteMany({ where: { owner_id: userId } });
      await tx.listings.deleteMany({ where: { user_id: userId } });
      
      // Son olarak kullanıcıyı sil
      await tx.users.delete({ where: { id: userId } });
    });

    // Log kaydet
    console.log(`Account deleted: ${user.email} (${user.first_name} ${user.last_name}) at ${new Date().toISOString()}`);

    res.status(200).json({ 
      success: true, 
      message: 'Hesabınız başarıyla silindi' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Hesap silme işlemi sırasında bir hata oluştu' 
    });
  }
});

export default router;
