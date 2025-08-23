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
  
  // Features from form checkboxes
  features?: Record<string, boolean | string | number>;
  
  // Special properties for dorse/trailer forms
  properties?: Record<string, string | number | boolean>;
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
  // Extract features from additionalProperties if available
  let features = additionalProperties?.features || formData.features || {};
  
  // Clean up additionalProperties (remove features as it will be handled separately)
  const cleanAdditionalProperties = additionalProperties ? { ...additionalProperties } : {};
  if (cleanAdditionalProperties.features) {
    delete cleanAdditionalProperties.features;
  }
  
  return {
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
    features: features, // Add features directly to payload
    properties: Object.keys(cleanAdditionalProperties).length > 0 ? cleanAdditionalProperties : undefined
  };
};
