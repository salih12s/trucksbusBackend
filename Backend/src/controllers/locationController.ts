import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCities = async (req: Request, res: Response) => {
  try {
    console.log('🏙️ LocationController: Şehirler getiriliyor...');
    
    const cities = await prisma.cities.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`🏙️ LocationController: ${cities.length} şehir bulundu`);

    res.json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    console.error('❌ LocationController: Şehirler getirilemedi:', error);
    res.status(500).json({
      success: false,
      message: 'Şehirler getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

export const getDistrictsByCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    console.log('🏘️ LocationController: İlçeler getiriliyor, cityId:', cityId);
    
    if (!cityId) {
      res.status(400).json({
        success: false,
        message: 'Şehir ID gerekli'
      });
      return;
    }

    const districts = await prisma.districts.findMany({
      where: {
        city_id: cityId
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`🏘️ LocationController: ${districts.length} ilçe bulundu`);

    res.json({
      success: true,
      data: districts,
      count: districts.length
    });
  } catch (error) {
    console.error('❌ LocationController: İlçeler getirilemedi:', error);
    res.status(500).json({
      success: false,
      message: 'İlçeler getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};