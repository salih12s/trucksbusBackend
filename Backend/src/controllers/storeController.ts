import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthRequest } from '../types';

export class StoreController {
  // Store istatistiklerini getir
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Basit istatistikler - gerçek veriler
      const [totalListings, totalViews] = await Promise.all([
        // Toplam ilan sayısı
        prisma.listings.count({
          where: { user_id: userId }
        }),
        
        // Toplam görüntüleme sayısı
        prisma.listings.aggregate({
          where: { user_id: userId },
          _sum: { view_count: true }
        })
      ]);

      // Mesaj sayısını basit şekilde hesapla
      const userListings = await prisma.listings.findMany({
        where: { user_id: userId },
        select: { id: true }
      });

      const messageCount = await prisma.messages.count({
        where: {
          conversations: {
            listing_id: {
              in: userListings.map(l => l.id)
            }
          }
        }
      });

      return res.json({
        success: true,
        data: {
          totalListings,
          totalViews: totalViews._sum.view_count || 0,
          messages: messageCount
        }
      });
    } catch (error) {
      console.error('Store stats error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'İstatistikler getirilirken hata oluştu' 
      });
    }
  }

  // Son mesajları getir
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Kullanıcının ilanlarını al
      const userListings = await prisma.listings.findMany({
        where: { user_id: userId },
        select: { id: true }
      });

      if (userListings.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Bu ilanlara gelen mesajları getir
      const messages = await prisma.messages.findMany({
        where: {
          conversations: {
            listing_id: {
              in: userListings.map(l => l.id)
            }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit
      });

      const formattedMessages = messages.map(message => ({
        id: message.id,
        sender_name: `${message.users?.first_name || 'Kullanıcı'} ${message.users?.last_name || ''}`.trim(),
        content: message.body,
        created_at: message.created_at,
        is_read: message.status === 'READ'
      }));

      return res.json({
        success: true,
        data: formattedMessages
      });
    } catch (error) {
      console.error('Store messages error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Mesajlar getirilirken hata oluştu' 
      });
    }
  }

  // Profil tamamlama durumu
  static async getProfileCompletion(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Tamamlanma yüzdesini hesapla
      let completedFields = 0;
      let totalFields = 5; // first_name, last_name, email, phone, company_name
      const suggestions = [];

      // Temel alanları kontrol et
      if (!user.first_name) suggestions.push('Ad bilginizi tamamlayın');
      else completedFields++;

      if (!user.last_name) suggestions.push('Soyad bilginizi tamamlayın');
      else completedFields++;

      if (!user.email) suggestions.push('E-posta bilginizi tamamlayın');
      else completedFields++;

      if (!user.phone) suggestions.push('Telefon bilginizi tamamlayın');
      else completedFields++;

      if (!user.company_name) suggestions.push('Şirket adı bilginizi tamamlayın');
      else completedFields++;

      const percentage = Math.round((completedFields / totalFields) * 100);

      return res.json({
        success: true,
        data: {
          percentage,
          suggestions
        }
      });
    } catch (error) {
      console.error('Profile completion error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Profil durumu kontrol edilirken hata oluştu' 
      });
    }
  }

  // Kullanıcının ilanlarını getir
  static async getListings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Kullanıcının ilanlarını getir
      const listings = await prisma.listings.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          status: true,
          view_count: true,
          created_at: true,
          updated_at: true,
          categories: {
            select: {
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
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      });

      // Toplam ilan sayısı
      const total = await prisma.listings.count({
        where: { user_id: userId }
      });

      const formattedListings = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        status: listing.status,
        view_count: listing.view_count || 0,
        category: listing.categories?.name || 'Kategori Yok',
        location: `${listing.cities?.name || ''} ${listing.districts?.name || ''}`.trim(),
        created_at: listing.created_at,
        updated_at: listing.updated_at
      }));

      return res.json({
        success: true,
        data: {
          listings: formattedListings,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Store listings error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'İlanlar getirilirken hata oluştu' 
      });
    }
  }
}
