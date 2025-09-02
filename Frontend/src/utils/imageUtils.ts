// Image URL utilities to handle special characters and encoding
export const getModelImageUrl = (modelName: string): string => {
  // Model image mapping with proper file names
  const modelImageMap: { [key: string]: string } = {
    // Scania varyasyonları
    'Scanıa': '/ModelImage/Scania.png',
    'Scania': '/ModelImage/Scania.png',
    'SCANIA': '/ModelImage/Scania.png',
    'scania': '/ModelImage/Scania.png',
    
    // Mercedes varyasyonları
    'Mercedes': '/ModelImage/Mercedes.png',
    'mercedes': '/ModelImage/Mercedes.png',
    'MERCEDES': '/ModelImage/Mercedes.png',
    
    // Volvo varyasyonları
    'Volvo': '/ModelImage/Volvo.png',
    'volvo': '/ModelImage/Volvo.png',
    'VOLVO': '/ModelImage/Volvo.png',
    
    // Türkkar varyasyonları
    'Türkkar': '/ModelImage/Turkkar.png',
    'Turkkar': '/ModelImage/Turkkar.png',
    'TÜRKKAR': '/ModelImage/Turkkar.png',
    'turkkar': '/ModelImage/Turkkar.png',
    
    // DAF varyasyonları
    'DAF': '/ModelImage/DAF.png',
    'daf': '/ModelImage/DAF.png',
    'Daf': '/ModelImage/DAF.png',
    
    // Avia varyasyonları
    'Avıa': '/ModelImage/Avia.png',
    'Avia': '/ModelImage/Avia.png',
    'AVIA': '/ModelImage/Avia.png',
    'avia': '/ModelImage/Avia.png',
    
    // MAN varyasyonları
    'MAN': '/ModelImage/MAN.png',
    'man': '/ModelImage/MAN.png',
    'Man': '/ModelImage/MAN.png',
    
    // Musatti varyasyonları
    'MUSATTİ': '/ModelImage/Musatti.png',
    'MUSATTI': '/ModelImage/Musatti.png',
    'Musatti': '/ModelImage/Musatti.png',
    'musatti': '/ModelImage/Musatti.png',
    'Mussatti': '/ModelImage/Musatti.png',
    'MUSSATTI': '/ModelImage/Musatti.png',
    
    // FIXED: Kuruyük varyasyonları - Use both available files
    'Kuruyük': '/ModelImage/Kuruyük.png',
    'Kuruyuk': '/ModelImage/Kuru-Yuk.png', 
    'KURUYÜK': '/ModelImage/Kuruyük.png',
    'kuruyuk': '/ModelImage/Kuru-Yuk.png',
    'Kuru Yük': '/ModelImage/Kuru-Yuk.png',
    'Kuru-Yük': '/ModelImage/Kuru-Yuk.png',
    'Kuru-Yuk': '/ModelImage/Kuru-Yuk.png',
    
    // FIXED: Özel dorseler - Use both available files
    'Özel Amaçlı dorseler': '/ModelImage/Özel Amaçlı dorseler.png',
    'Özel Amaçlı Dorseler': '/ModelImage/Ozel-Amacli-Dorseler.png',
    'Ozel Amacli dorseler': '/ModelImage/Ozel-Amacli-Dorseler.png',
    'özel amaçlı dorseler': '/ModelImage/Özel Amaçlı dorseler.png',
    
    // Özel Amaçlı Römorklar
    'Özel Amaçlı Römorklar': '/ModelImage/Özel Amaçlı Römorklar.png',
    'Özel Amaçlı Romorklar': '/ModelImage/Özel Amaçlı Römorklar.png',
    'Ozel Amacli Romorklar': '/ModelImage/Özel Amaçlı Römorklar.png',
    
    // Default fallback
    'Diğer Markalar': '/ModelImage/Diğer Markalar.png',
    'DigerMarkalar': '/ModelImage/Diğer Markalar.png',
    'Other': '/ModelImage/Diğer Markalar.png'
  };

  console.log(`🔍 Model resmi aranan: "${modelName}"`);
  
  // Önce tam eşleşme ara
  if (modelImageMap[modelName]) {
    console.log(`✅ Tam eşleşme bulundu: ${modelImageMap[modelName]}`);
    return modelImageMap[modelName];
  }
  
  // Case insensitive arama
  const lowerName = modelName.toLowerCase();
  for (const [key, value] of Object.entries(modelImageMap)) {
    if (key.toLowerCase() === lowerName) {
      console.log(`✅ Case insensitive eşleşme: ${value}`);
      return value;
    }
  }
  
  // Kısmi eşleşme ara (içerme)
  for (const [key, value] of Object.entries(modelImageMap)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      console.log(`✅ Kısmi eşleşme: ${value} (${key} <- ${modelName})`);
      return value;
    }
  }
  
  // Fallback to default
  console.log(`⚠️ Model resmi bulunamadı: "${modelName}" - Varsayılan kullanılıyor`);
  return '/ModelImage/Diğer Markalar.png';
};

// Encode image URLs properly to handle special characters
export const encodeImageUrl = (url: string): string => {
  // Don't double-encode URLs that are already encoded
  if (url.includes('%')) {
    return url;
  }
  
  // Split the URL into parts
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const path = parts.slice(0, -1).join('/');
  
  // Encode only the filename part
  const encodedFilename = encodeURIComponent(filename);
  
  return `${path}/${encodedFilename}`;
};
