import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

const imageFixMap = {
  // Türkçe karakterli dosya isimleri düzeltmeleri
  '/ModelImage/Scanıa.png': '/ModelImage/Scania.png',
  '/ModelImage/Avıa.png': '/ModelImage/Avia.png',
  '/ModelImage/MUSATTİ.png': '/ModelImage/Musatti.png',
  '/ModelImage/Türkkar.png': '/ModelImage/Turkkar.png',
  
  // Diğer dosya isim düzeltmeleri
  '/ModelImage/Centro.png': '/ModelImage/Cenntro.png',
  '/ModelImage/Axiam.png': '/ModelImage/Aixam.png',
};

export const fixBrandImages = async (req: Request, res: Response) => {
  try {
    logger.info('🔧 Brand image URLs düzeltiliyor...');
    
    const results = [];
    
    for (const [oldUrl, newUrl] of Object.entries(imageFixMap)) {
      logger.info(`🔄 Değiştiriliyor: ${oldUrl} → ${newUrl}`);
      
      const result = await prisma.brands.updateMany({
        where: {
          image_url: oldUrl
        },
        data: {
          image_url: newUrl
        }
      });
      
      results.push({
        oldUrl,
        newUrl,
        updatedCount: result.count
      });
      
      logger.info(`✅ ${result.count} brand güncellendi`);
    }
    
    // Güncellenmiş brandları kontrol et
    const updatedBrands = await prisma.brands.findMany({
      where: {
        image_url: {
          in: Object.values(imageFixMap)
        }
      },
      select: {
        name: true,
        image_url: true
      }
    });
    
    logger.info('🎉 Brand image URL düzeltmeleri tamamlandı!');
    
    res.json({
      success: true,
      message: 'Brand image URLs başarıyla düzeltildi',
      results,
      updatedBrands
    });
    
  } catch (error) {
    logger.error('❌ Brand image fix error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Brand image URLs düzeltilirken hata oluştu' 
    });
  }
};
