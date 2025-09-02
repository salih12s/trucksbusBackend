import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.cities.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

export const getDistrictsByCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    const city_id = cityId || req.query.city_id as string;
    
    console.log(`🔍 Districts request - cityId: ${cityId}, city_id: ${city_id}`);
    
    if (!city_id) {
      res.status(400).json({
        success: false,
        error: 'city_id is required'
      });
      return;
    }
    
    const districts = await prisma.districts.findMany({
      where: {
        city_id: city_id
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`🔍 Districts query: city_id=${city_id}, found ${districts.length} districts`);
    
    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};
