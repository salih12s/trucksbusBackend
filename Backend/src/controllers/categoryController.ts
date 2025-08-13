import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        vehicle_types: {
          include: {
            brands: {
              include: {
                models: {
                  include: {
                    variants: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info('Categories fetched successfully');
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: {
        id: id
      },
      include: {
        vehicle_types: {
          include: {
            brands: {
              include: {
                models: {
                  include: {
                    variants: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    logger.info(`Category ${id} fetched successfully`);
    res.json(category);
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVehicleTypesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    
    const vehicleTypes = await prisma.vehicle_types.findMany({
      where: {
        category_id: categoryId
      },
      include: {
        brands: {
          include: {
            models: {
              include: {
                variants: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Vehicle types for category ${categoryId} fetched successfully`);
    res.json(vehicleTypes);
  } catch (error) {
    logger.error('Error fetching vehicle types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brands.findMany({
      include: {
        models: {
          include: {
            variants: true
          }
        },
        vehicle_types: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info('Brands fetched successfully');
    res.json(brands);
  } catch (error) {
    logger.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBrandsByVehicleType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleTypeId } = req.params;
    
    if (!vehicleTypeId) {
      res.status(400).json({
        success: false,
        message: 'Vehicle type ID is required'
      });
      return;
    }

    logger.info(`Fetching brands for vehicle type: ${vehicleTypeId}`);
    
    const brands = await prisma.brands.findMany({
      where: {
        vehicle_type_id: vehicleTypeId
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Found ${brands.length} brands for vehicle type ${vehicleTypeId}`);
    
    res.json({
      success: true,
      data: brands,
      count: brands.length
    });
  } catch (error) {
    logger.error('Error fetching brands by vehicle type:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getModelsByBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandId } = req.params;
    
    const models = await prisma.models.findMany({
      where: {
        brand_id: brandId
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Models for brand ${brandId} fetched successfully`);
    res.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error) {
    logger.error('Error fetching models by brand:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getVariantsByModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modelId } = req.params;
    
    const variants = await prisma.variants.findMany({
      where: {
        model_id: modelId
      },
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Variants for model ${modelId} fetched successfully`);
    res.json({
      success: true,
      data: variants,
      count: variants.length
    });
  } catch (error) {
    logger.error('Error fetching variants by model:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all vehicle types
export const getAllVehicleTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all vehicle types...');
    
    const vehicleTypes = await prisma.vehicle_types.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    logger.info(`Found ${vehicleTypes.length} vehicle types`);
    
    res.json({
      success: true,
      data: vehicleTypes,
      count: vehicleTypes.length
    });
  } catch (error) {
    logger.error('Error fetching all vehicle types:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
