import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVehicleTypes = async (req: Request, res: Response) => {
  try {
    // Route parametresinden category ID'yi al
    const { categoryId } = req.params;
    // Query parametresinden category_id'yi de kontrol et
    const category_id = categoryId || req.query.category_id as string;
    
    console.log(`🔍 VehicleTypes request - categoryId: ${categoryId}, category_id: ${category_id}`);
    
    let vehicleTypes;
    if (category_id) {
      vehicleTypes = await prisma.vehicle_types.findMany({
        where: { category_id },
        include: {
          categories: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Vehicle types query with filter: category_id=${category_id}, found ${vehicleTypes.length} vehicle types`);
    } else {
      vehicleTypes = await prisma.vehicle_types.findMany({
        include: {
          categories: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Vehicle types query without filter, found ${vehicleTypes.length} vehicle types`);
    }
    
    res.json(vehicleTypes);
  } catch (error) {
    logger.error('Error fetching vehicle types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    // Route parametresinden vehicle type ID'yi al
    const { vehicleTypeId } = req.params;
    // Query parametresinden vehicle_type_id'yi de kontrol et
    const vehicle_type_id = vehicleTypeId || req.query.vehicle_type_id as string;
    
    console.log(`🔍 Brands request - vehicleTypeId: ${vehicleTypeId}, vehicle_type_id: ${vehicle_type_id}`);
    
    let brands;
    if (vehicle_type_id) {
      brands = await prisma.brands.findMany({
        where: { vehicle_type_id },
        include: {
          vehicle_types: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Brands query with filter: vehicle_type_id=${vehicle_type_id}, found ${brands.length} brands`);
    } else {
      brands = await prisma.brands.findMany({
        include: {
          vehicle_types: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Brands query without filter, found ${brands.length} brands`);
    }
    
    res.json(brands);
  } catch (error) {
    logger.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getModels = async (req: Request, res: Response) => {
  try {
    // Route parametresinden brand ID'yi al
    const { brandId } = req.params;
    // Query parametresinden brand_id'yi de kontrol et
    const brand_id = brandId || req.query.brand_id as string;
    
    console.log(`🔍 Models request - brandId: ${brandId}, brand_id: ${brand_id}`);
    
    let models;
    if (brand_id) {
      models = await prisma.models.findMany({
        where: { brand_id },
        include: {
          brands: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Models query with filter: brand_id=${brand_id}, found ${models.length} models`);
    } else {
      models = await prisma.models.findMany({
        include: {
          brands: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Models query without filter, found ${models.length} models`);
    }
    
    res.json(models);
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVariants = async (req: Request, res: Response) => {
  try {
    // Route parametresinden model ID'yi al
    const { modelId } = req.params;
    // Query parametresinden model_id'yi de kontrol et
    const model_id = modelId || req.query.model_id as string;
    
    console.log(`🔍 Variants request - modelId: ${modelId}, model_id: ${model_id}`);
    
    let variants;
    if (model_id) {
      variants = await prisma.variants.findMany({
        where: { model_id },
        include: {
          models: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Variants query with filter: model_id=${model_id}, found ${variants.length} variants`);
    } else {
      variants = await prisma.variants.findMany({
        include: {
          models: true
        },
        orderBy: { name: 'asc' }
      });
      console.log(`🔍 Variants query without filter, found ${variants.length} variants`);
    }
    
    res.json(variants);
  } catch (error) {
    logger.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
