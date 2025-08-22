const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function rollbackToBase64() {
  console.log('🔄 File URL\'lerini base64\'e geri çevirme işlemi başlatılıyor...');

  try {
    // Tüm ilanları çek
    const listings = await prisma.listings.findMany({
      where: {
        images: {
          not: null
        }
      }
    });

    console.log(`📊 Toplam ${listings.length} ilan bulundu`);

    let processedCount = 0;
    let updatedCount = 0;

    for (const listing of listings) {
      try {
        console.log(`🔍 İlan işleniyor: ${listing.id}`);
        
        let images = listing.images;
        if (typeof images === 'string') {
          images = JSON.parse(images);
        }

        if (!Array.isArray(images) || images.length === 0) {
          console.log(`⏭️ İlan ${listing.id} - görsel yok, atlanıyor`);
          continue;
        }

        let hasFileUrls = false;
        let updatedImages = [];
        const uploadsDir = path.join(__dirname, 'public/uploads/listings');

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          
          if (typeof img === 'string' && img.startsWith('/uploads/listings/')) {
            // File URL - base64'e çevir
            hasFileUrls = true;
            const fileName = path.basename(img);
            const filePath = path.join(uploadsDir, fileName);
            
            try {
              // Dosyayı oku ve base64'e çevir
              const fileBuffer = await fs.readFile(filePath);
              const mimeType = fileName.endsWith('.jpeg') || fileName.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
              const base64String = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
              updatedImages.push(base64String);
              console.log(`✅ File converted back to base64: ${fileName}`);
            } catch (error) {
              console.error(`❌ Error reading file ${fileName}:`, error);
              // Fallback: dosya okunamadıysa placeholder
              updatedImages.push('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//2Q=='); // Minimal JPEG
            }
          } else {
            // Zaten base64 veya başka format - olduğu gibi bırak
            updatedImages.push(img);
          }
        }

        if (hasFileUrls) {
          // İlanı güncelle
          await prisma.listings.update({
            where: { id: listing.id },
            data: {
              images: updatedImages
            }
          });
          updatedCount++;
          console.log(`🔄 İlan ${listing.id} güncellendi - ${updatedImages.length} görsel base64'e çevrildi`);
        } else {
          console.log(`⏭️ İlan ${listing.id} - file URL yok, atlanıyor`);
        }

        processedCount++;
      } catch (error) {
        console.error(`❌ İlan ${listing.id} işlenirken hata:`, error);
      }
    }

    console.log(`\n🎉 Rollback tamamlandı!`);
    console.log(`📊 Toplam işlenen: ${processedCount}`);
    console.log(`✅ Güncellenen: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Rollback hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

rollbackToBase64();
