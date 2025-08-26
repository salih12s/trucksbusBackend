import { ReactNode } from 'react';
import { 
  LocalShipping, 
  AcUnit, 
  DirectionsBus, 
  Agriculture,
  Construction,
  LocalGasStation,
  Build,
  Category as CategoryIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  AirlineSeatReclineNormal,
  People,
  Straighten,
  Inventory,
  Umbrella
} from '@mui/icons-material';

// Configuration-based system - tek template, çoklu config
export interface CategoryConfig {
  // Ana görsel özellikler
  heroColor: string;
  badge?: string;
  icon: any;
  
  // Hangi alanlar öncelikli gösterilsin
  priorityFields: string[];
  
  // Alan grupları nasıl organize edilsin
  fieldGroups: {
    [groupName: string]: {
      label: string;
      fields: string[];
      icon?: any;
      order: number;
    };
  };
  
  // Özel formatlamalar
  fieldFormatters?: {
    [fieldName: string]: (value: any) => ReactNode;
  };
}
export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  // 🧊 FRİGOFİRİK (Soğutuculu Araçlar)
  'frigofirik': {
    heroColor: '#2196f3', // Mavi
    badge: 'Soğutma Sistemi',
    icon: AcUnit,
    priorityFields: ['uzunluk', 'sogutucu', 'lastikDurumu', 'year'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'year', 'price']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: Build,
        order: 2,
        fields: ['uzunluk', 'sogutucu', 'lastikDurumu']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 3,
        fields: ['warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🚌 OTOBÜSLER
  'otobus': {
    heroColor: '#9c27b0', // Mor
    badge: 'Yolcu Taşıma',
    icon: DirectionsBus,
    priorityFields: ['passengerCapacity', 'year', 'km', 'fuelType', 'transmission'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year', 'vehicleCondition']
      },
      vehicle: {
        label: 'Araç Bilgileri',
        icon: DirectionsBus,
        order: 2,
        fields: ['km', 'fuelType', 'transmission', 'color', 'plateOrigin', 'vehiclePlate']
      },
      bus_specs: {
        label: 'Otobüs Özellikleri',
        icon: AirlineSeatReclineNormal,
        order: 3,
        fields: ['passengerCapacity', 'seatLayout', 'seatBackScreen', 'gearType', 'gearCount', 'tireCondition', 'fuelCapacity']
      },
      comfort: {
        label: 'Konfor Özellikleri',
        icon: StarIcon,
        order: 4,
        fields: ['threeG', 'abs', 'vehiclePhone', 'asr', 'refrigerator', 'heatedDriverGlass', 'personalSoundSystem', 'airCondition', 'kitchen', 'retarder', 'driverCabin', 'television', 'toilet', 'satellite', 'wifi']
      },
      condition: {
        label: 'Durum & Garanti',
        icon: VerifiedIcon,
        order: 5,
        fields: ['damageRecord', 'paintChange', 'exchange', 'warranty']
      }
    }
  },

  // 🚛 ÇEKİCİ
  'cekici': {
    heroColor: '#4caf50', // Yeşil
    badge: 'Çekici Araç',
    icon: LocalShipping,
    priorityFields: ['enginePower', 'year', 'km', 'fuelType', 'transmission'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year', 'vehicleCondition']
      },
      engine: {
        label: 'Motor Bilgileri',
        icon: Build,
        order: 2,
        fields: ['enginePower', 'engineCapacity', 'fuelType', 'transmission']
      },
      vehicle: {
        label: 'Araç Bilgileri',
        icon: LocalShipping,
        order: 3,
        fields: ['km', 'color', 'cabinType', 'bedCount', 'dorseAvailable', 'plateType', 'plateNumber']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: SettingsIcon,
        order: 4,
        fields: ['tireCondition', 'damageRecord', 'paintChange']
      },
      safety: {
        label: 'Güvenlik Sistemleri',
        icon: SecurityIcon,
        order: 5,
        fields: ['abs', 'esp', 'asr', 'ebv', 'airBag', 'sideAirbag', 'passengerAirbag', 'centralLock', 'alarm', 'immobilizer', 'laneKeepAssist', 'cruiseControl', 'hillStartAssist', 'adr', 'retarder', 'pto']
      },
      lighting: {
        label: 'Aydınlatma & Sensör',
        icon: StarIcon,
        order: 6,
        fields: ['headlightSensor', 'headlightWasher', 'rainSensor', 'xenonHeadlight', 'fogLight']
      },
      comfort: {
        label: 'Konfor & İç Mekân',
        icon: StarIcon,
        order: 7,
        fields: ['airCondition', 'electricWindow', 'electricMirror', 'powerSteering', 'leatherSeat', 'heatedSeats', 'memorySeats', 'sunroof', 'alloyWheel', 'towHook', 'spoiler', 'windDeflector', 'table', 'flexibleReadingLight']
      },
      multimedia: {
        label: 'Multimedya',
        icon: StarIcon,
        order: 8,
        fields: ['radio', 'cd', 'bluetooth', 'gps', 'tripComputer', 'camera', 'parkingSensor']
      }
    }
  },

  // 🚚 KAMYON/KAMYONET
  'kamyon-kamyonet': {
    heroColor: '#ff9800', // Turuncu
    badge: 'Yük Taşıma',
    icon: LocalShipping,
    priorityFields: ['bodyType', 'loadCapacity', 'year', 'km', 'fuelType'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year', 'vehicleCondition']
      },
      engine: {
        label: 'Motor Bilgileri',
        icon: Build,
        order: 2,
        fields: ['enginePower', 'engineCapacity', 'fuelType', 'transmission']
      },
      cargo: {
        label: 'Kasa Bilgileri',
        icon: Inventory,
        order: 3,
        fields: ['bodyType', 'loadCapacity', 'cabinType', 'driveType']
      },
      vehicle: {
        label: 'Araç Bilgileri',
        icon: LocalShipping,
        order: 4,
        fields: ['km', 'color', 'plateOrigin', 'vehiclePlate']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: SettingsIcon,
        order: 5,
        fields: ['tireCondition', 'fuelTankCapacity', 'adblueCapacity']
      },
      comfort: {
        label: 'Konfor & Güvenlik',
        icon: SecurityIcon,
        order: 6,
        fields: ['abs', 'asr', 'airCondition', 'powerSteering', 'centralLocking']
      }
    }
  },

  // 🚐 MİNİBÜS/MİDİBÜS
  'minibus-midibus': {
    heroColor: '#3f51b5', // İndigo
    badge: 'Toplu Taşıma',
    icon: DirectionsBus,
    priorityFields: ['passengerCapacity', 'year', 'km', 'fuelType', 'transmission'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year', 'vehicleCondition']
      },
      vehicle: {
        label: 'Araç Bilgileri',
        icon: DirectionsBus,
        order: 2,
        fields: ['km', 'fuelType', 'transmission', 'color', 'plateOrigin']
      },
      capacity: {
        label: 'Kapasite Bilgileri',
        icon: People,
        order: 3,
        fields: ['passengerCapacity', 'seatConfiguration', 'doorCount']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: Build,
        order: 4,
        fields: ['enginePower', 'tireCondition', 'fuelCapacity']
      },
      comfort: {
        label: 'Konfor & Güvenlik',
        icon: SecurityIcon,
        order: 5,
        fields: ['airCondition', 'abs', 'powerSteering', 'centralLocking']
      }
    }
  },

  // 🐄 HAYVAN RÖMORKU
  'hayvan-romork': {
    heroColor: '#8bc34a', // Açık Yeşil
    badge: 'Hayvancılık',
    icon: Agriculture,
    priorityFields: ['productionYear', 'hasDamper', 'isExchangeable'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      features: {
        label: 'Özellikler',
        icon: Agriculture,
        order: 2,
        fields: ['hasDamper', 'isExchangeable']
      }
    }
  },

  // ⛽ TANKER
  'tanker': {
    heroColor: '#607d8b', // Mavi-Gri
    badge: 'Sıvı Taşıma',
    icon: LocalGasStation,
    priorityFields: ['hacim', 'gozSayisi', 'year', 'lastikDurumu'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      tank: {
        label: 'Tanker Özellikleri',
        icon: LocalGasStation,
        order: 2,
        fields: ['hacim', 'gozSayisi', 'lastikDurumu', 'renk']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 3,
        fields: ['takasli', 'warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🏗️ KAROSER ÜST YAPI (Damperli: Ahşap Kasa, Hafriyat Tipi, Havuz Hardox Tipi, Kaya Tipi | Sabit Kabin: Açık Kasa, Kapalı Kasa, Özel Kasa)
  'karoser-ustyapi': {
    heroColor: '#795548', // Kahverengi
    badge: 'Karoser',
    icon: Construction,
    priorityFields: ['caseType', 'length', 'width', 'productionYear', 'tippingDirection'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      karoser: {
        label: 'Karoser Bilgileri',
        icon: Construction,
        order: 2,
        fields: ['caseType', 'length', 'width', 'tippingDirection']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 3,
        fields: ['isExchangeable']
      }
    }
  },

  // 📦 KURUYUK (Kapaklı, Kapaklı Kaya Tipi, Kapaksız Platform)
  'kuruyuk': {
    heroColor: '#ff5722', // Koyu Turuncu
    badge: 'Kuruyük',
    icon: Inventory,
    priorityFields: ['dingilSayisi', 'uzunluk', 'genislik', 'istiapHaddi', 'kapakYuksekligi'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      dimensions: {
        label: 'Boyutlar & Kapasite',
        icon: Straighten,
        order: 2,
        fields: ['dingilSayisi', 'uzunluk', 'genislik', 'kapakYuksekligi', 'istiapHaddi']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 3,
        fields: ['krikoAyak', 'lastikDurumu', 'takasli']
      },
      devrilme: {
        label: 'Devrilme Yönleri',
        icon: Build,
        order: 4,
        fields: ['devrilmeArkaya', 'devrilmeSaga', 'devrilmeSola']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 5,
        fields: ['warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🛣️ LOWBED (Havuzlu, Öndekirmalı)
  'lowbed': {
    heroColor: '#673ab7', // Mor
    badge: 'Alçak Yatak',
    icon: LocalShipping,
    priorityFields: ['havuzDerinligi', 'havuzGenisligi', 'havuzUzunlugu', 'istiapHaddi', 'dingilSayisi'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      havuz: {
        label: 'Havuz Boyutları',
        icon: Straighten,
        order: 2,
        fields: ['havuzDerinligi', 'havuzGenisligi', 'havuzUzunlugu']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: Build,
        order: 3,
        fields: ['dingilSayisi', 'lastikDurumu', 'istiapHaddi', 'hidrolikSistem']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 4,
        fields: ['warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🧵 TEKSTİL
  'tekstil': {
    heroColor: '#e91e63', // Pembe
    badge: 'Tekstil',
    icon: LocalShipping,
    priorityFields: ['year', 'takasli'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 2,
        fields: ['takasli', 'warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🌾 SİLOBAS
  'silobas': {
    heroColor: '#ff9800', // Turuncu
    badge: 'Silobas',
    icon: Agriculture,
    priorityFields: ['hacim', 'gozSayisi', 'year', 'lastikDurumu'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      silo: {
        label: 'Silo Özellikleri',
        icon: Agriculture,
        order: 2,
        fields: ['hacim', 'gozSayisi', 'lastikDurumu', 'renk']
      },
      filling: {
        label: 'Dolum Şekli',
        icon: Build,
        order: 3,
        fields: ['alttan', 'usttan']
      },
      features: {
        label: 'Özellikler',
        icon: StarIcon,
        order: 4,
        fields: ['takasli', 'warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🚜 TARIM ROMORK (Açık Kasa, Kapalı Kasa, Sulama, Tarım Tanker)
  'tarim-romork': {
    heroColor: '#4caf50', // Yeşil
    badge: 'Tarım',
    icon: Agriculture,
    priorityFields: ['productionYear', 'hasDamper', 'volume', 'isExchangeable', 'romorkType'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      romork: {
        label: 'Römork Özellikleri',
        icon: Agriculture,
        order: 2,
        fields: ['romorkType', 'hasDamper', 'volume']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 3,
        fields: ['isExchangeable']
      }
    }
  },

  // 📦 KONTEYNER TAŞIYICI ŞASİ (Damper Şasi, Kılçık Şasi, Platform Şasi, Römork Konvantörü, Tanker Şasi, Uzayabilir Şasi)
  'konteyner-tasiyici-sasi': {
    heroColor: '#607d8b', // Mavi-Gri
    badge: 'Konteyner Şası',
    icon: LocalShipping,
    priorityFields: ['axleCount', 'loadCapacity', 'year', 'tireCondition', 'sasiType'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      sasi: {
        label: 'Şasi Özellikleri',
        icon: LocalShipping,
        order: 2,
        fields: ['sasiType', 'axleCount', 'loadCapacity']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: Build,
        order: 3,
        fields: ['tireCondition', 'currency']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 4,
        fields: ['exchangeable']
      }
    }
  },

  // 🚚 TAŞIMA RÖMORKLARI (Boru, Frigo, Hayvan, Platform, Seyahat, Tüp Damacana, Vasıta, Yük)  
  'tasima-romork': {
    heroColor: '#9c27b0', // Mor
    badge: 'Taşıma Römorku',
    icon: LocalShipping,
    priorityFields: ['productionYear', 'hasDamper', 'isExchangeable', 'romorkType'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      romork: {
        label: 'Römork Özellikleri',
        icon: LocalShipping,
        order: 2,
        fields: ['romorkType', 'hasDamper', 'isExchangeable']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 3,
        fields: ['warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🚛 DORSE (Damperli, Havuz Hardox, Kapaklı, Kaya Tipi)
  'dorse': {
    heroColor: '#607d8b', // Mavi-Gri
    badge: 'Dorse',
    icon: LocalShipping,
    priorityFields: ['dorseType', 'loadCapacity', 'length', 'year', 'devrilmeYonu'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      dorse: {
        label: 'Dorse Özellikleri',
        icon: LocalShipping,
        order: 2,
        fields: ['dorseType', 'loadCapacity', 'length', 'width', 'height', 'genislik', 'uzunluk']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: Build,
        order: 3,
        fields: ['axleCount', 'tireCondition', 'brakeType', 'suspensionType', 'lastikDurumu']
      },
      material: {
        label: 'Malzeme & Yapı',
        icon: Construction,
        order: 4,
        fields: ['floorMaterial', 'sidewallMaterial', 'roofType', 'devrilmeYonu']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 5,
        fields: ['warranty', 'negotiable', 'exchange']
      }
    }
  },

  // 🚚 RÖMORK
  'romork': {
    heroColor: '#e91e63', // Pembe
    badge: 'Römork',
    icon: LocalShipping,
    priorityFields: ['romorkType', 'loadCapacity', 'year', 'axleCount'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      romork: {
        label: 'Römork Özellikleri',
        icon: LocalShipping,
        order: 2,
        fields: ['romorkType', 'loadCapacity', 'length', 'width']
      },
      technical: {
        label: 'Teknik Bilgiler',
        icon: Build,
        order: 3,
        fields: ['axleCount', 'tireCondition', 'brakeType', 'hitchType']
      },
      features: {
        label: 'Özel Özellikler',
        icon: StarIcon,
        order: 4,
        fields: ['hasCover', 'hasSidewalls', 'hasRamps']
      }
    }
  },

  // 🛠️ OTO KURTARICI/TAŞIYICI (Tekli Araç, Çoklu Araç)
  'oto-kurtarici-tasiyici': {
    heroColor: '#ff5722', // Koyu Turuncu
    badge: 'Kurtarma',
    icon: Build,
    priorityFields: ['vehicleBrand', 'modelYear', 'km', 'loadCapacity', 'platformLength'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'modelYear']
      },
      vehicle: {
        label: 'Araç Bilgileri',
        icon: LocalShipping,
        order: 2,
        fields: ['vehicleBrand', 'km', 'engineVolume', 'maxPowerHP', 'maxTorqueNm', 'fuelType']
      },
      platform: {
        label: 'Platform Özellikleri',
        icon: Build,
        order: 3,
        fields: ['platformLength', 'platformWidth', 'loadCapacity', 'heavyCommercialTransport']
      },
      equipment: {
        label: 'Donanım',
        icon: SettingsIcon,
        order: 4,
        fields: ['towingEquipment', 'safetyFeatures', 'vehicleEquipment']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: SecurityIcon,
        order: 5,
        fields: ['licensePlate', 'isExchangeable']
      }
    }
  },

  // �️ TENTELI (Pilot, Midilli, Yarı Midilli)
  'tenteli': {
    heroColor: '#8bc34a', // Yeşil
    badge: 'Tenteli',
    icon: Umbrella,
    priorityFields: ['uzunluk', 'catiPerdeSistemi', 'year', 'lastikDurumu'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'year']
      },
      technical: {
        label: 'Teknik Özellikler',
        icon: SettingsIcon,
        order: 2,
        fields: ['uzunluk', 'catiPerdeSistemi', 'lastikDurumu']
      },
      condition: {
        label: 'Durum & Seçenekler',
        icon: VerifiedIcon,
        order: 3,
        fields: ['exchange', 'negotiable', 'warranty']
      }
    }
  },

  // 🎯 ÖZEL AMAÇLI RÖMORK
  'ozel-amacli-romork': {
    heroColor: '#9c27b0', // Mor
    badge: 'Özel Amaçlı',
    icon: Build,
    priorityFields: ['type', 'productionYear', 'isExchangeable'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      specs: {
        label: 'Özellikler',
        icon: SettingsIcon,
        order: 2,
        fields: ['type', 'isExchangeable']
      }
    }
  },

  // 🚛 KAMYON RÖMORKLARı
  'kamyon-romork': {
    heroColor: '#607d8b', // Mavi-Gri
    badge: 'Kamyon Römorku',
    icon: LocalShipping,
    priorityFields: ['length', 'width', 'hasTent', 'hasDamper', 'productionYear'],
    fieldGroups: {
      basic: {
        label: 'Temel Bilgiler',
        icon: InfoIcon,
        order: 1,
        fields: ['title', 'description', 'price', 'productionYear']
      },
      dimensions: {
        label: 'Boyutlar',
        icon: Straighten,
        order: 2,
        fields: ['length', 'width']
      },
      features: {
        label: 'Özellikler',
        icon: SettingsIcon,
        order: 3,
        fields: ['hasTent', 'hasDamper', 'exchangeable']
      }
    }
  },

  // �🎯 DEFAULT - Diğer tüm kategoriler
  'default': {
    heroColor: '#757575', // Gri
    badge: 'Araç',
    icon: CategoryIcon,
    priorityFields: ['brand', 'model', 'year', 'price'],
    fieldGroups: {
      general: {
        label: 'Genel Bilgiler',
        icon: CategoryIcon,
        order: 1,
        fields: ['brand', 'model', 'variant', 'year', 'km']
      },
      technical: {
        label: 'Teknik Detaylar',
        icon: Build,
        order: 2,
        fields: [] // Dinamik olarak doldurulacak
      }
    }
  }
};

// Kategori slug'ından config döndüren function
export const getCategoryConfig = (categorySlug: string, vehicleTypeSlug?: string): CategoryConfig => {
  // Önce vehicle_type ile dene
  if (vehicleTypeSlug && CATEGORY_CONFIGS[vehicleTypeSlug]) {
    return CATEGORY_CONFIGS[vehicleTypeSlug];
  }
  
  // Sonra category ile dene
  if (CATEGORY_CONFIGS[categorySlug]) {
    return CATEGORY_CONFIGS[categorySlug];
  }
  
  // Son çare default
  return CATEGORY_CONFIGS.default;
};

// Alan formatters (ortak kullanım)
export const commonFormatters = {
  // Sayılar için
  number: (value: number, unit?: string) => `${value.toLocaleString('tr-TR')} ${unit || ''}`.trim(),
  
  // Para için  
  currency: (value: number) => new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(value),
  
  // Boolean için
  yesNo: (value: boolean) => value ? 'Evet' : 'Hayır',
  
  // Array için (çoklu seçim)
  array: (values: string[]) => values.join(', ')
};
