// YENİ adminController.ts için geçici kısa fix

      listing_images: (listing.images && Array.isArray(listing.images)) 
        ? listing.images.map((img: string, index: number) => ({
            id: `inline_${index}`,
            url: img,
            image_url: img,
            sort_order: index,
            order: index
          }))
        : [],
