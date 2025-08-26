import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.cities.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json(cities);
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDistrictsByCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    
    const districts = await prisma.districts.findMany({
      where: {
        city_id: cityId
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(districts);
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
