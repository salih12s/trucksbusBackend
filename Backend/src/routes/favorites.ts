import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { randomUUID } from 'crypto';

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

// Kullanıcının favorilerini getir
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const favorites = await prisma.favorites.findMany({
      where: { user_id: userId },
      include: {
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            km: true,
            year: true,
            images: true,
            city_id: true,
            district_id: true,
            created_at: true,
            seller_phone: true, // seller_phone field'ını dahil et
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
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
            variants: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Debug için
    console.log('🔍 Backend favorites data:', JSON.stringify(favorites, null, 2));

    return res.json({
      success: true,
      favorites: favorites.map((fav: any) => ({
        id: fav.id,
        listing_id: fav.listing_id,
        user_id: fav.user_id,
        created_at: fav.created_at,
        listing: {
          id: fav.listings.id,
          title: fav.listings.title,
          price: fav.listings.price,
          km: fav.listings.km,
          year: fav.listings.year,
          images: fav.listings.images,
          city_name: fav.listings.cities?.name,
          district_name: fav.listings.districts?.name,
          created_at: fav.listings.created_at,
          seller_phone: fav.listings.seller_phone || fav.listings.users?.phone, // Önce seller_phone, sonra users.phone
        },
      }))
    });
  } catch (error) {
    console.error('Favoriler getirilirken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Favoriler getirilirken hata oluştu'
    });
  }
});

// Favorilere ekle
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({
        success: false,
        message: 'İlan ID gerekli'
      });
    }

    // İlan var mı kontrol et
    const listing = await prisma.listings.findUnique({
      where: { id: listing_id }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı'
      });
    }

    // Zaten favori mi kontrol et
    const existingFavorite = await prisma.favorites.findFirst({
      where: {
        user_id: userId,
        listing_id: listing_id
      }
    });

    if (existingFavorite) {
      return res.json({
        success: true,
        favorite: existingFavorite, // 200 OK, idempotent
      });
    }

    // Favoriye ekle
    const favorite = await prisma.favorites.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        listing_id: listing_id
      }
    });

    return res.json({
      success: true,
      message: 'Favorilere eklendi',
      favorite: {
        id: favorite.id,
        listing_id: favorite.listing_id,
        user_id: favorite.user_id,
        created_at: favorite.created_at
      }
    });
  } catch (error) {
    console.error('Favoriye eklenirken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Favoriye eklenirken hata oluştu'
    });
  }
});

// Favorilerden çıkar
router.delete('/:listingId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;

    // Favoriyi bul ve sil
    const deletedFavorite = await prisma.favorites.deleteMany({
      where: {
        user_id: userId,
        listing_id: listingId
      }
    });

    if (deletedFavorite.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favori bulunamadı'
      });
    }

    return res.json({
      success: true,
      message: 'Favorilerden çıkarıldı'
    });
  } catch (error) {
    console.error('Favorilerden çıkarılırken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Favorilerden çıkarılırken hata oluştu'
    });
  }
});

// Favori sayısını getir
router.get('/count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const count = await prisma.favorites.count({
      where: { user_id: userId }
    });

    return res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Favori sayısı getirilirken hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Favori sayısı getirilirken hata oluştu'
    });
  }
});

export default router;
