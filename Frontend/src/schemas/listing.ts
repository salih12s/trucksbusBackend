import { z } from 'zod';

export const ListingCreateSchema = z.object({
  title: z.string().trim().min(3, 'Başlık en az 3 karakter olmalı'),
  price: z.number().positive('Fiyat > 0 olmalı'),
  category_id: z.number().int().positive('Kategori seçiniz'),
  vehicle_type_id: z.number().int().positive('Araç tipi seçiniz'),
  city_id: z.number().int().positive().optional(), // make required if BE requires
  description: z.string().trim().optional(),
  year: z.number().int().positive().optional(),
  km: z.number().int().positive().optional(),
  brand_id: z.number().int().positive().optional(),
  model_id: z.number().int().positive().optional(),
  variant_id: z.number().int().positive().optional(),
  district_id: z.number().int().positive().optional(),
  seller_name: z.string().optional(),
  seller_phone: z.string().optional(),
  images: z.array(z.string()).optional(),
  properties: z.record(z.string(), z.any()).optional()
});

export type ListingCreate = z.infer<typeof ListingCreateSchema>;
