import * as fs from 'fs';
import * as path from 'path';

// Güncellenecek dosya listesi
const filesToUpdate = [
  'src/pages/Forms/Dorse/Damperli/HavuzHardoxTipiForm.tsx',
  'src/pages/Forms/Dorse/Damperli/KapakliTipForm.tsx',
  'src/pages/Forms/TasimaRomorklari/YukRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/TupDamacanaRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/BoruRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/FrigoRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/HayvanRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/PlatformRomorkForm.tsx',
  'src/pages/Forms/TasimaRomorklari/SeyehatRomorkForm.tsx'
];

function addEditFunctionality(filePath: string): boolean {
  try {
    console.log(`🔄 Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let hasChanges = false;
    
    // 1. Add useEditListing import if not present
    if (!content.includes('useEditListing')) {
      const importRegex = /import { useConfirmDialog } from ['"]([^'"]*)['"]/;
      const match = content.match(importRegex);
      if (match) {
        const importPath = match[1].replace('useConfirmDialog', 'useEditListing');
        const newImport = `import { useEditListing } from '${importPath.replace('useConfirmDialog', 'useEditListing')}';`;
        content = content.replace(importRegex, match[0] + '\n' + newImport);
        hasChanges = true;
        console.log('  ✅ Added useEditListing import');
      }
    }
    
    // 2. Add hook usage after useConfirmDialog
    if (!content.includes('const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing()')) {
      const hookRegex = /const { confirm } = useConfirmDialog\(\);/;
      if (hookRegex.test(content)) {
        content = content.replace(hookRegex, 
          `const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();`);
        hasChanges = true;
        console.log('  ✅ Added useEditListing hook usage');
      }
    }
    
    // 3. Add edit useEffect after user useEffect
    if (!content.includes('// Edit modu için veri yükle')) {
      const userEffectRegex = /useEffect\(\(\) => \{[^}]*user[^}]*\}, \[user\]\);/s;
      const match = content.match(userEffectRegex);
      if (match) {
        const editUseEffect = `

  // Edit modu için veri yükle
  useEffect(() => {
    if (isEditMode && editData && !editLoading) {
      fillFormWithEditData(setFormData);
    }
  }, [isEditMode, editData, editLoading]);`;
        
        content = content.replace(match[0], match[0] + editUseEffect);
        hasChanges = true;
        console.log('  ✅ Added edit useEffect');
      }
    }
    
    // 4. Update handleSubmit function
    if (!content.includes('updateStandardListing')) {
      const submitRegex = /const response = await listingService\.createStandardListing\([^)]+\);[\s\S]*?if \(response\.success\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
      const match = content.match(submitRegex);
      
      if (match) {
        const newSubmitLogic = `// Edit mode or create mode handling
      if (isEditMode && editData) {
        console.log('İlan güncelleniyor:', standardPayload || payload);
        const response = await listingService.updateStandardListing(editData.id, standardPayload || payload);
        
        if (response.success) {
          await confirm({
            title: 'Başarılı',
            description: 'İlanınız başarıyla güncellendi! Admin onayından sonra yeniden yayınlanacaktır.',
            severity: 'success',
            confirmText: 'Tamam',
            cancelText: ''
          });
          navigate('/user/my-listings');
        } else {
          throw new Error(response.message || 'İlan güncellenemedi');
        }
      } else {
        console.log('İlan oluşturuluyor:', standardPayload || payload);
        const response = await listingService.createStandardListing(standardPayload || payload);
        
        if (response.success) {
          await confirm({
            title: 'Başarılı',
            description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
            severity: 'success',
            confirmText: 'Tamam',
            cancelText: ''
          });
          navigate('/user/my-listings');
        } else {
          throw new Error(response.message || 'İlan oluşturulamadı');
        }
      }`;
        
        content = content.replace(match[0], newSubmitLogic);
        hasChanges = true;
        console.log('  ✅ Updated handleSubmit function');
      }
    }
    
    // 5. Update error messages
    const errorRegex = /'İlan oluşturulurken bir hata oluştu'/;
    if (errorRegex.test(content)) {
      content = content.replace(errorRegex, 
        '`İlan ${isEditMode ? \'güncellenirken\' : \'oluşturulurken\'} bir hata oluştu`');
      hasChanges = true;
      console.log('  ✅ Updated error messages');
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ Successfully updated: ${filePath}`);
      return true;
    } else {
      console.log(`  ⏭️  No changes needed: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ Error updating ${filePath}:`, error);
    return false;
  }
}

// Ana fonksiyon
function main() {
  console.log('🚀 Starting batch form updates...');
  console.log(`📝 ${filesToUpdate.length} files to process\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const filePath of filesToUpdate) {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      errorCount++;
      continue;
    }
    
    const result = addEditFunctionality(fullPath);
    if (result === true) {
      successCount++;
    } else if (result === false) {
      skipCount++;
    } else {
      errorCount++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount} files`);
  console.log(`⏭️  Skipped (no changes): ${skipCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📈 Total processed: ${successCount + skipCount + errorCount} files`);
}

main();
