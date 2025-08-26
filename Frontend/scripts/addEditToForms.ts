/**
 * Tüm form dosyalarına edit sistemi ekleme scripti
 * Bu script, her bir form dosyasını güncelleyerek edit desteği ekler
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FORMS_DIR = 'src/pages/Forms';

// Form dosyalarını bul
const findFormFiles = (dir: string): string[] => {
  const files: string[] = [];
  
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFormFiles(fullPath));
    } else if (item.endsWith('.tsx') && !item.includes('test')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// useEditListing import'unu ekle
const addEditListingImport = (content: string): string => {
  // Eğer zaten import edilmişse atlat
  if (content.includes('useEditListing')) return content;
  
  // useNavigate ve useLocation'dan sonra ekle
  const importRegex = /(import.*{.*useNavigate.*useLocation.*}.*from.*'react-router-dom';)/;
  if (importRegex.test(content)) {
    return content.replace(
      importRegex,
      '$1\nimport { useEditListing } from \'../../hooks/useEditListing\';'
    );
  }
  
  // Alternatif olarak, locationService import'undan sonra ekle
  const locationServiceRegex = /(import.*locationService.*from.*'.*locationService';)/;
  if (locationServiceRegex.test(content)) {
    return content.replace(
      locationServiceRegex,
      '$1\nimport { useEditListing } from \'../../hooks/useEditListing\';'
    );
  }
  
  return content;
};

// Component başlangıcında hook'u ekle
const addEditHook = (content: string): string => {
  // Eğer zaten eklenmişse atlat
  if (content.includes('useEditListing()')) return content;
  
  // const { confirm } = useConfirmDialog(); satırından sonra ekle
  const hookRegex = /(const \{ confirm \} = useConfirmDialog\(\);)/;
  if (hookRegex.test(content)) {
    return content.replace(
      hookRegex,
      '$1\n  const { isEditMode, editId, editData, editLoading, editError, fillFormWithEditData } = useEditListing();'
    );
  }
  
  return content;
};

// Edit useEffect'i ekle
const addEditUseEffect = (content: string): string => {
  // Eğer zaten eklenmişse atlat
  if (content.includes('Edit mode: Fill form')) return content;
  
  // İlk useEffect'ten sonra ekle
  const useEffectRegex = /(useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);)/;
  if (useEffectRegex.test(content)) {
    return content.replace(
      useEffectRegex,
      `$1

  // Edit mode: Fill form with existing data
  useEffect(() => {
    if (isEditMode && editData && !editLoading) {
      console.log('📝 Edit mode: Filling form with data:', editData);
      fillFormWithEditData(setFormData);
    }
  }, [isEditMode, editData, editLoading]);`
    );
  }
  
  return content;
};

// Header'ı edit mode'a göre güncelle
const updateHeader = (content: string): string => {
  // Form başlığını bul ve edit moduna göre güncelle
  const headerRegex = /(<Typography variant="h4"[^>]*>)(.*?İlanı Oluştur)(.*?<\/Typography>)/g;
  
  return content.replace(headerRegex, (match, openTag, title, closeTag) => {
    const editTitle = title.replace('İlanı Oluştur', 'İlanını Düzenle');
    return `${openTag}{isEditMode ? '${editTitle}' : '${title}'}${closeTag}
          {isEditMode && (
            <Alert severity="info" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
              İlan düzenleme modundasınız. Değişiklikler admin onayından sonra yayınlanacaktır.
            </Alert>
          )}`;
  });
};

// Dosyayı işle
const processFormFile = (filePath: string) => {
  try {
    console.log(`Processing: ${filePath}`);
    
    let content = readFileSync(filePath, 'utf-8');
    
    // Değişiklikleri uygula
    content = addEditListingImport(content);
    content = addEditHook(content);
    content = addEditUseEffect(content);
    content = updateHeader(content);
    
    // Dosyayı güncelle
    writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
};

// Ana fonksiyon
const main = () => {
  console.log('🚀 Starting form edit system automation...');
  
  const formFiles = findFormFiles(FORMS_DIR);
  console.log(`Found ${formFiles.length} form files`);
  
  formFiles.forEach(processFormFile);
  
  console.log('✅ Edit system automation completed!');
};

// Script'i çalıştır
if (require.main === module) {
  main();
}

export { processFormFile };
