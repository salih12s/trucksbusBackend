import { Request, Response, NextFunction } from 'express';

const digitsOnly = (s: any) => String(s ?? '').replace(/\D/g, '');

export function normalizeMultipartAndCoerce(req: Request, _res: Response, next: NextFunction) {
  const ct = req.headers['content-type'] || '';
  const isMultipart = ct.includes('multipart/form-data');

  console.log('🔍 CT:', ct);
  console.log('🔑 BODY KEYS:', Object.keys(req.body));

  // multipart ise text field'lar string olur; JSON body'de zaten doğru gelir
  if (isMultipart) {
    // properties string geldiyse JSON'a çevir
    if (typeof (req.body as any).properties === 'string') {
      try {
        (req.body as any).properties = JSON.parse((req.body as any).properties);
      } catch {
        (req.body as any).properties = {};
      }
    }
  }

  // Tüm kritik alanları sayıya çevir (string '12' -> 12)
  // Ama category_id ve vehicle_type_id string olarak kalsın (alfanumerik ID'ler)
  const numKeys = [
    'price','year','km',
    'brand_id','model_id','variant_id',
    'city_id','district_id'
  ];

  numKeys.forEach((k) => {
    if (req.body[k] !== undefined && req.body[k] !== null && req.body[k] !== '') {
      if (k === 'price') {
        // fiyat "1.234.000" gibi gelebilir; sadece rakamları al
        const d = digitsOnly(req.body[k]);
        req.body[k] = d ? Number(d) : undefined;
      } else {
        const n = Number(req.body[k]);
        req.body[k] = Number.isFinite(n) ? n : undefined;
      }
    }
  });

  console.log('✅ Normalized body:', {
    title: req.body.title,
    price: req.body.price,
    category_id: req.body.category_id,
    vehicle_type_id: req.body.vehicle_type_id,
    price_type: typeof req.body.price,
    category_id_type: typeof req.body.category_id,
    vehicle_type_id_type: typeof req.body.vehicle_type_id
  });

  next();
}
