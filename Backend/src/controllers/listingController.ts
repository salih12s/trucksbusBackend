import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Creating listing with data:', req.body);
    console.log('🔍 Brand related data:', {
      brand_id: req.body.brand_id,
      selectedBrand: req.body.selectedBrand,
      brandInfo: req.body.brand_id ? 'has brand_id' : 'no brand_id'
    });
    console.log('🖼️ Images data:', {
      images: req.body.images,
      imagesType: typeof req.body.images,
      imagesLength: req.body.images?.length || 0,
      firstImage: req.body.images?.[0] ? 'exists' : 'no image'
    });
    console.log('🏷️ Properties data:', {
      properties: req.body.properties,
      propertiesType: typeof req.body.properties,
      propertiesKeys: req.body.properties ? Object.keys(req.body.properties) : 'no keys'
    });
    
    const {
      title,
      description,
      price,
      year,
      km,
      fuel_type,
      transmission,
      engine_volume,
      engine_power,
      color,
      vehicle_condition,
      is_exchangeable,
      category_id,
      vehicle_type_id,
      brand_id,
      model_id,
      variant_id,
      city_id,
      district_id,
      city,
      district,
      images,
      seller_name,
      seller_phone,
      seller_email,
      properties, // Dorse özel bilgileri için
      
      // Kamyon özel alanları
      motor_power,
      body_type,
      carrying_capacity,
      cabin_type,
      tire_condition,
      drive_type,
      plate_origin,
      vehicle_plate,
      features,
      damage_record,
      paint_change,
      tramer_record,
      
      // Eski alanlar (backward compatibility)
      mileage,
      transmission_type,
      engine_size,
      contact_phone,
      contact_email
    } = req.body;

    // Gerekli alanları kontrol et
    if (!title || !price || !category_id || !vehicle_type_id) {
      res.status(400).json({ 
        success: false, 
        message: 'Gerekli alanlar eksik: title, price, category_id, vehicle_type_id' 
      });
      return;
    }

    // Brand validation - eğer brand_id gönderildiyse geçerli olmalı
    if (brand_id && typeof brand_id === 'string') {
      const brandExists = await prisma.brands.findUnique({
        where: { id: brand_id }
      });
      
      if (!brandExists) {
        console.log(`❌ Invalid brand_id: ${brand_id}`);
        res.status(400).json({ 
          success: false, 
          message: 'Geçersiz marka ID\'si. Lütfen geçerli bir marka seçin.' 
        });
        return;
      }
    }

    // Authenticated user ID'sini al (middleware'den gelir)
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required to create listing' 
      });
      return;
    }
    
    console.log('✅ Creating listing for authenticated user:', userId);

    // Kullanıcı bilgilerini al
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { first_name: true, last_name: true, phone: true, email: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // City ve district string olarak gelmişse ID'lerine çevir
    let resolved_city_id = city_id;
    let resolved_district_id = district_id;
    
    if (city && typeof city === 'string') {
      const cityRecord = await prisma.cities.findFirst({
        where: { name: { contains: city, mode: 'insensitive' } }
      });
      if (cityRecord) resolved_city_id = cityRecord.id;
    }
    
    if (district && typeof district === 'string') {
      const districtRecord = await prisma.districts.findFirst({
        where: { name: { contains: district, mode: 'insensitive' } }
      });
      if (districtRecord) resolved_district_id = districtRecord.id;
    }

    // Ilan oluştur
    const listing = await prisma.listings.create({
      data: {
        id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        price: Number(price),
        year: year ? Number(year) : 2000,
        km: km ? Number(km) : (mileage ? Number(mileage) : null),
        fuel_type,
        transmission: transmission || transmission_type,
        engine_volume: engine_volume || engine_size,
        engine_power: engine_power || motor_power,
        color,
        vehicle_condition,
        is_exchangeable: is_exchangeable || false,
        license_plate: vehicle_plate,
        
        // Kamyon özel alanları
        body_type,
        carrying_capacity,
        cabin_type,
        tire_condition,
        drive_type,
        plate_origin,
        features: features || {},
        damage_record,
        paint_change,
        tramer_record,
        
        seller_name: seller_name || `${user.first_name} ${user.last_name}`,
        seller_phone: seller_phone || contact_phone || user.phone || '',
        seller_email: seller_email || contact_email || user.email || '',
        
        // Relations
        category_id: category_id,
        vehicle_type_id: vehicle_type_id,
        user_id: userId,
        brand_id: brand_id || null,
        model_id: model_id || null,
        variant_id: variant_id || null,
        city_id: resolved_city_id || null,
        district_id: resolved_district_id || null,
        images: images || [],
        
        // Status
        status: "PENDING", // İlan pending durumunda başlar
        is_active: true,
        is_approved: false, // Admin onayı bekliyor
        is_pending: true, // Onay bekliyor
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        categories: true,
        vehicle_types: true,
        brands: true,
        models: true,
        variants: true,
        cities: true,
        districts: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    // Property value'larını Türkçeleştiren mapping function
    const getPropertyDisplayValue = (key: string, value: string): string => {
      const valueMap: { [key: string]: { [value: string]: string } } = {
        'exchangeable': {
          'evet': 'Evet',
          'hayır': 'Hayır',
          'yes': 'Evet',
          'no': 'Hayır'
        },
        'takas': {
          'evet': 'Evet', 
          'hayır': 'Hayır'
        },
        'negotiable': {
          'evet': 'Evet',
          'hayır': 'Hayır'
        },
        'warranty': {
          'evet': 'Evet',
          'hayır': 'Hayır'
        }
      };
      
      const keyMap = valueMap[key];
      if (keyMap && keyMap[value.toLowerCase()]) {
        return keyMap[value.toLowerCase()];
      }
      
      return value;
    };

    // Property name'leri Türkçeleştiren mapping function
    const getPropertyDisplayName = (key: string): string => {
      const propertyNameMap: { [key: string]: string } = {
        // Şasi özellikleri
        'axleCount': 'Aks Sayısı',
        'loadCapacity': 'Yükleme Kapasitesi',
        'tireCondition': 'Lastik Durumu',
        'exchangeable': 'Takas',
        
        // Dorse özellikleri
        'length': 'Uzunluk',
        'width': 'Genişlik',
        'height': 'Yükseklik',
        'capacity': 'Kapasite',
        'material': 'Malzeme',
        'doorType': 'Kapı Tipi',
        'floorType': 'Taban Tipi',
        'sideType': 'Yan Duvar Tipi',
        'roofType': 'Çatı Tipi',
        'uzunluk': 'Uzunluk',
        'genislik': 'Genişlik', 
        'lastikDurumu': 'Lastik Durumu',
        'devrilmeYonu': 'Devrilme Yönü',
        'negotiable': 'Pazarlık',
        'warranty': 'Garanti',
        
        // Diğer özellikler
        'year': 'Model Yılı',
        'condition': 'Durum',
        'brand': 'Marka',
        'model': 'Model'
      };
      
      return propertyNameMap[key] || key;
    };

    // Properties varsa kaydet (Dorse özel bilgileri için)
    if (properties && typeof properties === 'object') {
      const propertyPromises = Object.entries(properties).map(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          return prisma.listing_properties.create({
            data: {
              id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              listing_id: listing.id,
              key: getPropertyDisplayName(key), // Türkçe isim kullan
              value: getPropertyDisplayValue(key, String(value)), // Türkçe value kullan
              type: 'STRING' // Default type
            }
          });
        }
        return null;
      }).filter(Boolean);

      if (propertyPromises.length > 0) {
        await Promise.all(propertyPromises);
        console.log('✅ Properties saved:', Object.keys(properties));
      }
    }

    console.log('✅ Created listing:', listing);
    logger.info(`New listing created: ${listing.id} by user: ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'İlan başarıyla oluşturuldu ve onay için gönderildi',
      data: listing
    });
  } catch (error: any) {
    console.error('💥 CREATE LISTING ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Error in createListing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İlan oluşturulurken bir hata oluştu',
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 getListings called with query params:', req.query);
    
    const { 
      page = 1, 
      limit = 10,
      category_id,
      vehicle_type_id,
      brand_id,
      model_id,
      city_id,
      district_id,
      min_price,
      max_price,
      min_year,
      max_year,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where: any = {
      is_active: true,
      is_approved: true
    };

    console.log('🔍 Initial where clause:', where);

    if (category_id) where.category_id = category_id as string;
    if (vehicle_type_id) where.vehicle_type_id = vehicle_type_id as string;
    if (brand_id) where.brand_id = brand_id as string;
    if (model_id) where.model_id = model_id as string;
    if (city_id) where.city_id = city_id as string;
    if (district_id) where.district_id = district_id as string;

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
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listings.findMany({
        where,
        select: {
          // Scalar fields
          id: true,
          title: true,
          description: true,
          price: true,
          year: true,
          km: true,
          seller_name: true,
          seller_phone: true,
          seller_email: true,
          created_at: true,
          updated_at: true,
          status: true,
          is_active: true,
          is_approved: true,
          view_count: true,
          images: true,
          color: true,
          fuel_type: true,
          transmission: true,
          engine_power: true,
          engine_volume: true,
          vehicle_condition: true,
          is_exchangeable: true,
          license_plate: true,
          user_id: true,
          // Relations
          categories: {
            select: {
              id: true,
              name: true
            }
          },
          vehicle_types: {
            select: {
              id: true,
              name: true
            }
          },
          brands: {
            select: {
              id: true,
              name: true
            }
          },
          models: {
            select: {
              id: true,
              name: true
            }
          },
          variants: {
            select: {
              id: true,
              name: true
            }
          },
          cities: {
            select: {
              id: true,
              name: true
            }
          },
          districts: {
            select: {
              id: true,
              name: true
            }
          },

          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.listings.count({ where })
    ]);

    // Response verilerini kontrol et
    const responseData = {
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
    
    console.log('📋 About to send response - seller data check:');
    if (responseData.listings[0]) {
      console.log('  - seller_name:', responseData.listings[0].seller_name);
      console.log('  - seller_phone:', responseData.listings[0].seller_phone);
      console.log('  - users:', responseData.listings[0].users);
      console.log('  - categories:', responseData.listings[0].categories);
      console.log('🔍 FULL LISTING OBJECT:', JSON.stringify(responseData.listings[0], null, 2));
    }
    
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const debugListingData = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await prisma.listings.findMany({
      where: {
        is_active: true,
        is_approved: true
      },
      select: {
        id: true,
        title: true,
        seller_name: true,
        seller_phone: true,
        seller_email: true,
        is_approved: true,
        is_active: true,
        created_at: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true
          }
        }
      },
      take: 5
    });

    console.log('🔍 DEBUG: Active approved listings seller data:');
    listings.forEach((listing, index) => {
      console.log(`Listing ${index + 1}:`, {
        id: listing.id,
        title: listing.title,
        seller_name: listing.seller_name,
        seller_phone: listing.seller_phone,
        seller_email: listing.seller_email,
        user_data: listing.users ? {
          name: `${listing.users.first_name} ${listing.users.last_name}`,
          phone: listing.users.phone
        } : null,
        is_approved: listing.is_approved,
        created_at: listing.created_at
      });
    });

    res.json({
      success: true,
      listings: listings,
      message: 'Debug data retrieved'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Enhanced listing details with category-specific schema
export const getListingDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listings.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle_types: {
          select: {
            id: true,
            name: true
          }
        },
        brands: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        },
        models: {
          select: {
            id: true,
            name: true
          }
        },
        variants: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        districts: {
          select: {
            id: true,
            name: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            email: true
          }
        },
        listing_properties: {
          select: {
            key: true,
            value: true,
            type: true
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({ success: false, error: 'Listing not found' });
      return;
    }

    // Increment view count
    await prisma.listings.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    });

    // Schema bilgilerini listing_properties'den çıkartıyoruz
    const propertyKeys = [...new Set(listing.listing_properties?.map(prop => prop.key) || [])];
    
    // Basit schema oluşturmak için property'leri grupluyoruz  
    const schemaGroups = [{
      key: 'details',
      label: 'İlan Detayları',
      order: 1,
      attributes: propertyKeys.map((key, index) => ({
        key,
        label: key,
        data_type: 'STRING',
        is_required: false,
        order: index
      }))
    }];

    // Process media from listings.images field (JSON array)
    const media: any[] = [];
    
    if (listing.images) {
      try {
        const imageUrls = typeof listing.images === 'string' 
          ? JSON.parse(listing.images) 
          : Array.isArray(listing.images) 
            ? listing.images 
            : [];
            
        if (Array.isArray(imageUrls)) {
          media.push(...imageUrls.map((url: string, index: number) => ({
            url,
            alt: listing.title,
            sort: index
          })));
        }
      } catch (e) {
        console.log('Error parsing images from listings.images:', e);
      }
    }

    // Convert properties to values with proper types
    const values: Record<string, any> = {};
    listing.listing_properties?.forEach(prop => {
      try {
        switch (prop.type) {
          case 'NUMBER':
            values[prop.key] = prop.value ? parseFloat(prop.value) : null;
            break;
          case 'BOOLEAN':
            values[prop.key] = prop.value === 'true' || prop.value === '1';
            break;
          case 'MULTISELECT':
            values[prop.key] = prop.value ? JSON.parse(prop.value) : [];
            break;
          default:
            values[prop.key] = prop.value || null;
        }
      } catch (e) {
        values[prop.key] = prop.value;
      }
    });

    // Add base vehicle properties
    if (listing.year) values.year = listing.year;
    if (listing.km) values.km = listing.km;
    if (listing.fuel_type) values.fuel_type = listing.fuel_type;
    if (listing.transmission) values.transmission = listing.transmission;
    if (listing.engine_power) values.engine_power = listing.engine_power;
    if (listing.color) values.color = listing.color;
    if (listing.vehicle_condition) values.vehicle_condition = listing.vehicle_condition;

    // Features'ları işle
    let processedFeatures: Record<string, string> = {};
    if (listing.features) {
      try {
        const features = typeof listing.features === 'string' 
          ? JSON.parse(listing.features) 
          : listing.features;
        
        if (features && typeof features === 'object') {
          Object.keys(features).forEach(key => {
            if (features[key] === true) {
              processedFeatures[key] = 'Evet';
            } else if (features[key] === false) {
              processedFeatures[key] = 'Hayır';
            } else if (features[key]) {
              processedFeatures[key] = String(features[key]);
            }
          });
        }
      } catch (e) {
        console.log('Error parsing features:', e);
      }
    }

    const response = {
      success: true,
      data: {
        base: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: Number(listing.price),
          status: listing.status,
          isApproved: listing.is_approved,
          views: listing.view_count || 0,
          category: {
            id: listing.categories?.id || listing.category_id,
            name: listing.categories?.name || 'Kategori',
            slug: listing.categories?.name?.toLowerCase().replace(/\s+/g, '-') || 'kategori'
          },
          vehicle_type: {
            id: listing.vehicle_types?.id || listing.vehicle_type_id,
            name: listing.vehicle_types?.name || 'Tür',
            slug: listing.vehicle_types?.name?.toLowerCase().replace(/\s+/g, '-') || 'vehicle'
          },
          brand: listing.brands ? {
            id: listing.brands.id,
            name: listing.brands.name
          } : null,
          model: listing.models ? {
            id: listing.models.id,
            name: listing.models.name
          } : null,
          variant: listing.variants ? {
            id: listing.variants.id,
            name: listing.variants.name
          } : null,
          year: listing.year,
          km: listing.km,
          locationText: `${listing.districts?.name || ''}, ${listing.cities?.name || ''}`.replace(/^, |, $/, '') || 'Konum belirtilmemiş',
          createdAt: listing.created_at,
          updatedAt: listing.updated_at,
          seller: {
            name: listing.seller_name || `${listing.users?.first_name} ${listing.users?.last_name}`.trim(),
            phone: listing.seller_phone || listing.users?.phone,
            email: listing.seller_email || listing.users?.email
          },
          media,
          features: processedFeatures // İşlenmiş features'ı ekle
        },
        schema: {
          groups: schemaGroups,
          flat: propertyKeys.map((key, index) => ({
            key,
            label: key,
            data_type: 'STRING',
            is_required: false,
            order: index
          }))
        },
        values
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching listing details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listings.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle_types: {
          select: {
            id: true,
            name: true
          }
        },
        brands: {
          select: {
            id: true,
            name: true,
            image_url: true
          }
        },
        models: {
          select: {
            id: true,
            name: true
          }
        },
        variants: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        districts: {
          select: {
            id: true,
            name: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            phone: true,
            role: true,
            is_active: true,
            is_email_verified: true,
            created_at: true,
            updated_at: true
          }
        },
        listing_images: {
          select: {
            id: true,
            url: true,
            alt: true,
            sort_order: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        },
        listing_properties: {
          select: {
            id: true,
            key: true,
            value: true,
            type: true
          }
        }
      }
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Increment view count
    await prisma.listings.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    });

    // Transform data to match frontend Listing interface
    const response = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: Number(listing.price),
      categoryId: listing.category_id,
      category: {
        id: listing.categories?.id || listing.category_id,
        name: listing.categories?.name || 'Kategori Bulunamadı',
        slug: 'kategori',
        createdAt: new Date()
      },
      userId: listing.user_id,
      user: {
        id: listing.users?.id || listing.user_id,
        email: listing.users?.email || '',
        username: listing.users?.username || 'kullanici',
        first_name: listing.users?.first_name || 'Ad',
        last_name: listing.users?.last_name || 'Soyad',
        phone: listing.users?.phone || '',
        role: listing.users?.role || 'USER',
        is_active: listing.users?.is_active ?? true,
        is_email_verified: listing.users?.is_email_verified ?? false,
        created_at: listing.users?.created_at || new Date(),
        updated_at: listing.users?.updated_at || new Date()
      },
      images: (() => {
        // First try listing_images relation
        if (listing.listing_images && listing.listing_images.length > 0) {
          return listing.listing_images.map((img: any) => img.url);
        }
        // Then try JSON images field
        if (listing.images) {
          try {
            const parsedImages = typeof listing.images === 'string' 
              ? JSON.parse(listing.images) 
              : listing.images;
            return Array.isArray(parsedImages) ? parsedImages : [];
          } catch (e) {
            console.warn('Failed to parse images JSON:', listing.images);
            return [];
          }
        }
        return [];
      })(),
      listing_properties: listing.listing_properties || [],
      location: `${listing.districts?.name || ''}, ${listing.cities?.name || ''}`.replace(/^, |, $/, '') || 'Konum belirtilmemiş',
      status: listing.status,
      isApproved: listing.is_approved || false,
      views: listing.view_count || 0,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      
      // Comprehensive vehicle details from database
      year: listing.year,
      km: listing.km,
      fuel_type: listing.fuel_type,
      transmission: listing.transmission,
      engine_power: listing.engine_power,
      engine_volume: listing.engine_volume,
      color: listing.color,
      vehicle_condition: listing.vehicle_condition,
      license_plate: listing.license_plate,
      is_exchangeable: listing.is_exchangeable,
      
      // Relations with full details
      brands: listing.brands,
      models: listing.models,
      variants: listing.variants,
      categories: listing.categories,
      vehicle_types: listing.vehicle_types,
      cities: listing.cities,
      districts: listing.districts,
      
      // Legacy fields for backward compatibility
      mileage: listing.km,
      fuelType: listing.fuel_type,
      brand: listing.brands?.name,
      model: listing.models?.name,
      variant: listing.variants?.name,
      view_count: listing.view_count
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement update listing
    res.status(501).json({ error: 'Update listing endpoint not implemented yet' });
  } catch (error) {
    logger.error('Error in updateListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    if (!listingId) {
      res.status(400).json({ 
        success: false, 
        message: 'Geçersiz ilan ID' 
      });
      return;
    }

    // İlanın var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
    const listing = await prisma.listings.findFirst({
      where: {
        id: listingId,
        user_id: userId
      }
    });

    if (!listing) {
      res.status(404).json({ 
        success: false, 
        message: 'İlan bulunamadı veya size ait değil' 
      });
      return;
    }

    // İlana ait resimleri de sil
    await prisma.listing_images.deleteMany({
      where: {
        listing_id: listingId
      }
    });

    // İlanı sil
    await prisma.listings.delete({
      where: {
        id: listingId
      }
    });

    res.json({ 
      success: true, 
      message: 'İlan başarıyla silindi' 
    });

  } catch (error) {
    logger.error('Error in deleteListing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İlan silinirken hata oluştu',
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

export const debugListingImages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Tüm listing_images'ı getir
    const allImages = await prisma.listing_images.findMany({
      include: {
        listings: {
          select: {
            id: true,
            title: true,
            user_id: true
          }
        }
      }
    });

    // Tüm listings'leri getir
    const allListings = await prisma.listings.findMany({
      select: {
        id: true,
        title: true,
        user_id: true,
        listing_images: {
          select: {
            id: true,
            url: true,
            sort_order: true
          }
        }
      }
    });

    res.json({
      total_images: allImages.length,
      total_listings: allListings.length,
      images: allImages,
      listings_with_images: allListings
    });
  } catch (error) {
    logger.error('Error in debugListingImages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Toplam ilan sayısını al
    const totalCount = await prisma.listings.count({
      where: {
        user_id: userId
      }
    });

    const listings = await prisma.listings.findMany({
      where: {
        user_id: userId
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        year: true,
        km: true,
        seller_phone: true,
        created_at: true,
        user_id: true,
        view_count: true,
        status: true,
        is_approved: true,
        images: true,
        listing_images: {
          select: {
            url: true,
            sort_order: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        },
        categories: {
          select: {
            name: true
          }
        },
        vehicle_types: {
          select: {
            name: true
          }
        },
        brands: {
          select: {
            name: true
          }
        },
        models: {
          select: {
            name: true
          }
        },
        cities: {
          select: {
            name: true
          }
        },
        districts: {
          select: {
            name: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    });

    console.log('🖼️ getUserListings - Raw listings from DB:', listings.length);
    if (listings.length > 0) {
      console.log('🖼️ First listing images field:', listings[0].images);
      console.log('🖼️ First listing_images relation:', listings[0].listing_images);
      console.log('🖼️ First listing raw:', JSON.stringify(listings[0], null, 2));
    }

    // Transform data to match frontend interface
    const transformedListings = listings.map(listing => ({
      id: listing.id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      year: listing.year,
      kilometers: listing.km || 0,
      km: listing.km || 0,
      seller_phone: listing.seller_phone,
      status: listing.status,
      is_approved: listing.is_approved,
      city_name: listing.cities?.name || '',
      district_name: listing.districts?.name || '',
      images: listing.images || listing.listing_images.map(img => img.url),
      listing_images: listing.listing_images.map(img => ({
        url: img.url,
        sort_order: img.sort_order
      })),
      created_at: listing.created_at.toISOString(),
      user_id: listing.user_id.toString(),
      view_count: listing.view_count || 0,
      categories: { name: listing.categories?.name || '' },
      vehicle_types: { name: listing.vehicle_types?.name || '' },
      brands: { name: listing.brands?.name || '' },
      models: { name: listing.models?.name || '' },
      cities: { name: listing.cities?.name || '' },
      districts: { name: listing.districts?.name || '' },
      users: listing.users ? {
        id: listing.users.id.toString(),
        first_name: listing.users.first_name,
        last_name: listing.users.last_name,
        phone: listing.users.phone
      } : null,
      // Backward compatibility
      category: { name: listing.categories?.name || '' },
      brand: { name: listing.brands?.name || '' },
      model: { name: listing.models?.name || '' },
      user: listing.users ? {
        first_name: listing.users.first_name,
        last_name: listing.users.last_name,
        phone: listing.users.phone
      } : { first_name: '', last_name: '', phone: '' }
    }));

    // Sayfalama bilgileri
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        listings: transformedListings,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error in getUserListings:', error);
    res.status(500).json({ 
      success: false,
      message: 'İlanlar yüklenirken hata oluştu',
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement toggle favorite
    res.status(501).json({ error: 'Toggle favorite endpoint not implemented yet' });
  } catch (error) {
    logger.error('Error in toggleFavorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement get user favorites
    res.status(501).json({ error: 'Get favorites endpoint not implemented yet' });
  } catch (error) {
    logger.error('Error in getFavorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
