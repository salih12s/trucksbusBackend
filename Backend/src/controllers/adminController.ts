import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Get all listings for admin
export const getAdminListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: Number(limit),
        include: {
          categories: true,
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: {
          current_page: Number(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: Number(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get admin listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve listing
export const approveListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        is_approved: true,
        is_pending: false,
        approved_by: req.user!.id,
        approved_at: new Date(),
        updated_at: new Date()
      }
    });

    logger.info(`Listing approved: ${listing.id} by admin: ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'Listing approved successfully',
      data: { listing }
    });
  } catch (error) {
    logger.error('Approve listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject listing
export const rejectListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'REJECTED',
        is_approved: false,
        is_pending: false,
        reject_reason: reason,
        rejected_at: new Date(),
        updated_at: new Date()
      }
    });

    logger.info(`Listing rejected: ${listing.id} by admin: ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'Listing rejected successfully',
      data: { listing }
    });
  } catch (error) {
    logger.error('Reject listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalListings,
      pendingListings,
      activeListings,
      totalUsers
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalListings,
        pendingListings,
        activeListings,
        totalUsers
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
