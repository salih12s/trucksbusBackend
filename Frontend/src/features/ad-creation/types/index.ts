// Form verisinin yapısını tanımlayan merkezi arayüz
export interface KamyonAdFormData {
    // Temel Bilgiler
    title: string;
    description: string;
    price: string;
    city: string;
    district: string;
    
    // Araç Bilgileri  
    brand: string;
    model: string;
    variant: string;
    year: number;
    vehicleCondition: 'Sıfır' | 'İkinci El' | 'Yurtdışından İthal Sıfır';
    km: string;
    fuelType: string;
    transmission: string;
    color: string;
    
    // Kamyon Özel Alanları
    motorPower: string;
    bodyType: string;
    carryingCapacity: string;
    cabinType: string;
    tireCondition: string;
    driveType: string;
    plateOrigin: 'Türk Plakası' | 'Yabancı Plaka';
    vehiclePlate: string;
    
    // Konfor Özellikleri
    features: {
        [key: string]: boolean; // Dinamik anahtarlar için
    };
    
    // Diğer
    damageRecord: 'Hayır' | 'Evet';
    paintChange: 'Hayır' | 'Evet';
    exchange: 'Evet' | 'Hayır' | 'Olabilir';
    warranty: boolean;
    
    // Medya
    images: string[];
    
    // İletişim
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
}

// Özellik yapısı için interface
export interface FeatureConfig {
    key: string;
    label: string;
}

// Şehir ve ilçe için types (locationService'ten gelecek)
export interface City {
    id: number;
    name: string;
}

export interface District {
    id: number;
    name: string;
    cityId: number;
}

// Form adımları için type
export type FormStep = 0 | 1 | 2 | 3 | 4;

// Loading state'leri için interface
export interface LoadingState {
    cities: boolean;
    districts: boolean;
    submit: boolean;
}
