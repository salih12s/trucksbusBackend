// Frontend normalizer functions

export const getFeaturesSafely = (f: any): Record<string, any> => {
  if (!f) return {};
  
  if (typeof f === 'string') {
    try {
      return JSON.parse(f);
    } catch {
      return {};
    }
  }
  
  return typeof f === 'object' ? f : {};
};

export const toBool = (v: any): boolean => {
  return v === true || v === 'true' || v === 1 || v === '1';
};

export const normalizeListing = (raw: any) => {
  const base = raw?.data?.base ?? raw;
  const f = base?.features;

  let features: Record<string, any> = getFeaturesSafely(f);

  // Values içindeki tüm boolean string değerleri features'a ekle
  if (base?.values && typeof base.values === 'object') {
    Object.entries(base.values).forEach(([key, value]) => {
      // String olarak "true"/"false" gelen değerleri kontrol et
      if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        const boolValue = toBool(value);
        if (boolValue) {
          features[key] = true;
        }
      }
      // Boolean değerleri de kontrol et
      else if (typeof value === 'boolean' && value) {
        features[key] = true;
      }
    });
  }
  
  // Base object içindeki tüm boolean string değerleri de kontrol et
  Object.entries(base || {}).forEach(([key, value]) => {
    // Bu key'leri skip et (zaten işlendi veya ilgisiz)
    if (['features', 'values', 'id', 'title', 'description', 'price', 'year', 'km'].includes(key)) return;
    
    // String olarak "true"/"false" gelen değerleri kontrol et
    if (typeof value === 'string' && (value === 'true' || value === 'false')) {
      const boolValue = toBool(value);
      if (boolValue) {
        features[key] = true;
      }
    }
    // Boolean değerleri de kontrol et
    else if (typeof value === 'boolean' && value) {
      features[key] = true;
    }
  });

  return {
    ...base,
    features,
  };
};
