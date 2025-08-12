import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Get all listings with filters
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      category_id,
      vehicle_type_id,
      brand_id,
      model_id,
      city_id,
      min_price,
      max_price,
      min_year,
      max_year,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where clause using database field names
    const where: any = {
      status: 'ACTIVE',
      is_active: true,
      is_approved: true,
    };

    if (category_id) where.category_id = category_id;
    if (vehicle_type_id) where.vehicle_type_id = vehicle_type_id;
    if (brand_id) where.brand_id = brand_id;
    if (model_id) where.model_id = model_id;
    if (city_id) where.city_id = city_id;

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = Number(min_price);
      if (max_price) where.price.lte = Number(max_price);
    }

    if (min_year || max_year) {
      where.year = {};
      if (min_year) where.year.gte = Number(min_year);
      if (max_year) where.year.lte = Number(max_year);
    }

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
          vehicle_types: true,
          brands: true,
          models: true,
          cities: true,
          districts: true,
          listing_images: {
            orderBy: { sort_order: 'asc' }
          },
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
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
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single listing by ID
export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        categories: true,
        vehicle_types: true,
        brands: true,
        models: true,
        variants: true,
        cities: true,
        districts: true,
        listing_images: {
          orderBy: { sort_order: 'asc' }
        },
        listing_properties: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            created_at: true
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    });

    res.status(200).json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    logger.error('Get listing by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new listing
export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      year,
      category_id,
      vehicle_type_id,
      brand_id,
      model_id,
      variant_id,
      city_id,
      district_id,
      seller_name,
      seller_phone,
      seller_email,
      color,
      engine_power,
      engine_volume,
      fuel_type,
      is_exchangeable,
      km,
      license_plate,
      transmission,
      vehicle_condition,
      images = []
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: Number(price),
        year: Number(year),
        category_id,
        vehicle_type_id,
        brand_id,
        model_id,
        variant_id,
        city_id,
        district_id,
        seller_name,
        seller_phone,
        seller_email,
        color,
        engine_power,
        engine_volume,
        fuel_type,
        is_exchangeable: Boolean(is_exchangeable),
        km: km ? Number(km) : null,
        license_plate,
        transmission,
        vehicle_condition,
        user_id: req.user!.id,
        status: 'PENDING',
        is_pending: true,
        updated_at: new Date(),
        listing_images: {
          create: images.map((img: any, index: number) => ({
            image_url: img.url,
            sort_order: index
          }))
        }
      },
      include: {
        categories: true,
        vehicle_types: true,
        brands: true,
        models: true,
        listing_images: true
      }
    });

    logger.info(`Listing created: ${listing.id} by user: ${req.user!.id}`);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: { listing }
    });
  } catch (error) {
    logger.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update listing
export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { user_id: true, status: true }
    });

    if (!existingListing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    if (existingListing.user_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
      return;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        categories: true,
        vehicle_types: true,
        brands: true,
        models: true,
        listing_images: true
      }
    });

    logger.info(`Listing updated: ${listing.id} by user: ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing }
    });
  } catch (error) {
    logger.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete listing
export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { user_id: true }
    });

    if (!existingListing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    if (existingListing.user_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
      return;
    }

    await prisma.listing.delete({
      where: { id }
    });

    logger.info(`Listing deleted: ${id} by user: ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    logger.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's listings
export const getUserListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      status
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {
      user_id: req.user!.id
    };

    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: Number(limit),
        include: {
          categories: true,
          vehicle_types: true,
          brands: true,
          models: true,
          listing_images: {
            orderBy: { sort_order: 'asc' },
            take: 1
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
    logger.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get categories for dropdown
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vehicle types for dropdown
export const getVehicleTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleTypes = await prisma.vehicle_types.findMany({
      select: {
        id: true,
        name: true,
        image_url: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { vehicleTypes }
    });
  } catch (error) {
    logger.error('Get vehicle types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get brands for dropdown
export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brands.findMany({
      select: {
        id: true,
        name: true,
        image_url: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { brands }
    });
  } catch (error) {
    logger.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
