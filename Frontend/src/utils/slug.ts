/**
 * Turkish text to slug converter
 * Converts Turkish characters to ASCII equivalents and creates URL-safe slugs
 */
export function trSlug(input: string): string {
  return input
    .normalize('NFD') // Unicode normalize form decomposed - aksanları ayır
    .replace(/[\u0300-\u036f]/g, '') // Combining diacritical marks'ları sil
    .replace(/ğ/gi, 'g') // Turkish ğ/Ğ -> g
    .replace(/ü/gi, 'u') // Turkish ü/Ü -> u
    .replace(/ş/gi, 's') // Turkish ş/Ş -> s
    .replace(/ı/g, 'i')  // Turkish ı -> i
    .replace(/İ/g, 'i')  // Turkish İ -> i
    .replace(/ö/gi, 'o') // Turkish ö/Ö -> o
    .replace(/ç/gi, 'c') // Turkish ç/Ç -> c
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Noktalama işaretlerini ve özel karakterleri sil
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .toLowerCase();
}

/**
 * Get model image URL with proper slug conversion
 */
export function getModelImageUrl(modelName: string): string {
  const ASSET_BASE = import.meta.env.VITE_ASSET_BASE_URL ?? '';
  
  // Special mappings for models that need manual overrides
  const specialMappings: { [key: string]: string } = {
    // Exact file matches from public/ModelImage directory
    'Özel Amaçlı dorseler': 'ozel-amacli-dorseler.png',
    'Özel Amaçlı Dorseler': 'ozel-amacli-dorseler.png', 
    'Özel Amaçlı Römorklar': 'ozel-amacli-romorklar.png',
    'Kuruyük': 'kuruyuk.png',
    'Kuruyuk': 'kuruyuk.png',
    'Diğer Markalar': 'diger-markalar.png',
    'DigerMarkalar': 'diger-markalar.png',
    
    // Common brand variations
    'Mercedes': 'mercedes.png',
    'Scania': 'scania.png', 
    'Scanıa': 'scania.png',
    'Volvo': 'volvo.png',
    'MAN': 'man.png',
    'DAF': 'daf.png',
    'Iveco': 'iveco.png',
    'Ford': 'ford.png',
    'Renault': 'renault.png',
    'BMW': 'bmw.png',
    'Audi': 'audi.png'
  };
  
  // Check special mappings first
  const lowerName = modelName.toLowerCase();
  for (const [key, value] of Object.entries(specialMappings)) {
    if (key.toLowerCase() === lowerName || trSlug(key) === trSlug(modelName)) {
      console.log(`✅ Special mapping found: ${modelName} -> ${value}`);
      return `${ASSET_BASE}/ModelImage/${value}`;
    }
  }
  
  // Generate slug-based filename
  const slug = trSlug(modelName);
  const imageUrl = `${ASSET_BASE}/ModelImage/${slug}.png`;
  
  console.log(`🔍 Generated slug URL: ${modelName} -> ${slug}.png`);
  return imageUrl;
}

/**
 * Get category image URL with proper slug conversion
 */
export function getCategoryImageUrl(categoryName: string): string {
  const ASSET_BASE = import.meta.env.VITE_ASSET_BASE_URL ?? '';
  
  const categoryMappings: { [key: string]: string } = {
    'Çekici': 'cekici.png',
    'Dorse': 'dorse.png', 
    'Kamyon & Kamyonet': 'kamyon-kamyonet.png',
    'Karoser & Üst Yapı': 'karoser-ust-yapi.png',
    'Minibüs & Midibüs': 'minibus-midibus.png',
    'Otobüs': 'otobus.png',
    'Oto Kurtarıcı & Taşıyıcı': 'oto-kurtarici-tasiyici.png',
    'Römork': 'romork.png'
  };
  
  // Check exact mappings first
  if (categoryMappings[categoryName]) {
    return `${ASSET_BASE}/CategoryImage/${categoryMappings[categoryName]}`;
  }
  
  // Generate slug-based filename
  const slug = trSlug(categoryName);
  return `${ASSET_BASE}/CategoryImage/${slug}.png`;
}
