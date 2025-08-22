import { ListingCreateSchema } from '../schemas/listing';
import { toInt, parsePriceTRY, clean } from '../utils/num';

export function buildListingPayload(raw: any) {
  console.log('🔧 buildListingPayload input:', raw);
  
  // Coerce here so Zod receives correct types
  const payload = clean({
    title: raw?.title?.trim(),
    description: raw?.description?.trim(),
    price: parsePriceTRY(raw?.price),
    year: toInt(raw?.year),
    km: toInt(raw?.km),
    category_id: toInt(raw?.category_id ?? raw?.category?.id),
    vehicle_type_id: toInt(raw?.vehicle_type_id ?? raw?.vehicle_type?.id),
    brand_id: toInt(raw?.brand_id ?? raw?.brand?.id),
    model_id: toInt(raw?.model_id ?? raw?.model?.id),
    variant_id: toInt(raw?.variant_id ?? raw?.variant?.id),
    city_id: toInt(raw?.city_id ?? raw?.city?.id),
    district_id: toInt(raw?.district_id ?? raw?.district?.id),
    seller_name: raw?.seller_name,
    seller_phone: raw?.seller_phone, // assumed normalized elsewhere
    images: Array.isArray(raw?.images) && raw.images.length ? raw.images : undefined,
    properties: raw?.properties && typeof raw.properties === 'object' && Object.keys(raw.properties).length ? raw.properties : undefined
  });
  
  console.log('🔧 buildListingPayload output:', payload);
  return payload;
}

export function preflightListing(raw: any) {
  console.log('✈️ preflightListing starting with:', raw);
  
  const payload = buildListingPayload(raw);
  console.log('✈️ Built payload for validation:', payload);
  
  const parsed = ListingCreateSchema.safeParse(payload);
  
  if (!parsed.success) {
    console.log('❌ Preflight validation failed:', parsed.error.issues);
    
    // collect field errors
    const errors = parsed.error.issues.reduce((acc, i) => {
      acc[i.path.join('.')] = i.message;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('❌ Preflight errors:', errors);
    return { ok: false, errors, payload };
  }
  
  console.log('✅ Preflight validation passed');
  return { ok: true, errors: null, payload: parsed.data };
}
