import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

// BigInt serialization helper
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Dashboard stats requested');

    // Paralel verileri çekme
    const [
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalMessages,
      totalCategories,
      listingsByStatus,
      topCategories,
      topCities,
      recentUsers,
      recentListings,
      userStats
    ] = await Promise.all([
      // Total users
      prisma.users.count(),
      
      // Total listings
      prisma.listings.count(),
      
      // Active listings
      prisma.listings.count({
        where: {
          is_active: true,
          is_approved: true
        }
      }),
      
      // Pending listings
      prisma.listings.count({
        where: {
          is_pending: true,
          is_approved: false
        }
      }),
      
      // Total messages
      prisma.messages.count(),
      
      // Total categories
      prisma.categories.count(),
      
      // Listings by status
      prisma.listings.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Basic category count (placeholder)
      Promise.resolve([]),
      
      // Basic city count (placeholder)  
      Promise.resolve([]),
      
      // Recent users (last 10)
      prisma.users.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          phone: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10,
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      
      // Recent listings (last 10)
      prisma.listings.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          created_at: true,
          user_id: true,
          category_id: true,
          city_id: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      }),
      
      // User statistics calculation (JavaScript-based for compatibility)
      Promise.all([
        // Today
        prisma.users.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        // Week  
        prisma.users.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        // Month
        prisma.users.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]).then(([today, week, month]) => ({
        today_users: today,
        week_users: week, 
        month_users: month
      }))
    ]);

    // Enrich categories with names
    const categoryIds = topCategories
      .map((cat: any) => cat.category_id)
      .filter(Boolean);
      
    const categories = categoryIds.length > 0 ? await prisma.categories.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    }) : [];

    // Enrich cities with names
    const cityIds = topCities
      .map((city: any) => city.city_id)
      .filter((id): id is string => id !== null);
      
    const cities = cityIds.length > 0 ? await prisma.cities.findMany({
      where: {
        id: {
          in: cityIds
        }
      },
      select: {
        id: true,
        name: true
      }
    }) : [];

    logger.info('Dashboard stats retrieved successfully');

    // Map categories with names and counts
    const enrichedCategories = topCategories.map((cat: any) => {
      const category = categories.find(c => c.id === cat.category_id);
      return {
        id: cat.category_id,
        name: category?.name || 'Unknown',
        count: Number(cat._count.id)
      };
    });

    // Map cities with names and counts  
    const enrichedCities = topCities.map((city: any) => {
      const cityInfo = cities.find(c => c.id === city.city_id);
      return {
        id: city.city_id,
        name: cityInfo?.name || 'Unknown',
        count: Number(city._count.id)
      };
    });

    // Simple response format that matches our hook interface
    res.json({
      success: true,
      data: {
        pendingCount: Number(pendingListings),
        activeCount: Number(activeListings), 
        usersCount: Number(totalUsers),
        reportsOpenCount: 0, // Will implement when reports are ready
        todayCreated: Array.isArray(userStats) ? Number(userStats[0]?.today_users || 0) : 0,
        weekCreated: Array.isArray(userStats) ? Number(userStats[0]?.week_users || 0) : 0,
        monthCreated: Array.isArray(userStats) ? Number(userStats[0]?.month_users || 0) : 0,
        totalListings: Number(totalListings),
        totalMessages: Number(totalMessages)
      }
    });

  } catch (error: any) {
    logger.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
};

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 10;
    const sort = (req.query.sort as string) || 'created_at';
    const order = (req.query.order as string) || 'desc';
    const search = req.query.search as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};
    
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (status) {
      if (status === 'PENDING') {
        where.is_pending = true;
        where.is_approved = false;
      } else if (status === 'ACTIVE') {
        where.is_pending = false;
        where.is_approved = true;
        where.is_active = true;
      } else if (status === 'INACTIVE') {
        where.is_active = false;
      } else {
        // For other statuses, use the status field
        where.status = status;
      }
    }

    // Get listings with relations
    const [listings, totalCount] = await Promise.all([
      prisma.listings.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true
            }
          },
          brands: {
            select: {
              id: true,
              name: true
            }
          },
          models: {
            select: {
              id: true,
              name: true
            }
          },
          cities: {
            select: {
              id: true,
              name: true
            }
          },
          districts: {
            select: {
              id: true,
              name: true
            }
          },
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true
            }
          },
          listing_images: {
            select: {
              id: true,
              url: true,
              sort_order: true
            },
            orderBy: {
              sort_order: 'asc'
            }
          },
          listing_properties: {
            select: {
              id: true,
              key: true,
              value: true,
              type: true
            }
          }
        },
        orderBy: {
          [sort]: order as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.listings.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        listings: serializeBigInt(listings),
        pagination: {
          page,
          limit,
          totalCount: Number(totalCount),
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting listings:', error);
    res.status(500).json({
      success: false,
      message: 'İlanlar alınırken hata oluştu',
      error: error.message
    });
  }
};

export const getPendingListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const sort = (req.query.sort as string) || 'created_at';
    const order = (req.query.order as string) || 'desc';

    const skip = (page - 1) * pageSize;

    const where = {
      is_pending: true,
      is_approved: false
    };

    const [listings, totalCount] = await Promise.all([
      prisma.listings.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true
            }
          },
          cities: {
            select: {
              id: true,
              name: true
            }
          },
          districts: {
            select: {
              id: true,
              name: true
            }
          },
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true
            }
          },
          listing_images: {
            select: {
              id: true,
              url: true,
              sort_order: true
            },
            orderBy: {
              sort_order: 'asc'
            }
          },
          listing_properties: {
            select: {
              id: true,
              key: true,
              value: true,
              type: true
            }
          }
        },
        orderBy: {
          [sort]: order as 'asc' | 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.listings.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        listings: serializeBigInt(listings),
        pagination: {
          page,
          pageSize,
          totalCount: Number(totalCount),
          totalPages: Math.ceil(totalCount / pageSize)
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting pending listings:', error);
    res.status(500).json({
      success: false,
      message: 'Bekleyen ilanlar alınırken hata oluştu',
      error: error.message
    });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || 'created_at';
    const order = (req.query.order as string) || 'desc';

    const skip = (page - 1) * limit;

    let where: any = {};
    
    if (search) {
      where.OR = [
        {
          first_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          last_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
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
        orderBy: {
          [sort]: order as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.users.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        users: serializeBigInt(users),
        pagination: {
          page,
          limit,
          totalCount: Number(totalCount),
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken hata oluştu',
      error: error.message
    });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const [reports, totalCount] = await Promise.all([
      prisma.reports.findMany({
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.reports.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        reports: serializeBigInt(reports),
        pagination: {
          page,
          limit,
          totalCount: Number(totalCount),
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    logger.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Şikayetler alınırken hata oluştu',
      error: error.message
    });
  }
};

export const approveListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listings.update({
      where: { id },
      data: {
        is_approved: true,
        is_pending: false,
        is_active: true,
        approved_at: new Date(),
        status: 'ACTIVE'
      }
    });

    logger.info(`Listing ${id} approved`);

    res.json({
      success: true,
      message: 'İlan onaylandı',
      data: serializeBigInt(listing)
    });

  } catch (error: any) {
    logger.error('Error approving listing:', error);
    res.status(500).json({
      success: false,
      message: 'İlan onaylanırken hata oluştu',
      error: error.message
    });
  }
};

export const rejectListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listings.update({
      where: { id },
      data: {
        is_approved: false,
        is_pending: false,
        is_active: false,
        rejected_at: new Date(),
        reject_reason: reason,
        status: 'REJECTED'
      }
    });

    logger.info(`Listing ${id} rejected`);

    res.json({
      success: true,
      message: 'İlan reddedildi',
      data: serializeBigInt(listing)
    });

  } catch (error: any) {
    logger.error('Error rejecting listing:', error);
    res.status(500).json({
      success: false,
      message: 'İlan reddedilirken hata oluştu',
      error: error.message
    });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.listings.delete({
      where: { id }
    });

    logger.info(`Listing ${id} deleted`);

    res.json({
      success: true,
      message: 'İlan silindi'
    });

  } catch (error: any) {
    logger.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'İlan silinirken hata oluştu',
      error: error.message
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.users.findUnique({
      where: { id },
      select: { is_active: true }
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const user = await prisma.users.update({
      where: { id },
      data: {
        is_active: !currentUser.is_active
      }
    });

    logger.info(`User ${id} status toggled to ${user.is_active}`);

    res.json({
      success: true,
      message: `Kullanıcı ${user.is_active ? 'aktif edildi' : 'deaktif edildi'}`,
      data: serializeBigInt(user)
    });

  } catch (error: any) {
    logger.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı durumu güncellenirken hata oluştu',
      error: error.message
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.users.delete({
      where: { id }
    });

    logger.info(`User ${id} deleted`);

    res.json({
      success: true,
      message: 'Kullanıcı silindi'
    });

  } catch (error: any) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu',
      error: error.message
    });
  }
};

// Hard delete for rejected listings (alias for compatibility)
export const hardDeleteListing = deleteListing;

// Get recent activities
export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Son aktiviteleri çek
    const [recentUsers, recentListings] = await Promise.all([
      prisma.users.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
          }
        },
        orderBy: { created_at: 'desc' },
        take: Math.floor(limit / 2),
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
        take: Math.floor(limit / 2),
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

    // Aktiviteleri birleştir ve formatla
    const activities = [
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'user' as const,
        title: 'Yeni kullanıcı kaydı',
        description: `${user.first_name} ${user.last_name} platforma katıldı`,
        user: `${user.first_name} ${user.last_name}`,
        email: user.email,
        time: user.created_at.toISOString(),
        status: 'active'
      })),
      ...recentListings.map(listing => ({
        id: listing.id,
        type: 'listing' as const,
        title: 'Yeni ilan',
        description: listing.title,
        user: listing.users ? `${listing.users.first_name} ${listing.users.last_name}` : 'Bilinmeyen',
        time: listing.created_at.toISOString(),
        status: listing.is_approved ? 'approved' : 'pending',
        price: listing.price
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
     .slice(0, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error: any) {
    logger.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Son aktiviteler alınırken hata oluştu',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, is_active } = req.body;

    const user = await prisma.users.update({
      where: { id },
      data: {
        first_name,
        last_name,
        email,
        phone,
        role,
        is_active,
        updated_at: new Date()
      }
    });

    logger.info(`User ${id} updated`);

    res.json({
      success: true,
      message: 'Kullanıcı güncellendi',
      data: serializeBigInt(user)
    });

  } catch (error: any) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Get single listing detail for admin
export const getListingDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'İlan ID gerekli'
      });
      return;
    }

    const listing = await prisma.listings.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        brands: {
          select: {
            id: true,
            name: true
          }
        },
        models: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        districts: {
          select: {
            id: true,
            name: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            created_at: true
          }
        },
        listing_images: {
          select: {
            id: true,
            url: true,
            sort_order: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        },
        listing_properties: {
          select: {
            id: true,
            key: true,
            value: true
          }
        },
        variants: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle_types: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'İlan bulunamadı'
      });
      return;
    }

    console.log('🔍 RAW listing from DB:', {
      id: listing.id,
      title: listing.title,
      features: listing.features,
      featuresType: typeof listing.features
    });
    console.log('� RAW DB Images:', (listing as any).listing_images?.length || 0);
    console.log('� RAW DB Properties:', (listing as any).listing_properties?.length || 0);
    console.log('🎯 RAW DB Features:', listing.features);

    // Transform listing_images to match frontend expectations
    const transformedListing = {
      ...listing,
      listing_images: (() => {
        // Önce listing_images tablosundan kontrol et
        if ((listing as any).listing_images && (listing as any).listing_images.length > 0) {
          console.log('🖼️ Using images from listing_images table');
          return (listing as any).listing_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            image_url: img.url,
            sort_order: img.sort_order,
            order: img.sort_order
          }));
        }
        
        // Eğer listing_images tablosunda veri yoksa, listings.images alanından al
        if (listing.images && Array.isArray(listing.images)) {
          console.log('🖼️ Using images from listings.images field');
          return listing.images
            .filter((img: any): img is string => typeof img === 'string')
            .map((img: string, index: number) => ({
              id: `inline_${index}`,
              url: img,
              image_url: img,
              sort_order: index,
              order: index
            }));
        }
        
        console.log('🖼️ No images found');
        return [];
      })(),
      listing_properties: (listing as any).listing_properties?.map((prop: any) => {
        console.log('� Processing property:', {key: prop.key, value: prop.value});
        return {
          id: prop.id,
          property_name: prop.key,     // Frontend bunu bekliyor
          property_value: prop.value   // Frontend bunu bekliyor
        };
      }) || [],
      // Features alanını parse et
      features: listing.features ? (
        typeof listing.features === 'string' 
          ? (() => {
              try {
                const parsed = JSON.parse(listing.features as string);
                console.log('✅ Successfully parsed features:', parsed);
                return parsed;
              } catch (error) {
                console.error('❌ Failed to parse features:', error);
                return {};
              }
            })()
          : listing.features
      ) : {}
    };

    console.log('� TRANSFORMED Images:', transformedListing.listing_images?.length || 0);
    console.log('� TRANSFORMED Properties:', transformedListing.listing_properties?.length || 0);
    console.log('� TRANSFORMED Features:', transformedListing.features);

    logger.info(`Listing detail ${id} retrieved by admin`);

    res.json({
      success: true,
      data: serializeBigInt(transformedListing)
    });

  } catch (error: any) {
    logger.error('Error getting listing detail:', error);
    res.status(500).json({
      success: false,
      message: 'İlan detayı alınırken hata oluştu',
      error: error.message
    });
  }
};
