const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function migrateBase64Images() {
  console.log('🚀 Base64 görselleri dosyaya çevirme işlemi başlatılıyor...');

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

    const uploadsDir = path.join(__dirname, 'public/uploads/listings');
    
    // uploads klasörünün var olduğundan emin ol
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('📁 uploads klasörü oluşturuldu');
    }

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

        let hasBase64 = false;
        let updatedImages = [];

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          
          if (typeof img === 'string' && img.startsWith('data:image/')) {
            // Base64 string
            hasBase64 = true;
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const base64Data = img.replace(/^data:image\/[a-z]+;base64,/, '');
            const fileExtension = img.match(/^data:image\/([a-z]+);base64,/)?.[1] || 'jpeg';
            const fileName = `listing_migrated_${listing.id}_${i}_${timestamp}_${randomId}.${fileExtension}`;
            const filePath = path.join(uploadsDir, fileName);
            
            try {
              await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
              const publicUrl = `/uploads/listings/${fileName}`;
              updatedImages.push(publicUrl);
              console.log(`✅ Base64 image ${i} saved as: ${fileName}`);
            } catch (error) {
              console.error(`❌ Error saving base64 image ${i}:`, error);
              updatedImages.push(img); // Fallback
            }
          } else if (typeof img === 'object' && img.url && img.url.startsWith('data:image/')) {
            // Base64 object {id: "...", url: "data:image/..."}
            hasBase64 = true;
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const base64Data = img.url.replace(/^data:image\/[a-z]+;base64,/, '');
            const fileExtension = img.url.match(/^data:image\/([a-z]+);base64,/)?.[1] || 'jpeg';
            const fileName = `listing_migrated_${listing.id}_${i}_${timestamp}_${randomId}.${fileExtension}`;
            const filePath = path.join(uploadsDir, fileName);
            
            try {
              await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
              const publicUrl = `/uploads/listings/${fileName}`;
              updatedImages.push(publicUrl);
              console.log(`✅ Base64 object image ${i} saved as: ${fileName}`);
            } catch (error) {
              console.error(`❌ Error saving base64 object image ${i}:`, error);
              updatedImages.push(img.url); // Fallback
            }
          } else {
            // Normal URL veya başka format
            updatedImages.push(typeof img === 'string' ? img : img.url || img);
          }
        }

        if (hasBase64) {
          // İlanı güncelle
          await prisma.listings.update({
            where: { id: listing.id },
            data: {
              images: updatedImages
            }
          });
          updatedCount++;
          console.log(`🔄 İlan ${listing.id} güncellendi - ${updatedImages.length} görsel`);
        } else {
          console.log(`⏭️ İlan ${listing.id} - base64 görsel yok, atlanıyor`);
        }

        processedCount++;
      } catch (error) {
        console.error(`❌ İlan ${listing.id} işlenirken hata:`, error);
      }
    }

    console.log(`\n🎉 Migration tamamlandı!`);
    console.log(`📊 Toplam işlenen: ${processedCount}`);
    console.log(`✅ Güncellenen: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Migration hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBase64Images();
