// services/apiNormalizer.ts - Response standardization utility

export interface ApiResponse<T> { 
  success: boolean; 
  data: T; 
  message?: string; 
  count?: number; 
}

export interface StandardListing {
  id: string;
  title: string;
  price: number;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'EXPIRED' | 'REJECTED';
  isApproved: boolean;
  isPending: boolean;
  isActive: boolean;
  viewCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  year?: number;
  km?: number;
  description?: string;
  images?: string[];
  seller?: {
    name: string;
    phone: string;
    email?: string;
  };
  location?: {
    city: string;
    district?: string;
  };
  vehicle?: {
    brand?: string;
    model?: string;
    variant?: string;
    category: string;
    type: string;
  };
}

export const normalizeListing = (raw: any): StandardListing => ({
  id: raw.id,
  title: raw.title,
  price: Number(raw.price || 0),
  status: raw.status || 'PENDING',
  isApproved: !!(raw.is_approved ?? raw.isApproved),
  isPending: !!(raw.is_pending ?? raw.isPending),
  isActive: !!(raw.is_active ?? raw.isActive),
  viewCount: raw.view_count ?? raw.viewCount ?? 0,
  userId: raw.user_id ?? raw.userId,
  createdAt: raw.created_at ?? raw.createdAt,
  updatedAt: raw.updated_at ?? raw.updatedAt,
  year: raw.year,
  km: raw.km ?? raw.mileage ?? raw.kilometers,
  description: raw.description,
  images: Array.isArray(raw.images) ? raw.images : [],
  seller: {
    name: raw.seller_name ?? raw.seller?.name ?? 'İlan Sahibi',
    phone: raw.seller_phone ?? raw.seller?.phone ?? '',
    email: raw.seller_email ?? raw.seller?.email
  },
  location: {
    city: raw.city_name ?? raw.cities?.name ?? raw.location?.city ?? '',
    district: raw.district_name ?? raw.districts?.name ?? raw.location?.district
  },
  vehicle: {
    brand: raw.brands?.name ?? raw.brand,
    model: raw.models?.name ?? raw.model,
    variant: raw.variants?.name ?? raw.variant,
    category: raw.categories?.name ?? raw.category ?? '',
    type: raw.vehicle_types?.name ?? raw.vehicleType ?? ''
  }
});

// Standard validation for listing creation
export interface StandardListingPayload {
  // Required fields
  title: string;
  price: number;
  city: string;
  category_id: string;
  vehicle_type_id: string;
  
  // Optional fields
  description?: string;
  year?: number;
  km?: number;
  images?: string[];
  seller_name?: string;
  seller_phone?: string;
  brand_id?: string;
  model_id?: string;
  variant_id?: string;
  city_id?: string;
  district_id?: string;
  
  // Special properties for dorse/trailer forms
  properties?: Record<string, string | number | boolean>;
  
  // Features for vehicle forms (Kamyon, Otobüs, etc.)
  features?: Record<string, boolean>;
  
  // SafetyFeatures for OtoKurtarici forms
  safetyFeatures?: string[];
}

export const validateListingPayload = (payload: Partial<StandardListingPayload>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!payload.title?.trim()) errors.push('Başlık zorunludur');
  if (!payload.price || payload.price <= 0) errors.push('Geçerli bir fiyat giriniz');
  if (!payload.city?.trim()) errors.push('Şehir seçimi zorunludur');
  if (!payload.category_id?.trim()) errors.push('Kategori seçimi zorunludur');
  if (!payload.vehicle_type_id?.trim()) errors.push('Araç türü seçimi zorunludur');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createStandardPayload = (formData: any, additionalProperties?: Record<string, any>): StandardListingPayload => {
  // Temel payload oluştur
  const payload: StandardListingPayload = {
    title: formData.title?.trim() || '',
    description: formData.description?.trim() || '',
    price: Number(formData.price) || 0,
    year: formData.year ? Number(formData.year) : undefined,
    km: formData.km ? Number(formData.km) : undefined,
    city: formData.city || formData.selectedCity || '',
    category_id: formData.category_id || formData.categoryId || '',
    vehicle_type_id: formData.vehicle_type_id || formData.vehicleTypeId || '',
    brand_id: formData.brand_id || formData.brandId || undefined,
    model_id: formData.model_id || formData.modelId || undefined,
    variant_id: formData.variant_id || formData.variantId || undefined,
    city_id: formData.city_id || formData.cityId || undefined,
    district_id: formData.district_id || formData.districtId || undefined,
    seller_name: formData.seller_name || formData.sellerName || formData.contactName || undefined,
    seller_phone: formData.seller_phone || formData.sellerPhone || formData.contactPhone || undefined,
    images: Array.isArray(formData.images) ? formData.images : [],
  };

  // Properties desteği (tüm küçük formlar için)
  if (formData.properties || additionalProperties) {
    payload.properties = { ...formData.properties, ...additionalProperties };
  }

  // Features desteği (Büyük araç formları için)
  if (formData.features) {
    payload.features = formData.features;
  }

  // SafetyFeatures desteği (OtoKurtarici formları için)
  if (formData.safetyFeatures) {
    payload.safetyFeatures = formData.safetyFeatures;
  }

  // Form verilerinden özellik çıkarma (formData'dan direct property'ler)
  const extractProperties = () => {
    const props: Record<string, any> = {};
    
    // Yaygın teknik özellikler
    if (formData.genislik) props.genislik = formData.genislik;
    if (formData.uzunluk) props.uzunluk = formData.uzunluk;
    if (formData.yukseklik) props.yukseklik = formData.yukseklik;
    if (formData.lastikDurumu) props.lastikDurumu = formData.lastikDurumu;
    if (formData.dingilSayisi) props.dingilSayisi = formData.dingilSayisi;
    if (formData.istiapHaddi) props.istiapHaddi = formData.istiapHaddi;
    if (formData.devrilmeYonu) props.devrilmeYonu = formData.devrilmeYonu;
    if (formData.kapakYuksekligi) props.kapakYuksekligi = formData.kapakYuksekligi;
    if (formData.havuzDerinligi) props.havuzDerinligi = formData.havuzDerinligi;
    if (formData.havuzGenisligi) props.havuzGenisligi = formData.havuzGenisligi;
    if (formData.havuzUzunlugu) props.havuzUzunlugu = formData.havuzUzunlugu;
    
    // Boolean özellikler
    if (typeof formData.krikoAyak === 'boolean') props.krikoAyak = formData.krikoAyak;
    if (typeof formData.takasli === 'boolean') props.takasli = formData.takasli;
    if (typeof formData.devrilmeArkaya === 'boolean') props.devrilmeArkaya = formData.devrilmeArkaya;
    if (typeof formData.devrilmeSaga === 'boolean') props.devrilmeSaga = formData.devrilmeSaga;
    if (typeof formData.devrilmeSola === 'boolean') props.devrilmeSola = formData.devrilmeSola;
    if (typeof formData.uzatilabilirProfil === 'boolean') props.uzatilabilirProfil = formData.uzatilabilirProfil;
    if (typeof formData.warranty === 'boolean') props.warranty = formData.warranty;
    if (typeof formData.negotiable === 'boolean') props.negotiable = formData.negotiable;
    if (typeof formData.exchange === 'boolean') props.exchange = formData.exchange;
    if (typeof formData.isExchangeable === 'boolean') props.isExchangeable = formData.isExchangeable;
    
    return Object.keys(props).length > 0 ? props : undefined;
  };

  // Eğer properties yoksa ama form verisinde özellikler varsa, bunları properties'e ekle
  if (!payload.properties) {
    const extractedProps = extractProperties();
    if (extractedProps) {
      payload.properties = extractedProps;
    }
  }

  return payload;
};
