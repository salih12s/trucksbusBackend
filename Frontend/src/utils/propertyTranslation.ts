/**
 * İlan özelliklerini Türkçeleştiren utility fonksiyonları
 */

// Özellik isimlerini Türkçeye çeviren mapping
export const propertyNameMapping: Record<string, string> = {
  // Temel araç özellikleri
  'seatCount': 'Koltuk Sayısı',
  'pullType': 'Çekme Türü',
  'airConditioning': 'Klima',
  'roofType': 'Tavan Türü',
  'fuel_type': 'Yakıt Türü',
  'is_exchangeable': 'Takas',
  'vehicle_condition': 'Araç Durumu',
  'transmission': 'Vites',
  'color': 'Renk',
  'chassisType': 'Şasi Türü',
  'features': 'Özellikler',
  
  // Ekran görüntüsündeki eksik çeviriler
  'engineVolume': 'Motor Hacmi',
  'vehicleBrand': 'Araç Markası',
  'licensePlate': 'Plaka',
  'platformWidth': 'Platform Genişliği',
  'platformLength': 'Platform Uzunluğu',
  'maxTorqueNm': 'Maksimum Tork (Nm)',
  'maxPowerHP': 'Maksimum Güç (HP)',
  'currency': 'Para Birimi',
  'loadCapacity': 'Yükleme Kapasitesi',
  'safetyFeatures': 'Güvenlik Özellikleri',
  'maxVehicleCapacity': 'Maksimum Araç Kapasitesi',
  'vehicleEquipment': 'Araç Ekipmanları',
  'priceType': 'Fiyat Türü',
  'towingEquipment': 'Çekme Ekipmanları',
  
  // Kamyon özellikleri
  'body_type': 'Üst Yapı',
  'carrying_capacity': 'Taşıma Kapasitesi',
  'cabin_type': 'Kabin Türü',
  'tire_condition': 'Lastik Durumu',
  'drive_type': 'Çekiş Türü',
  'damage_record': 'Hasar Kaydı',
  'paint_change': 'Boya Değişimi',
  'tramer_record': 'Tramer Kaydı',
  
  // Motor özellikleri
  'engine_power': 'Motor Gücü',
  'engine_volume': 'Motor Hacmi',
  'engine_type': 'Motor Türü',
  
  // Diğer
  'plate_origin': 'Plaka/Uyruk',
  'year': 'Yıl',
  'km': 'Kilometre',
  'mileage': 'Kilometre',
  
  // Konfor özellikleri
  'abs': 'ABS',
  'airbag': 'Hava Yastığı',
  'bluetooth': 'Bluetooth',
  'cruiseControl': 'Hız Sabitleyici',
  'electricWindows': 'Elektrikli Camlar',
  'gps': 'GPS',
  'heatedSeats': 'Isıtmalı Koltuklar',
  'leatherSeats': 'Deri Koltuklar',
  'parkingSensors': 'Park Sensörü',
  'powerSteering': 'Hidrolik Direksiyon',
  'radio': 'Radyo',
  'rearCamera': 'Geri Vites Kamerası',
  'sunroof': 'Sunroof',
  'centralLocking': 'Merkezi Kilit',
  'fogLights': 'Sis Farları',
  'alloyWheels': 'Alaşım Jant',
};

// Özellik değerlerini Türkçeleştiren mapping
export const propertyValueMapping: Record<string, string> = {
  // Boolean değerler
  'true': 'Evet',
  'false': 'Hayır',
  
  // Para birimleri
  'TRY': 'TL',
  'USD': '$',
  'EUR': '€',
  
  // Fiyat türleri
  'fixed': 'Sabit Fiyat',
  'negotiable': 'Pazarlıklı',
  
  // Güvenlik özellikleri
  'Takoz': 'Takoz',
  
  // Yakıt türleri
  'LPG': 'LPG',
  'Diesel': 'Dizel',
  'Petrol': 'Benzin',
  'Electric': 'Elektrik',
  'Hybrid': 'Hibrit',
  
  // Vites türleri
  'Manual': 'Manuel',
  'Automatic': 'Otomatik',
  'Semi-Automatic': 'Yarı Otomatik',
  'Otomatik': 'Otomatik',
  
  // Araç durumu
  'İkinci El': 'İkinci El',
  'Sıfır': 'Sıfır',
  'Hasarlı': 'Hasarlı',
  'New': 'Sıfır',
  'Used': 'İkinci El',
  'Damaged': 'Hasarlı',
  
  // Çekme türü
  'Arkadan': 'Arkadan',
  'Önden': 'Önden',
  'Rear': 'Arkadan',
  'Front': 'Önden',
  
  // Tavan türü
  'Normal Tavan': 'Normal Tavan',
  'Yüksek Tavan': 'Yüksek Tavan',
  'Süper Yüksek Tavan': 'Süper Yüksek Tavan',
  'Normal': 'Normal Tavan',
  'High': 'Yüksek Tavan',
  'Super High': 'Süper Yüksek Tavan',
  
  // Şasi türü
  'Orta': 'Orta',
  'Uzun': 'Uzun',
  'Kısa': 'Kısa',
  'Medium': 'Orta',
  'Long': 'Uzun',
  'Short': 'Kısa',
  
  // Renkler
  'Siyah': 'Siyah',
  'Beyaz': 'Beyaz',
  'Gri': 'Gri',
  'Mavi': 'Mavi',
  'Kırmızı': 'Kırmızı',
  'Yeşil': 'Yeşil',
  'Sarı': 'Sarı',
  'Black': 'Siyah',
  'White': 'Beyaz',
  'Gray': 'Gri',
  'Blue': 'Mavi',
  'Red': 'Kırmızı',
  'Green': 'Yeşil',
  'Yellow': 'Sarı',
};

// Özellik ismini Türkçeleştir
export const translatePropertyName = (propertyName: string): string => {
  return propertyNameMapping[propertyName] || propertyName;
};

// Özellik değerini Türkçeleştir
export const translatePropertyValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  // Eğer obje ise JSON string olarak göster
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Obje verisi]';
    }
  }
  
  const stringValue = String(value);
  return propertyValueMapping[stringValue] || stringValue;
};
