const fs = require('fs');
const path = require('path');

// Ana Forms klasörü
const formsDir = './src/pages/Forms';

// Tüm .tsx dosyalarını bul
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Dosyayı güncelle
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // useConfirmDialog import ekle (eğer yoksa)
  if (!content.includes('useConfirmDialog') && content.includes("alert('")) {
    const importMatch = content.match(/import.*from\s+['"]react['"];?\s*\n/);
    if (importMatch) {
      const insertIndex = importMatch.index + importMatch[0].length;
      const relativeDepth = (filePath.match(/\//g) || []).length - 3; // src/pages/Forms'dan hook'a kadar
      const relativePath = '../'.repeat(relativeDepth) + 'hooks/useConfirmDialog';
      
      content = content.slice(0, insertIndex) + 
        `import { useConfirmDialog } from '${relativePath}';\n` + 
        content.slice(insertIndex);
      modified = true;
    }
  }
  
  // Component başında hook ekle
  const componentMatches = content.matchAll(/const\s+(\w+)(?:Form|Page)?(?:\s*:\s*React\.FC(?:<[^>]*>)?|\s*)?\s*=\s*\(\)\s*=>\s*{/g);
  for (const match of componentMatches) {
    if (!content.includes('const { confirm } = useConfirmDialog();')) {
      const insertIndex = match.index + match[0].length;
      content = content.slice(0, insertIndex) + 
        '\n  const { confirm } = useConfirmDialog();' + 
        content.slice(insertIndex);
      modified = true;
      break;
    }
  }
  
  // Basit alert çağrılarını değiştir
  content = content.replace(
    /alert\(\s*['"`]([^'"`]+)['"`]\s*\);?/g,
    `await confirm({
      title: 'Bilgilendirme',
      description: '$1',
      severity: 'info',
      confirmText: 'Tamam',
      cancelText: ''
    });`
  );
  
  // Başarı mesajlarını özel olarak işle
  content = content.replace(
    /await confirm\(\{\s*title: 'Bilgilendirme',\s*description: '([^']*başarıyla[^']*)',\s*severity: 'info',/g,
    `await confirm({
      title: 'Başarılı',
      description: '$1',
      severity: 'success',`
  );
  
  // Hata/uyarı mesajlarını özel olarak işle
  content = content.replace(
    /await confirm\(\{\s*title: 'Bilgilendirme',\s*description: '([^']*(?:fazla|hata|uyarı|geçersiz)[^']*)',\s*severity: 'info',/g,
    `await confirm({
      title: 'Uyarı',
      description: '$1',
      severity: 'warning',`
  );
  
  // Fonksiyonları async yap
  content = content.replace(
    /const\s+(handle\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    'const $1 = async ($2) => {'
  );
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Tüm dosyaları işle
try {
  const tsxFiles = findTsxFiles(formsDir);
  console.log(`Found ${tsxFiles.length} TSX files in Forms directory`);
  
  for (const file of tsxFiles) {
    try {
      updateFile(file);
    } catch (error) {
      console.error(`Error updating ${file}:`, error.message);
    }
  }
  
  console.log('All files processed!');
} catch (error) {
  console.error('Script error:', error.message);
}
