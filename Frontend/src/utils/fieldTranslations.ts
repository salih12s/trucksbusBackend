// Araç özelliklerinin Türkçe çevirileri
export const fieldTranslations: Record<string, string> = {
  // Backend'den gelen İngilizce label'lar
  'Color': 'Renk',
  'Plate Origin': 'Plaka Menşei',
  'Tire Condition': 'Lastik Durumu',
  'Transmission': 'Şanzıman',
  'Vehicle Condition': 'Araç Durumu',
  'Vehicle Plate': 'Araç Plakası',
  'Engine Power': 'Motor Gücü',
  'Engine Volume': 'Motor Hacmi',
  'Fuel Type': 'Yakıt Tipi',
  'Motor Power': 'Motor Gücü',
  'Body Type': 'Gövde Tipi',
  'Cabin Type': 'Kabin Tipi',
  'Damage Record': 'Hasar Kaydı',
  'Paint Change': 'Boya Değişimi',
  'Features': 'Özellikler',
  'Garanti': 'Garanti',
  'Is Exchangeable': 'Takaslanabilir',

  // Backend'den gelen grup label'ları
  'Genel Bilgiler': 'Genel Bilgiler',
  'Motor & Performans': 'Motor & Performans',
  'Özellikler': 'Özellikler',
  'Teknik Özellikler': 'Teknik Özellikler',

  // Temel Araç Bilgileri (backend'den gelen alanlar)
  'fuel_type': 'Yakıt Tipi',
  'fuel_capacity': 'Yakıt Kapasitesi',
  'transmission': 'Şanzıman',
  'gear_type': 'Vites Tipi',
  'vehicle_condition': 'Araç Durumu',
  'vehicle_plate': 'Araç Plakası',
  'plate_origin': 'Plaka Menşei',
  'is_exchangeable': 'Takaslanabilir',
  'gear_count': 'Vites Sayısı',
  'tire_condition': 'Lastik Durumu',
  'damage_record': 'Hasar Kaydı',
  'paint_change': 'Boya Değişimi',
  'passenger_capacity': 'Yolcu Kapasitesi',
  'seat_layout': 'Koltuk Düzeni',
  'seat_back_screen': 'Koltuk Arkası Ekran',
  
  // Genel Araç Özellikleri  
  'brand': 'Marka',
  'model': 'Model',
  'variant': 'Varyant',
  'year': 'Yıl',
  'km': 'Kilometre',
  'color': 'Renk',
  'enginePower': 'Motor Gücü',
  'engineCapacity': 'Motor Hacmi',
  'vehicleCondition': 'Araç Durumu',
  'fuelType': 'Yakıt Tipi',
  
  // Otobüs Özel Alanları
  'passengerCapacity': 'Yolcu Kapasitesi',
  'seatLayout': 'Koltuk Düzeni',
  'seatBackScreen': 'Koltuk Arkası Ekran',
  'gearType': 'Vites',
  'gearCount': 'Vites Sayısı',
  'tireCondition': 'Lastik Durumu',
  'fuelCapacity': 'Yakıt Hacmi',
  'plateOrigin': 'Plaka/Uyruk',
  'vehiclePlate': 'Araç Plakası',
  
  // Kamyon Özel Alanları
  'motorPower': 'Motor Gücü',
  'engineVolume': 'Motor Hacmi',
  'bodyType': 'Üst Yapı',
  'carryingCapacity': 'Taşıma Kapasitesi',
  'cabinType': 'Kabin Türü',
  'driveType': 'Çekiş Türü',
  
  // Çekici Özel Alanları
  'bedCount': 'Yatak Sayısı',
  'dorseAvailable': 'Dorse Mevcut',
  'plateType': 'Plaka Tipi',
  
  // Frigofirik Özel Alanları
  'uzunluk': 'Uzunluk',
  'lastikDurumu': 'Lastik Durumu',
  'sogutucu': 'Soğutucu',
  
  // Dorse/Kuruyük Ortak Alanları
  'dingilSayisi': 'Dingil Sayısı',
  'genislik': 'Genişlik',
  'kapakYuksekligi': 'Kapak Yüksekliği',
  'istiapHaddi': 'İstiap Haddi',
  'krikoAyak': 'Kriko Ayak',
  'takasli': 'Takaslı',
  'devrilmeYonu': 'Devrilme Yönü',
  'devrilmeArkaya': 'Arkaya Devrilme',
  'devrilmeSaga': 'Sağa Devrilme',
  'devrilmeSola': 'Sola Devrilme',
  
  // Form Alanları (Genel)
  'title': 'Başlık',
  'description': 'Açıklama',
  'price': 'Fiyat',
  'productionYear': 'Üretim Yılı',
  'length': 'Uzunluk',
  'width': 'Genişlik',
  'hasTent': 'Branda Var',
  'hasDamper': 'Dampır Var',
  'exchangeable': 'Takaslanabilir',
  'contactName': 'İletişim Adı',
  'phone': 'Telefon',
  'email': 'E-posta',
  'currency': 'Para Birimi',
  'city': 'Şehir',
  'district': 'İlçe',
  'tippingDirection': 'Devrilme Yönü',
  'uploadedImages': 'Yüklenen Resimler',
  'priceType': 'Fiyat Tipi',
  
  // Kasa Tipleri
  'bodyStructure': 'Kasa Yapısı',
  'hasTarpaulin': 'Branda Var',
  'isExchangeable': 'Takaslanabilir',
  'usageArea': 'Kullanım Alanı',
  'caseType': 'Kasa Tipi',
  
  // Teknik Özellikler
  'axleCount': 'Dingil Sayısı',
  'loadCapacity': 'Yük Kapasitesi',
  
  // İletişim ve Satıcı Bilgileri
  'isCompany': 'Firma',
  'companyName': 'Firma Adı',
  
  // Havuzlu/Öndekirmalı Özel Alanları
  'havuzDerinligi': 'Havuz Derinliği',
  'havuzGenisligi': 'Havuz Genişliği',
  'havuzUzunlugu': 'Havuz Uzunluğu',
  'hidrolikSistem': 'Hidrolik Sistem',
  'uzatilabilirProfil': 'Uzatılabilir Profil',
  
  // Tanker/Silobas Özel Alanları
  'hacim': 'Hacim',
  'gozSayisi': 'Göz Sayısı',
  'renk': 'Renk',
  'alttan': 'Alttan Dolum',
  'usttan': 'Üstten Dolum',
  
  // Oto Kurtarıcı & Taşıyıcı Alanları
  'modelYear': 'Model Yılı',
  'vehicleBrand': 'Araç Markası',
  'maxPowerHP': 'Maksimum Güç (HP)',
  'maxTorqueNm': 'Maksimum Tork (Nm)',
  'platformLength': 'Platform Uzunluğu',
  'platformWidth': 'Platform Genişliği',
  'heavyCommercialTransport': 'Ağır Ticari Taşıma',
  'licensePlate': 'Plaka',
  'towingEquipment': 'Çekme Ekipmanları',
  'safetyFeatures': 'Güvenlik Özellikleri',
  'vehicleEquipment': 'Araç Donanımları',
  'maxVehicleCapacity': 'Maksimum Araç Kapasitesi',
  
  // Römork Özel Alanları
  'volume': 'Hacim',
  'type': 'Tip',
  
  // Tenteli Özel Alanları
  'catiPerdeSistemi': 'Çatı Perde Sistemi',
  
  // Özellikler (Features)
  'threeG': '3G',
  'abs': 'ABS',
  'vehiclePhone': 'Araç Telefonu',
  'asr': 'ASR',
  'refrigerator': 'Buzdolabı',
  'heatedDriverGlass': 'Isıtmalı Sürücü Camı',
  'personalSoundSystem': 'Kişisel Ses Sistemi',
  'airCondition': 'Klima',
  'kitchen': 'Mutfak',
  'retarder': 'Retarder',
  'driverCabin': 'Sürücü Kabini',
  'television': 'Televizyon',
  'toilet': 'Tuvalet',
  'satellite': 'Uydu',
  'wifi': 'Wi-fi',
  
  // Kamyon Features
  'adr': 'ADR',
  'alarm': 'Alarm',
  'ebv': 'EBV',
  'esp': 'ESP',
  'havaPastigiSurucu': 'Hava Yastığı (Sürücü)',
  'havaPastigiYolcu': 'Hava Yastığı (Yolcu)',
  'immobilizer': 'Immobilizer',
  'merkeziKilit': 'Merkezi Kilit',
  'yokusKalkisDestegi': 'Yokuş Kalkış Desteği',
  'yanHavaYastigi': 'Yan Hava Yastığı',
  'cdCalar': 'CD Çalar',
  'deriDoseme': 'Deri Döşeme',
  'elektrikliAynalar': 'Elektrikli Aynalar',
  'elektrikliCam': 'Elektrikli Cam',
  'esnekOkumaLambasi': 'Esnek Okuma Lambası',
  'havaliKoltuk': 'Havalı Koltuk',
  'hizSabitleyici': 'Hız Sabitleyici',
  'hidrotikDireksiyon': 'Hidrotik Direksiyon',
  'isitmalıKoltuklar': 'Isıtmalı Koltuklar',
  'klima': 'Klima',
  'masa': 'Masa',
  'radioTeyp': 'Radio - Teyp',
  'startStop': 'Start & Stop',
  'tvNavigasyon': 'TV / Navigasyon',
  'yolBilgisayari': 'Yol Bilgisayarı',
  'alasimJant': 'Alaşım Jant',
  
  // Diğer alanlar
  'damageRecord': 'Hasar Kaydı',
  'paintChange': 'Boya Değişimi',
  'exchange': 'Takas',
  'warranty': 'Garanti',
  'negotiable': 'Pazarlıklı',
  'sellerName': 'Satıcı Adı',
  'sellerPhone': 'Satıcı Telefon',
  'sellerEmail': 'Satıcı E-posta',
  
  // Minibüs Özel Alanları
  'seatCount': 'Koltuk Sayısı',
  'pullType': 'Çekiş',
  'airConditioning': 'Klima',
  'chassisType': 'Şasi Tipi',
  'roofType': 'Tavan Tipi',
  
  // Minibüs Features (Detaylı)
  'airBag': 'Hava Yastığı',
  'centralLock': 'Merkezi Kilit',
  'electricWindow': 'Elektrikli Cam',
  'electricMirror': 'Elektrikli Ayna',
  'powerSteering': 'Hidrolik Direksiyon',
  'heater': 'Isıtıcı',
  'radio': 'Radyo',
  'cd': 'CD',
  'bluetooth': 'Bluetooth',
  'gps': 'GPS',
  'camera': 'Kamera',
  'parkingSensor': 'Park Sensörü',
  'xenonHeadlight': 'Xenon Far',
  'fogLight': 'Sis Farı',
  'sunroof': 'Güneş Tavan',
  'alloyWheel': 'Alaşım Jant',
  'leatherSeat': 'Deri Koltuk',
  'headlightJant': 'Far Jant',
  'cdPlayer': 'CD Çalar',
  'chainIron': 'Zincir Demir',
  'leatherUpholstery': 'Deri Döşeme',
  'electricMirrors': 'Elektrikli Aynalar',
  'headlight': 'Far',
  'farSensor': 'Far Sensörü',
  'farWashingSystem': 'Far Yıkama Sistemi',
  'airBagDriver': 'Hava Yastığı (Sürücü)',
  'airBagPassenger': 'Hava Yastığı (Yolcu)',
  'speedControl': 'Hız Kontrolü',
  'hydrolic': 'Hidrolik',
  'heatedSeats': 'Isıtmalı Koltuklar',
  'climate': 'Klima',
  'centralLock2': 'Merkezi Kilit',
  'readingLamp': 'Okuma Lambası',
  'automaticGlass': 'Otomatik Cam',
  'automaticDoor': 'Otomatik Kapı',
  'parkSensor': 'Park Sensörü',
  'radioTape': 'Radyo Teyp',
  'spoiler': 'Spoyler',
  'sunroof2': 'Güneş Tavan',
  'tourismPackage': 'Turizm Paketi',
  'tvNavigation': 'TV/Navigasyon',
  'xenonHeadlight2': 'Xenon Far',
  'rainSensor': 'Yağmur Sensörü',
  'sideAirBag': 'Yan Hava Yastığı',
  'hotColdSupport': 'Sıcak/Soğuk Destek',
  'fuelConsumptionComputer': 'Yakıt Tüketim Bilgisayarı',
  
  // Güvenlik Özellikleri (Kamyon/Otobüs/Minibüs ortak)
  
  // Konfor Özellikleri


  'kalorifer': 'Kalorifer',
  'deriKoltuk': 'Deri Koltuk',

  'otomatikCam': 'Otomatik Cam',
  'otomatikKapi': 'Otomatik Kapı',

  'okulAraci': 'Okul Aracı',
  
  // Multimedya Özellikleri
  'radyo': 'Radyo',

  'gpsNavigasyon': 'GPS Navigasyon',

  
  // Dış Görünüm Özellikleri  

  'farSensoru': 'Far Sensörü',
  'farSis': 'Far (Sis)',
  'xenonFar': 'Xenon Far',
  'farYikamaSistemi': 'Far Yıkama Sistemi',
  'spoyler': 'Spoyler',

  'yagmurSensoru': 'Yağmur Sensörü',
  'turizmanPaketi': 'Turizm Paketi',
  
  // Diğer Özellikler
  'parkSensoru': 'Park Sensörü',
  'sogutucuFrigo': 'Soğutucu / Frigo',
  'cekiDemiri': 'Çeki Demiri',
  
  // Çekici Features (Detaylı)
  'sideAirbag': 'Yan Hava Yastığı',
  'passengerAirbag': 'Yolcu Hava Yastığı',
  'laneKeepAssist': 'Şerit Koruma Desteği',
  'cruiseControl': 'Hız Sabitleyici',
  'hillStartAssist': 'Yokuş Kalkış Desteği',
  'pto': 'PTO',
  'headlightSensor': 'Far Sensörü',
  'headlightWasher': 'Far Yıkama Sistemi',
  'memorySeats': 'Hafızalı Koltuklar',
  'towHook': 'Çeki Demiri',
  'windDeflector': 'Cam Rüzgarlığı',
  'table': 'Masa',
  'flexibleReadingLight': 'Esnek Okuma Lambası',
  'tripComputer': 'Yol Bilgisayarı',
  'engine_volume' : 'Motor Hacmi',
  'engine_power' : 'Motor Gücü',
  'cabin_type' : 'Kabin Tipi',
  'motor_power' : 'Motor Gücü',
  'body_type' : 'Gövde Tipi',

  // Kamyon Dış Donanım
  'camRuzgarligi': 'Cam Rüzgarlığı',
  'far': 'Far (Sis)',

  'aynalarElektrikli': 'Aynalar (Elektrikli)',
  'aynalarKatlanir': 'Aynalar (Katlanır)',

  'tramerRecord': 'Tramer Kaydı',
  
  // Değerler için çeviriler
  'true': 'Evet',
  'false': 'Hayır',
  'yes': 'Evet',
  'no': 'Hayır',
  'Manuel': 'Manuel',
  'Otomatik': 'Otomatik',
  'Dizel': 'Dizel',
  'Benzin': 'Benzin',
  'İkinci El': 'İkinci El',
  'İyi': 'İyi',
  'Evet': 'Evet',
  'Hayır': 'Hayır',
  'Yok': 'Yok',
  '2+1': '2+1',
  '6+1': '6+1',
  '17+1': '17+1',
  'Arkadan': 'Arkadan',
  'Önden': 'Önden',
  '4x2': '4x2',
  '4x4': '4x4',
  '6x2': '6x2',
  '6x4': '6x4',
  'Orta': 'Orta',
  'Kısa': 'Kısa',
  'Uzun': 'Uzun',
  'Normal Tavan': 'Normal Tavan',
  'Yüksek Tavan': 'Yüksek Tavan',
  'Olabilir': 'Olabilir',
  'Olmaz': 'Olmaz',
  '34': '34',
  '343': '343',
  'Türk Plakası': 'Türk Plakası',
  'Yabancı Plaka': 'Yabancı Plaka',
  'Sarı': 'Sarı',
  'Beyaz': 'Beyaz',
  'Siyah': 'Siyah',
  'Gri': 'Gri',
  'Mavi': 'Mavi',
  'Kırmızı': 'Kırmızı',
  'Yeşil': 'Yeşil',
  'Tek Yatak': 'Tek Yatak',
  'Çift Yatak': 'Çift Yatak',
  'Var': 'Var',
  'Standart': 'Standart',
  'Lüks': 'Lüks',
  'Süper Lüks': 'Süper Lüks',
  'features': 'Özellikler',

  // Dorse/Kuruyük Değerleri
  'Hafriyat Tipi': 'Hafriyat Tipi',
  'Havuz Hardox Tipi': 'Havuz Hardox Tipi',
  'Kapaklı Tip': 'Kapaklı Tip',
  'Kaya Tipi': 'Kaya Tipi',
  'Açık Kasa': 'Açık Kasa',
  'Kapalı Kasa': 'Kapalı Kasa',
  'Özel Kasa': 'Özel Kasa',
  
  // Devrilme Yönleri
  'Arkaya': 'Arkaya',
  'Sağa': 'Sağa',
  'Sola': 'Sola',
  'İki Yana': 'İki Yana',
  'Üç Yöne': 'Üç Yöne',
  
  // Para Birimleri
  'TL': '₺',
  'TRY': '₺',
  'USD': '$',
  'EUR': '€',
  
  // Fiyat Tipleri
  'fixed': 'Sabit',
  
  // Genel Durumlar
  'available': 'Mevcut',
  'not_available': 'Mevcut Değil',
  'good': 'İyi',
  'average': 'Orta',
  'bad': 'Kötü',
  'excellent': 'Mükemmel',
  
  // Çatı Perde Sistemi Türleri
  'Hızlı Kayar Perde': 'Hızlı Kayar Perde',
  'Sabit Tente': 'Sabit Tente',
  'Tulum Kayar Perde': 'Tulum Kayar Perde',
  'Yana Kayar Perde': 'Yana Kayar Perde',
  'Tavana Sabit Yana Kayar Perde': 'Tavana Sabit Yana Kayar Perde',
  
  // Hidrolik Sistem Türleri
  'Hidrolik': 'Hidrolik',
  'Pnömatik': 'Pnömatik',
  
  // Hacim Birimleri
  'm3': 'm³',
  'litre': 'litre',
  'ton': 'ton',
  'kg': 'kg',
  
  // Römork Tipleri
  'Açık Platform': 'Açık Platform',
  'Frigofirik': 'Frigofirik',
  'Tanker': 'Tanker',
  'Silobas': 'Silobas',
  'Özel Amaçlı': 'Özel Amaçlı',
  'Tekstil': 'Tekstil',
  'Tenteli': 'Tenteli',
  'Kuruyük': 'Kuruyük',
  'Havuzlu': 'Havuzlu',
  'Öndekirmalı': 'Öndekirmalı',
  'Yarı Midilli': 'Yarı Midilli',
  'Midilli': 'Midilli',
  'Kapaksız Platform': 'Kapaksız Platform',
  
  // Oto Kurtarıcı Tipleri
  'Tekli Araç': 'Tekli Araç',
  'Çiftli Araç': 'Çiftli Araç',
  
  // Genel Durumlar
  'Belirtilmemiş': 'Belirtilmemiş',
  'Mevcut': 'Mevcut',
  'Mevcut Değil': 'Mevcut Değil'
};

// Alan adlarını Türkçeye çevirme fonksiyonu
export const translateField = (fieldKey: string): string => {
  return fieldTranslations[fieldKey] || fieldKey;
};

// Değerleri Türkçeye çevirme fonksiyonu  
export const translateValue = (value: any): string => {
  if (typeof value === 'string') {
    // Önce tam eşleşme kontrol et
    if (fieldTranslations[value]) {
      return fieldTranslations[value];
    }
    // Sonra küçük harf kontrol et
    const lowerValue = value.toLowerCase();
    return fieldTranslations[lowerValue] || value;
  }
  return String(value);
};
