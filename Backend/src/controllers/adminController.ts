import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Getting dashboard stats...');

    // Paralel olarak tüm istatistikleri çek
    const [
      totalUsers,
      totalListings,
      pendingListings,
      activeListings,
      totalCategories,
      totalMessages,
      recentUsers,
      recentListings,
      topCategories,
      listingsByStatus,
      topCities,
      userStats
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      prisma.users.count(),
      
      // Toplam ilan sayısı
      prisma.listings.count(),
      
      // Onay bekleyen ilan sayısı (is_pending true olanlar)
      prisma.listings.count({
        where: { is_pending: true }
      }),
      
      // Aktif ilan sayısı
      prisma.listings.count({
        where: { is_active: true }
      }),
      
      // Toplam kategori sayısı
      prisma.categories.count(),
      
      // Toplam mesaj sayısı
      prisma.messages.count(),
      
      // Son 7 gün içinde kayıt olan kullanıcılar
      prisma.users.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          phone: true
        }
      }),
      
      // Son ilanlar
      prisma.listings.findMany({
        orderBy: { created_at: 'desc' },
        take: 15,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      }),
      
      // En popüler kategoriler
      prisma.listings.groupBy({
        by: ['category_id'],
        _count: {
          category_id: true
        },
        orderBy: {
          _count: {
            category_id: 'desc'
          }
        },
        take: 10
      }),
      
      // Duruma göre ilan sayıları
      prisma.listings.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // En çok ilan verilen şehirler
      prisma.listings.groupBy({
        by: ['city_id'],
        _count: {
          city_id: true
        },
        where: {
          city_id: { not: null }
        },
        orderBy: {
          _count: {
            city_id: 'desc'
          }
        },
        take: 10
      }),
      
      // Kullanıcı istatistikleri
      prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_users,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_users,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_users
        FROM users
      `
    ]);

    // Kategori isimlerini al
    const categoryIds = topCategories.map(cat => cat.category_id).filter(Boolean);
    const categories = categoryIds.length > 0 ? await prisma.categories.findMany({
      where: {
        id: { in: categoryIds }
      },
      select: {
        id: true,
        name: true
      }
    }) : [];

    // Şehir isimlerini al
    const cityIds = topCities.map(city => city.city_id).filter((id): id is string => id !== null);
    const cities = cityIds.length > 0 ? await prisma.cities.findMany({
      where: {
        id: { in: cityIds }
      },
      select: {
        id: true,
        name: true
      }
    }) : [];

    // Önceki ayın verilerini al (değişim hesaplamak için)
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const [
      lastMonthUsers,
      lastMonthListings,
      lastMonthMessages
    ] = await Promise.all([
      prisma.users.count({
        where: {
          created_at: {
            gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
            lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
          }
        }
      }),
      prisma.listings.count({
        where: {
          created_at: {
            gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
            lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
          }
        }
      }),
      prisma.messages.count({
        where: {
          created_at: {
            gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
            lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
          }
        }
      })
    ]);

    // Bu ayın verilerini al
    const currentMonth = new Date();
    const [
      thisMonthUsers,
      thisMonthListings,
      thisMonthMessages
    ] = await Promise.all([
      prisma.users.count({
        where: {
          created_at: {
            gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      }),
      prisma.listings.count({
        where: {
          created_at: {
            gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      }),
      prisma.messages.count({
        where: {
          created_at: {
            gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      })
    ]);

    // Değişim yüzdelerini hesapla
    const userChange = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100) : 0;
    const listingChange = lastMonthListings > 0 ? ((thisMonthListings - lastMonthListings) / lastMonthListings * 100) : 0;
    const messageChange = lastMonthMessages > 0 ? ((thisMonthMessages - lastMonthMessages) / lastMonthMessages * 100) : 0;

    // Kategori verilerini zenginleştir
    const enrichedCategories = topCategories.map(cat => {
      const category = categories.find(c => c.id === cat.category_id);
      return {
        ...cat,
        name: category?.name || 'Bilinmeyen Kategori'
      };
    });

    // Şehir verilerini zenginleştir
    const enrichedCities = topCities.map(city => {
      const cityInfo = cities.find(c => c.id === city.city_id);
      return {
        ...city,
        name: cityInfo?.name || 'Bilinmeyen Şehir'
      };
    });

    const dashboardData = {
      stats: {
        totalUsers: {
          value: totalUsers,
          change: Math.round(userChange * 100) / 100,
          thisMonth: thisMonthUsers,
          lastMonth: lastMonthUsers
        },
        totalListings: {
          value: totalListings,
          change: Math.round(listingChange * 100) / 100,
          thisMonth: thisMonthListings,
          lastMonth: lastMonthListings
        },
        pendingListings: {
          value: pendingListings,
          active: activeListings
        },
        totalCategories: {
          value: totalCategories
        },
        totalMessages: {
          value: totalMessages,
          change: Math.round(messageChange * 100) / 100,
          thisMonth: thisMonthMessages,
          lastMonth: lastMonthMessages
        },
        userStats: Array.isArray(userStats) ? userStats[0] || { today_users: 0, week_users: 0, month_users: 0 } : { today_users: 0, week_users: 0, month_users: 0 }
      },
      recentUsers: recentUsers.map(user => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`
      })),
      recentListings: recentListings.map(listing => ({
        ...listing,
        seller_name: listing.users ? `${listing.users.first_name} ${listing.users.last_name}` : 'Bilinmeyen'
      })),
      topCategories: enrichedCategories,
      topCities: enrichedCities,
      charts: {
        listingsByStatus
      },
      systemInfo: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Dashboard stats retrieved successfully');
    logger.info('Dashboard stats retrieved');
    
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error('❌ Error getting dashboard stats:', error);
    logger.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard verilerini alırken hata oluştu',
      error: error.message
    });
  }
};

export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Son aktiviteleri çek
    const [recentUsers, recentListings, recentMessages] = await Promise.all([
      prisma.users.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true
        }
      }),
      
      prisma.listings.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      }),
      
      prisma.messages.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      })
    ]);

    // Aktiviteleri birleştir ve sırala
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user',
        title: 'Yeni kullanıcı kaydı',
        description: `${user.first_name} ${user.last_name}`,
        user: `${user.first_name} ${user.last_name}`,
        email: user.email,
        time: user.created_at,
        status: 'completed'
      })),
      
      ...recentListings.map(listing => ({
        id: `listing-${listing.id}`,
        type: 'listing',
        title: listing.title,
        description: `Yeni ${listing.is_pending ? 'onay bekleyen' : ''} ilan`,
        user: listing.users ? `${listing.users.first_name} ${listing.users.last_name}` : 'Bilinmeyen',
        time: listing.created_at,
        status: listing.is_pending ? 'pending' : 'active',
        price: listing.price
      })),
      
      ...recentMessages.map(message => ({
        id: `message-${message.id}`,
        type: 'message',
        title: 'Yeni mesaj',
        description: message.body?.substring(0, 50) + '...' || 'Mesaj içeriği yok',
        user: message.users ? `${message.users.first_name} ${message.users.last_name}` : 'Bilinmeyen',
        time: message.created_at,
        status: message.status === 'SENT' ? 'sent' : 'unread'
      }))
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error: any) {
    console.error('❌ Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Son aktiviteler alınırken hata oluştu',
      error: error.message
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { first_name: { contains: search as string, mode: 'insensitive' } },
        { last_name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.users.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        is_active: true,
        created_at: true,
        _count: {
          select: {
            listings: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.users.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error in getUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        is_active: true,
        created_at: true,
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            is_approved: true,
            is_active: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error in getUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active } = req.body;

    const user = await prisma.users.update({
      where: { id },
      data: {
        first_name,
        last_name,
        email,
        phone,
        is_active,
        updated_at: new Date()
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        is_active: true
      }
    });

    res.json({ success: true, data: user, message: 'Kullanıcı başarıyla güncellendi' });
  } catch (error) {
    logger.error('Error in updateUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.users.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    logger.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getListings = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'pending', // 'pending', 'approved', 'rejected', 'all'
      search 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    // Status filter
    if (status === 'pending') {
      where.is_approved = false;
      where.is_active = true;
    } else if (status === 'approved') {
      where.is_approved = true;
      where.is_active = true;
    } else if (status === 'rejected') {
      where.is_active = false;
    }
    // 'all' durumunda where koşulu eklenmez

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const listings = await prisma.listings.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        categories: true,
        vehicle_types: true,
        brands: true,
        models: true,
        variants: true,
        cities: true,
        districts: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.listings.count({ where });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(total / Number(limit)),
          total_items: total,
          items_per_page: Number(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error in getListings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Önce mevcut ilan bilgilerini al
    const currentListing = await prisma.listings.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        seller_name: true,
        seller_phone: true,
        seller_email: true,
        is_approved: true,
        is_active: true
      }
    });

    console.log('📋 Before approval - Current listing data:', currentListing);
    
    const listing = await prisma.listings.update({
      where: { id },
      data: {
        is_approved: true,
        is_active: true,
        updated_at: new Date()
      },
      select: {
        id: true,
        title: true,
        seller_name: true,
        seller_phone: true,
        seller_email: true,
        is_approved: true,
        is_active: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    console.log('📋 After approval - Updated listing data:', listing);
    
    logger.info(`Listing approved: ${id}`);
    
    res.json({ 
      success: true, 
      data: listing,
      message: 'İlan başarıyla onaylandı' 
    });
  } catch (error) {
    logger.error('Error in approveListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const listing = await prisma.listings.update({
      where: { id },
      data: {
        is_approved: false,
        is_active: false,
        reject_reason: reason || 'İlan reddedildi',
        updated_at: new Date()
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    logger.info(`Listing rejected: ${id}, reason: ${reason || 'No reason provided'}`);
    
    res.json({ 
      success: true, 
      data: listing,
      message: 'İlan başarıyla reddedildi' 
    });
  } catch (error) {
    logger.error('Error in rejectListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Hard delete for rejected listings - removes from database entirely
export const hardDeleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // First, check if listing exists and is rejected
    const listing = await prisma.listings.findUnique({
      where: { id },
      select: {
        id: true,
        is_approved: false,
        is_active: false,
        title: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({ 
        error: 'İlan bulunamadı' 
      });
      return;
    }

    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // Delete related listing_images (CASCADE should handle this, but being explicit)
      await tx.listing_images.deleteMany({
        where: { listing_id: id }
      });

      // Delete related listing_properties (CASCADE should handle this, but being explicit)
      await tx.listing_properties.deleteMany({
        where: { listing_id: id }
      });

      // Delete the main listing record
      await tx.listings.delete({
        where: { id }
      });
    });

    logger.info(`Listing hard deleted: ${id} by admin`);
    
    res.json({ 
      success: true, 
      message: 'İlan kalıcı olarak silindi' 
    });
  } catch (error) {
    logger.error('Error in hardDeleteListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingListings = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const listings = await prisma.listings.findMany({
      where: {
        is_approved: false,
        is_active: true
      },
      include: {
        categories: {
          select: { name: true }
        },
        vehicle_types: {
          select: { name: true }
        },
        brands: {
          select: { name: true }
        },
        models: {
          select: { name: true }
        },
        variants: {
          select: { name: true }
        },
        cities: {
          select: { name: true }
        },
        districts: {
          select: { name: true }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.listings.count({
      where: {
        is_approved: false,
        is_active: true
      }
    });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(total / Number(limit)),
          total_items: total,
          items_per_page: Number(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error in getPendingListings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
