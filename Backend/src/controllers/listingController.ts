import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { normalizeFeatures, safeStringify } from '../utils/normalize';

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
    console.log('✨ Features data:', {
      features: req.body.features,
      featuresType: typeof req.body.features,
      featuresKeys: req.body.features ? Object.keys(req.body.features) : 'no keys',
      trueFeatures: req.body.features ? Object.keys(req.body.features).filter(key => req.body.features[key] === true) : 'no true features'
    });
    console.log('🔧 SafetyFeatures data:', {
      safetyFeatures: req.body.safetyFeatures,
      safetyFeaturesType: typeof req.body.safetyFeatures,
      safetyFeaturesLength: req.body.safetyFeatures?.length || 0,
      safetyFeaturesItems: req.body.safetyFeatures || 'no items'
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
      
      // Oto Kurtarıcı Taşıyıcı özel alanları
      safetyFeatures,
      
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
        features: safeStringify(normalizeFeatures(features)),
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
      // Boolean değerler için genel çeviri
      if (value === 'true' || value === 'false') {
        return value === 'true' ? 'Evet' : 'Hayır';
      }
      
      const valueMap: { [key: string]: { [value: string]: string } } = {
        'exchangeable': {
          'evet': 'Evet',
          'hayır': 'Hayır',
          'yes': 'Evet',
          'no': 'Hayır',
          'true': 'Evet',
          'false': 'Hayır'
        },
        'takas': {
          'evet': 'Evet', 
          'hayır': 'Hayır',
          'true': 'Evet',
          'false': 'Hayır'
        },
        'negotiable': {
          'evet': 'Evet',
          'hayır': 'Hayır',
          'true': 'Evet',
          'false': 'Hayır'
        },
        'warranty': {
          'evet': 'Evet',
          'hayır': 'Hayır',
          'true': 'Evet',
          'false': 'Hayır'
        },
        'krikoAyak': {
          'true': 'Var',
          'false': 'Yok'
        },
        'takasli': {
          'true': 'Evet',
          'false': 'Hayır'
        },
        'devrilmeArkaya': {
          'true': 'Var',
          'false': 'Yok'
        },
        'devrilmeSaga': {
          'true': 'Var',
          'false': 'Yok'
        },
        'devrilmeSola': {
          'true': 'Var',
          'false': 'Yok'
        },
        'uzatilabilirProfil': {
          'true': 'Var',
          'false': 'Yok'
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
        
        // Güvenlik Features
        'abs': 'ABS',
        'adr': 'ADR',
        'alarm': 'Alarm',
        'asr': 'ASR (Çekiş Kontrolü)',
        'ebv': 'EBV (Fren Güçü Dağıtımı)',
        'esp': 'ESP',
        'havaPastigiSurucu': 'Hava Yastığı (Sürücü)',
        'havaPastigiYolcu': 'Hava Yastığı (Yolcu)',
        'immobilizer': 'Immobilizer',
        'merkeziKilit': 'Merkezi Kilit',
        'retarder': 'Retarder',
        'yokusKalkisDestegi': 'Yokuş Kalkış Desteği',
        'yanHavaYastigi': 'Yan Hava Yastığı',
        
        // İç Donanım Features
        'cdCalar': 'CD Çalar',
        'deriDoseme': 'Deri Döşeme',
        'elektrikliAynalar': 'Elektrikli Aynalar',
        'elektrikliCam': 'Elektrikli Cam',
        'esnekOkumaLambasi': 'Esnek Okuma Lambası',
        'havaliKoltuk': 'Havalı Koltuk',
        'hizSabitleyici': 'Hız Sabitleyici',
        'hidrolikDireksiyon': 'Hidrolik Direksiyon',
        'isitmalıKoltuklar': 'Isıtmalı Koltuklar',
        'klima': 'Klima',
        'masa': 'Masa',
        'radioTeyp': 'Radyo / Teyp',
        'startStop': 'Start & Stop',
        'tvNavigasyon': 'TV / Navigasyon',
        'yolBilgisayari': 'Yol Bilgisayarı',
        
        // Dış Donanım Features  
        'alasimJant': 'Alaşım Jant',
        'camRuzgarligi': 'Cam Rüzgarlığı',
        'cekiDemiri': 'Çeki Demiri',
        'eskneOkumaLambasi': 'Esnek Okuma Lambası',
        'sunroof': 'Sunroof',
        'spoyler': 'Spoyler',
        'hafizaliKoltuklar': 'Hafızalı Koltuklar',
        
        // Sensör & Aydınlatma
        'farSensoru': 'Far Sensörü',
        'yagmurSensoru': 'Yağmur Sensörü',
        'sisFari': 'Sis Farı',
        'xenonFar': 'Xenon Far',
        'farYikamaSistemi': 'Far Yıkama Sistemi',
        
        // Park & Görüntüleme
        'geriGorusKamerasi': 'Geri Görüş Kamerası',
        'parkSensoru': 'Park Sensörü',
        
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
      console.log('🏗️ Processing properties:', Object.keys(properties));
      
      try {
        const propertyPromises = Object.entries(properties).map(async ([key, value], index) => {
          // Boolean değerleri dahil olmak üzere tüm anlamlı değerleri kaydet
          // Sadece undefined, null ve boş string değerleri filtrele
          const shouldSave = value !== undefined && 
                            value !== null && 
                            (typeof value === 'boolean' || 
                             typeof value === 'number' || 
                             Array.isArray(value) || 
                             (typeof value === 'string' && value !== ''));
          
          if (shouldSave) {
            // Değerin tipini belirle
            let propertyType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'MULTISELECT' = 'STRING';
            let propertyValue = String(value);
            
            if (typeof value === 'boolean') {
              propertyType = 'BOOLEAN';
              propertyValue = value ? 'true' : 'false';
            } else if (typeof value === 'number') {
              propertyType = 'NUMBER';
              propertyValue = String(value);
            } else if (Array.isArray(value)) {
              propertyType = 'MULTISELECT';
              propertyValue = value.join(',');
            }
            
            // Daha güvenli ID üretimi
            const uniqueId = `prop_${listing.id}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`;
            
            console.log(`💾 Saving property: ${key} = ${propertyValue} (${propertyType}) [original: ${value}] [id: ${uniqueId}]`);
            
            try {
              return await prisma.listing_properties.create({
                data: {
                  id: uniqueId,
                  listing_id: listing.id,
                  key: getPropertyDisplayName(key), // Türkçe isim kullan
                  value: getPropertyDisplayValue(key, propertyValue), // Türkçe value kullan
                  type: propertyType // Dinamik tip belirleme
                }
              });
            } catch (propError) {
              console.error(`❌ Error saving property ${key}:`, propError);
              return null;
            }
          }
          return null;
        });

        const resolvedProperties = await Promise.all(propertyPromises);
        const successfulProperties = resolvedProperties.filter(Boolean);
        
        if (successfulProperties.length > 0) {
          console.log('✅ Properties saved successfully:', successfulProperties.length, 'out of', Object.keys(properties).length);
        }
      } catch (error) {
        console.error('❌ Error processing properties:', error);
      }
    }

    // Features varsa bunları da listing_properties'e kaydet
    if (features && typeof features === 'object') {
      console.log('🎯 Processing features for listing_properties:', {
        totalFeatures: Object.keys(features).length,
        trueFeatures: Object.keys(features).filter(key => features[key] === true),
        featuresData: features
      });
      
      try {
        const featurePromises = Object.entries(features).map(async ([key, value], index) => {
          // Sadece true olan features'ları kaydet
          if (value === true) {
            // Daha güvenli ID üretimi
            const uniqueId = `feat_${listing.id}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`;
            
            console.log(`💾 Saving feature: ${key} = true [id: ${uniqueId}]`);
            
            try {
              return await prisma.listing_properties.create({
                data: {
                  id: uniqueId,
                  listing_id: listing.id,
                  key: getPropertyDisplayName(key), // Türkçe isim kullan
                  value: 'Var', // True features için "Var" değeri
                  type: 'BOOLEAN'
                }
              });
            } catch (featError) {
              console.error(`❌ Error saving feature ${key}:`, featError);
              return null;
            }
          }
          return null;
        });

        const resolvedFeatures = await Promise.all(featurePromises);
        const successfulFeatures = resolvedFeatures.filter(Boolean);
        
        if (successfulFeatures.length > 0) {
          console.log('✅ Features saved to listing_properties successfully:', successfulFeatures.length, 'features');
        } else {
          console.log('⚠️ No features were true or saved');
        }
      } catch (error) {
        console.error('❌ Error processing features:', error);
      }
    }

    // SafetyFeatures varsa bunları da listing_properties'e kaydet (Oto Kurtarıcı Taşıyıcı için)
    if (safetyFeatures && Array.isArray(safetyFeatures)) {
      console.log('🔧 Processing safetyFeatures for listing_properties:', {
        totalSafetyFeatures: safetyFeatures.length,
        safetyFeaturesData: safetyFeatures
      });
      
      try {
        const safetyFeaturePromises = safetyFeatures.map(async (feature: string, index: number) => {
          if (feature && typeof feature === 'string' && feature.trim() !== '') {
            // Daha güvenli ID üretimi
            const uniqueId = `safety_${listing.id}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`;
            
            console.log(`💾 Saving safetyFeature: ${feature} [id: ${uniqueId}]`);
            
            try {
              return await prisma.listing_properties.create({
                data: {
                  id: uniqueId,
                  listing_id: listing.id,
                  key: getPropertyDisplayName(feature.trim()), // Türkçe isim kullan
                  value: 'Var', // Safety features için "Var" değeri
                  type: 'BOOLEAN'
                }
              });
            } catch (safetyError) {
              console.error(`❌ Error saving safetyFeature ${feature}:`, safetyError);
              return null;
            }
          }
          return null;
        });

        const resolvedSafetyFeatures = await Promise.all(safetyFeaturePromises);
        const successfulSafetyFeatures = resolvedSafetyFeatures.filter(Boolean);
        
        if (successfulSafetyFeatures.length > 0) {
          console.log('✅ SafetyFeatures saved to listing_properties successfully:', successfulSafetyFeatures.length, 'features');
        }
      } catch (error) {
        console.error('❌ Error processing safetyFeatures:', error);
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
      category, // Kategori ismi ile filtreleme için
      vehicle_type_id,
      vehicle_type, // Vehicle type ismi ile filtreleme için
      brand_id,
      brand, // Marka ismi ile filtreleme için  
      model_id,
      model, // Model ismi ile filtreleme için
      city_id,
      city, // Şehir ismi ile filtreleme için
      district_id,
      district, // İlçe ismi ile filtreleme için
      min_price,
      max_price,
      priceMin, // Frontend'den gelen format
      priceMax, // Frontend'den gelen format
      min_year,
      max_year,
      yearMin, // Frontend'den gelen format
      yearMax, // Frontend'den gelen format
      kmMin, // Kilometre min
      kmMax, // Kilometre max
      search,
      isCorporate, // Kurumsal filtresi
      user_id // Belirli bir kullanıcının ilanlarını filtrelemek için
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where: any = {
      is_active: true,
      is_approved: true
    };

    console.log('🔍 Initial where clause:', where);

    if (category_id) where.category_id = category_id as string;
    if (user_id) where.user_id = user_id as string;
    
    // Kategori ismi ile filtreleme - aslında vehicle_types tablosunda ara
    if (category) {
      // Frontend'den gelen kategori isimleri vehicle_type isimleriyle eşleşir
      const categoryMapping: Record<string, string> = {
        'cekici': 'Çekici',
        'dorse': 'Dorse',
        'kamyon': 'Kamyon & Kamyonet',
        'romork': 'Römork',
        'minibus': 'Minibüs & Midibüs',
        'otobus': 'Otobüs',
        'karoser': 'Karoser & Üst Yapı',
        'kurtarici': 'Oto Kurtarıcı & Taşıyıcı'
      };
      
      const vehicleTypeName = categoryMapping[category as string];
      if (vehicleTypeName) {
        where.vehicle_types = {
          name: {
            equals: vehicleTypeName,
            mode: 'insensitive'
          }
        };
        console.log('🎯 Category filter applied:', category, '->', vehicleTypeName);
      }
    }
    
    // Vehicle type ismi ile filtreleme
    if (vehicle_type) {
      where.vehicle_types = {
        name: {
          equals: vehicle_type as string,
          mode: 'insensitive'
        }
      };
    }
    
    // Marka filtreleme (ID veya isim)
    if (vehicle_type_id) where.vehicle_type_id = vehicle_type_id as string;
    if (brand_id) where.brand_id = brand_id as string;
    if (brand) {
      where.brands = {
        name: {
          contains: brand as string,
          mode: 'insensitive'
        }
      };
    }
    
    // Model filtreleme (ID veya isim)
    if (model_id) where.model_id = model_id as string;
    if (model) {
      where.models = {
        name: {
          contains: model as string,
          mode: 'insensitive'
        }
      };
    }
    
    // Şehir/İlçe filtreleme (ID veya isim)
    if (city_id) where.city_id = city_id as string;
    if (city) {
      where.cities = {
        name: {
          contains: city as string,
          mode: 'insensitive'
        }
      };
    }
    
    if (district_id) where.district_id = district_id as string;
    if (district) {
      where.districts = {
        name: {
          contains: district as string,
          mode: 'insensitive'
        }
      };
    }

    // Fiyat filtreleme (eski ve yeni formatları destekle)
    const minPriceValue = priceMin || min_price;
    const maxPriceValue = priceMax || max_price;
    if (minPriceValue || maxPriceValue) {
      where.price = {};
      if (minPriceValue) where.price.gte = Number(minPriceValue);
      if (maxPriceValue) where.price.lte = Number(maxPriceValue);
    }

    // Yıl filtreleme (eski ve yeni formatları destekle)  
    const minYearValue = yearMin || min_year;
    const maxYearValue = yearMax || max_year;
    if (minYearValue || maxYearValue) {
      where.year = {};
      if (minYearValue) where.year.gte = Number(minYearValue);
      if (maxYearValue) where.year.lte = Number(maxYearValue);
    }

    // Kilometre filtreleme
    if (kmMin || kmMax) {
      where.km = {};
      if (kmMin) where.km.gte = Number(kmMin);
      if (kmMax) where.km.lte = Number(kmMax);
    }

    // Kurumsal filtreleme
    if (isCorporate !== undefined) {
      where.users = {
        is_corporate: isCorporate === 'true'
      };
    }

    // Arama filtreleme (başlık, açıklama, marka, model)
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brands: { name: { contains: search as string, mode: 'insensitive' } } },
        { models: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

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
          listing_images: {
            select: {
              id: true,
              url: true,
              alt: true,
              sort_order: true
            }
          },
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
              // @ts-ignore - Prisma type issue with corporate fields
              is_corporate: true,
              // @ts-ignore - Prisma type issue with corporate fields  
              company_name: true
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
    console.log('📋 Category filter applied:', category);
    console.log('📋 Total listings found:', total);

    
    res.json({
      success: true,
      data: responseData
    });
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

    // Get category attributes schema
    console.log('📋 Listing details query completed:', {
      listingId: listing.id,
      hasProperties: !!listing.listing_properties?.length,
      propertiesCount: listing.listing_properties?.length || 0
    });

    // Process media from listings.images field
    let media = [];
    if (listing.images) {
      try {
        const imageArray = Array.isArray(listing.images) 
          ? listing.images 
          : JSON.parse(String(listing.images));
        media = imageArray.map((img: any, index: number) => ({
          url: typeof img === 'string' ? img : img.url || img,
          alt: listing.title,
          sort: index
        }));
      } catch (e) {
        console.warn('Failed to parse images:', listing.images);
        media = [];
      }
    }

    console.log('📸 Media processing:', {
      listingId: listing.id,
      hasImages: !!listing.images,
      rawImages: listing.images,
      processedMedia: media
    });

    // Convert properties to values with proper types
    const values: Record<string, any> = {};
    
    // Process listing_properties
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

    // Process features from listings.features field
    let processedFeatures: Record<string, any> = {};
    
    console.log('🎯 Raw features field:', {
      listingId: listing.id,
      hasFeatures: !!listing.features,
      rawFeatures: listing.features,
      featuresType: typeof listing.features
    });
    
    if (listing.features) {
      try {
        let featuresData: any = null;
        
        // [object Object] string kontrolü
        if (typeof listing.features === 'string' && listing.features.includes('[object Object]')) {
          console.log('⚠️ Features field contains [object Object], skipping JSON parse');
          featuresData = {};
        } else if (typeof listing.features === 'string') {
          // Normal JSON string parse et
          featuresData = JSON.parse(listing.features);
        } else if (Array.isArray(listing.features)) {
          // Zaten array
          featuresData = listing.features;
        } else if (typeof listing.features === 'object') {
          // Zaten object
          featuresData = listing.features;
        } else {
          console.log('⚠️ Unknown features type:', typeof listing.features);
          featuresData = {};
        }
        
        console.log('🎯 Parsed features data:', featuresData);
        
        if (Array.isArray(featuresData)) {
          // Array format: ["feature1", "feature2"] → {feature1: true, feature2: true}
          featuresData.forEach(feature => {
            if (feature && typeof feature === 'string') {
              processedFeatures[feature] = true;
            }
          });
        } else if (typeof featuresData === 'object' && featuresData !== null) {
          // Object format - features olarak işle (her key'i true yap)
          Object.keys(featuresData).forEach(key => {
            processedFeatures[key] = true;
          });
        }
        
        console.log('🎯 Features from listings.features:', {
          listingId: listing.id,
          rawFeatures: listing.features,
          parsedFeatures: featuresData,
          processedFeatures
        });
      } catch (e) {
        console.warn('Failed to parse features:', listing.features, 'Error:', e);
        processedFeatures = {};
      }
    }
    
    // BOOLEAN ve checkbox türündeki listing_properties'leri de features olarak ekle
    const booleanProperties: Record<string, boolean> = {};
    console.log('🔍 Processing listing_properties for features:', {
      listingId: listing.id,
      totalProperties: listing.listing_properties?.length || 0,
      properties: listing.listing_properties?.map(p => ({ key: p.key, value: p.value, type: p.type }))
    });
    
    // Checkbox özellik isimleri (formda kullanılan) - ARTIK GEREKLİ DEĞİL, DİNAMİK OLARAK ALGILA
    // const CHECKBOX_FEATURES = [
    //   'airConditioning', 'abs', 'bluetooth', 'gps', 'sunroof', 'heater',
    //   'electricWindows', 'electricMirrors', 'cruiseControl', 'parkingSensor',
    //   'reverseCamera', 'fogLights', 'xenonLights', 'ledLights', 'alloyWheels',
    //   'radio', 'cdPlayer', 'immobilizer', 'centralLocking', 'keylessEntry',
    //   'startStop', 'airbag', 'esp', 'radioTape', 'tvNavigation'
    // ];
    
    listing.listing_properties?.forEach(prop => {
      if (prop.type === 'BOOLEAN') {
        const boolValue = prop.value === 'true' || prop.value === '1';
        booleanProperties[prop.key] = boolValue;
        console.log(`🎯 BOOLEAN Property: ${prop.key} = ${prop.value} → ${boolValue}`);
        
        // BOOLEAN tüm özellikler features'a eklenir (true/false fark etmez)
        processedFeatures[prop.key] = boolValue;
        console.log(`✅ Added BOOLEAN to features: ${prop.key} = ${boolValue}`);
        
      } else if (prop.type === 'STRING' && (prop.value === 'true' || prop.value === 'false')) {
        // STRING tipinde ama "true"/"false" değeri olan tüm property'ler checkbox'tır
        const boolValue = prop.value === 'true';
        console.log(`🎯 CHECKBOX Property (dynamic): ${prop.key} = ${prop.value} → ${boolValue}`);
        
        // Checkbox olan tüm özellikler features'a eklenir (true/false fark etmez)
        processedFeatures[prop.key] = boolValue;
        console.log(`✅ Added dynamic checkbox to features: ${prop.key} = ${boolValue}`);
        
      } else if (prop.type === 'STRING' && prop.key === 'features') {
        // Features field'ını ayrıca parse et
        try {
          const featuresValue = JSON.parse(prop.value);
          if (typeof featuresValue === 'object' && featuresValue !== null) {
            Object.entries(featuresValue).forEach(([key, value]) => {
              if (value === true || value === 'true') {
                processedFeatures[key] = true;
                console.log(`✅ Added from features property: ${key} = true`);
              }
            });
          }
        } catch (e) {
          console.warn(`Failed to parse features property: ${prop.value}`);
        }
      }
    });
    
    console.log('📦 Final processed features:', processedFeatures);
    values.features = processedFeatures;
    
    console.log('🔧 Combined features processing:', {
      listingId: listing.id,
      fromFeaturesField: Object.keys(processedFeatures).length,
      fromBooleanProperties: Object.keys(booleanProperties).filter(k => booleanProperties[k]).length,
      finalFeatures: processedFeatures
    });

    // Add base vehicle properties
    if (listing.year) values.year = listing.year;
    if (listing.km) values.km = listing.km;
    if (listing.fuel_type) values.fuel_type = listing.fuel_type;
    if (listing.transmission) values.transmission = listing.transmission;

    console.log('🔧 Properties processing:', {
      listingId: listing.id,
      hasProperties: !!listing.listing_properties?.length,
      propertiesCount: listing.listing_properties?.length || 0,
      hasFeatures: !!listing.features,
      rawFeatures: listing.features,
      processedValues: Object.keys(values)
    });
    if (listing.engine_power) values.engine_power = listing.engine_power;
    if (listing.color) values.color = listing.color;
    if (listing.vehicle_condition) values.vehicle_condition = listing.vehicle_condition;

    // Türkçe çeviri fonksiyonu
    const translateToTurkish = (key: string): string => {
      const translations: Record<string, string> = {
        // Temel araç bilgileri
        'color': 'Renk',
        'plate_origin': 'Plaka Menşei', 
        'tire_condition': 'Lastik Durumu',
        'transmission': 'Şanzıman',
        'vehicle_condition': 'Araç Durumu',
        'vehicle_plate': 'Araç Plakası',
        'engine_power': 'Motor Gücü',
        'engine_volume': 'Motor Hacmi',
        'fuel_type': 'Yakıt Tipi',
        'motor_power': 'Motor Gücü',
        'body_type': 'Gövde Tipi',
        'cabin_type': 'Kabin Tipi',
        'damage_record': 'Hasar Kaydı',
        'paint_change': 'Boya Değişimi',
        'features': 'Özellikler',
        'Garanti': 'Garanti',
        'is_exchangeable': 'Takaslanabilir',
        'year': 'Model Yılı',
        'km': 'Kilometre',
        'price': 'Fiyat',
        
        // Otobüs özel alanları
        'passenger_capacity': 'Yolcu Kapasitesi',
        'seat_layout': 'Koltuk Düzeni',
        'seat_back_screen': 'Koltuk Arkası Ekran',
        'gear_type': 'Vites Tipi',
        'gear_count': 'Vites Sayısı',
        'fuel_capacity': 'Yakıt Kapasitesi',
        
        // Kamyon özel alanları
        'carrying_capacity': 'Taşıma Kapasitesi',
        'drive_type': 'Çekiş Türü',
        'axle_count': 'Dingil Sayısı',
        'load_capacity': 'Yük Kapasitesi',
        
        // Çekici özel alanları
        'bed_count': 'Yatak Sayısı',
        'dorse_available': 'Dorse Mevcut',
        'plate_type': 'Plaka Tipi',
        
        // Dorse/Römork alanları (formlardan)
        'length': 'Uzunluk',
        'width': 'Genişlik',
        'height': 'Yükseklik',
        'volume': 'Hacim',
        'tipping_direction': 'Devrilme Yönü',
        'genislik': 'Genişlik',
        'uzunluk': 'Uzunluk',
        'lastikDurumu': 'Lastik Durumu',
        'devrilmeYonu': 'Devrilme Yönü',
        
        // Form alanları
        'title': 'Başlık',
        'description': 'Açıklama',
        'productionYear': 'Üretim Yılı',
        'production_year': 'Üretim Yılı',
        'has_tent': 'Branda Var',
        'hasTent': 'Branda Var',
        'has_damper': 'Dampır Var',
        'hasDamper': 'Dampır Var',
        'exchangeable': 'Takaslanabilir',
        'uploadedImages': 'Yüklenen Resimler',
        'uploaded_images': 'Yüklenen Resimler',
        'images': 'Resimler',
        'priceType': 'Fiyat Tipi',
        'price_type': 'Fiyat Tipi',
        
        // Genel teknik özellikler
        'brand': 'Marka',
        'model': 'Model',
        'variant': 'Varyant',
        'chassis_type': 'Şasi Tipi',
        'roof_type': 'Tavan Tipi',
        'seat_count': 'Koltuk Sayısı',
        'pull_type': 'Çekiş',
        
        // İletişim bilgileri
        'seller_name': 'Satıcı Adı',
        'seller_phone': 'Satıcı Telefon',
        'seller_email': 'Satıcı E-posta',
        'sellerName': 'Satıcı Adı',
        'sellerPhone': 'Satıcı Telefon',
        'sellerEmail': 'Satıcı E-posta',
        'contact_name': 'İletişim Adı',
        'contactName': 'İletişim Adı',
        'phone': 'Telefon',
        'email': 'E-posta',
        'is_company': 'Firma',
        'isCompany': 'Firma',
        'company_name': 'Firma Adı',
        'companyName': 'Firma Adı',
        
        // Lokasyon
        'city': 'Şehir',
        'district': 'İlçe',
        
        // Diğer
        'currency': 'Para Birimi',
        'negotiable': 'Pazarlıklı',
        'warranty': 'Garanti',
        'exchange': 'Takas',
        
        // Form-specific fields from attached forms
        'caseType': 'Kasa Tipi',
        'case_type': 'Kasa Tipi',
        'dingilSayisi': 'Dingil Sayısı',
        'dingil_sayisi': 'Dingil Sayısı',
        'kapakYuksekligi': 'Kapak Yüksekliği',
        'kapak_yuksekligi': 'Kapak Yüksekliği',
        'istiapHaddi': 'İstiap Haddi',
        'istiap_haddi': 'İstiap Haddi',
        'krikoAyak': 'Kriko Ayak',
        'kriko_ayak': 'Kriko Ayak',
        'takasli': 'Takaslı',
        'devrilmeArkaya': 'Arkaya Devrilme',
        'devrilme_arkaya': 'Arkaya Devrilme',
        'devrilmeSaga': 'Sağa Devrilme',
        'devrilme_saga': 'Sağa Devrilme',
        'devrilmeSola': 'Sola Devrilme',
        'devrilme_sola': 'Sola Devrilme',
        'havuzDerinligi': 'Havuz Derinliği',
        'havuz_derinligi': 'Havuz Derinliği',
        'havuzGenisligi': 'Havuz Genişliği',
        'havuz_genisligi': 'Havuz Genişliği',
        'havuzUzunlugu': 'Havuz Uzunluğu',
        'havuz_uzunlugu': 'Havuz Uzunluğu',
        'hidrolikSistem': 'Hidrolik Sistem',
        'hidrolik_sistem': 'Hidrolik Sistem',
        'uzatilabilirProfil': 'Uzatılabilir Profil',
        'uzatilabilir_profil': 'Uzatılabilir Profil',
        'TippingDirection' : 'Devrilme Yönü'
      };
      
      return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // listings_properties tablosundan dinamik schema oluştur
    const dynamicAttributes = listing.listing_properties?.map(prop => ({
      key: prop.key,
      label: translateToTurkish(prop.key), // Türkçe çeviri kullan
      type: prop.type || 'STRING',
      is_required: false,
      sort_order: 0,
      data_type: prop.type || 'STRING'
    })) || [];

    console.log('🏗️ Dynamic attributes from listings_properties:', {
      count: dynamicAttributes.length,
      attributes: dynamicAttributes.map(attr => ({ key: attr.key, label: attr.label, type: attr.type }))
    });

    // Group attributes by logical groups using dynamic properties
    const groupedAttributes = dynamicAttributes.reduce((acc, attr) => {
      // Gelişmiş gruplama mantığı
      let groupKey = 'specs';
      const key = attr.key.toLowerCase();
      
      if (key.includes('engine') || key.includes('motor') || key.includes('power') || key.includes('fuel') || key.includes('yakıt')) {
        groupKey = 'engine';
      } else if (key.includes('dimension') || key.includes('length') || key.includes('width') || key.includes('height') || 
                 key.includes('boyut') || key.includes('uzunluk') || key.includes('genişlik') || key.includes('yükseklik')) {
        groupKey = 'dimensions';
      } else if (key.includes('feature') || key.includes('safety') || key.includes('comfort') || key.includes('özellik') ||
                 key.includes('güvenlik') || key.includes('konfor') || attr.type === 'BOOLEAN' || 
                 (attr.type === 'STRING' && (values[attr.key] === 'true' || values[attr.key] === 'false'))) {
        groupKey = 'features';
      } else if (key.includes('color') || key.includes('renk') || key.includes('condition') || key.includes('durum') ||
                 key.includes('transmission') || key.includes('vites') || key.includes('plate') || key.includes('plaka')) {
        groupKey = 'general';
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          key: groupKey,
          label: groupKey === 'engine' ? 'Motor & Performans' : 
                 groupKey === 'dimensions' ? 'Boyutlar' :
                 groupKey === 'features' ? 'Özellikler' : 
                 groupKey === 'general' ? 'Genel Bilgiler' : 'Teknik Özellikler',
          order: groupKey === 'general' ? 1 : 
                 groupKey === 'engine' ? 2 : 
                 groupKey === 'dimensions' ? 3 : 
                 groupKey === 'features' ? 4 : 5,
          attributes: []
        };
      }

      acc[groupKey].attributes.push({
        key: attr.key,
        label: attr.label,
        data_type: attr.data_type,
        is_required: attr.is_required,
        order: attr.sort_order
      });

      return acc;
    }, {} as Record<string, any>);

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
          features: values.features || {} // Frontend'de base.features olarak beklendiği için
        },
        schema: {
          groups: Object.values(groupedAttributes).sort((a, b) => a.order - b.order),
          flat: dynamicAttributes.map(attr => ({
            key: attr.key,
            label: attr.label,
            data_type: attr.data_type,
            is_required: attr.is_required,
            order: attr.sort_order
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
    const listingId = req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // İlanın varlığını ve sahipliğini kontrol et
    const existingListing = await prisma.listings.findFirst({
      where: {
        id: listingId,
        user_id: userId // Sadece kendi ilanını düzenleyebilir
      }
    });

    if (!existingListing) {
      res.status(404).json({ error: 'Listing not found or you are not authorized to edit it' });
      return;
    }

    const updateData: any = { ...req.body };
    
    // Düzenleme yapıldığında tekrar onay sürecine sokulur
    updateData.is_pending = true;
    updateData.is_approved = false;
    updateData.is_active = false; // Onay beklerken aktif değil
    updateData.updated_at = new Date();

    // Güncellenmiş ilanı kaydet
    const updatedListing = await prisma.listings.update({
      where: { id: listingId },
      data: updateData
    });

    logger.info(`Listing ${listingId} updated by user ${userId} and moved to pending approval`);

    res.json({
      success: true,
      message: 'İlan başarıyla güncellendi. Admin onayından sonra yayınlanacaktır.',
      data: updatedListing
    });

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
    } else {
      console.log('🖼️ User has no listings');
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
