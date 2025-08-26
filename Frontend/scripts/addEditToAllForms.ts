import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Script to automatically add edit functionality to all form files
 * This script will:
 * 1. Find all form files that use createStandardListing
 * 2. Add useEditListing import and hook
 * 3. Add edit mode useEffect
 * 4. Update handleSubmit to support edit mode
 */

const FORMS_DIR = './src/pages/Forms';

interface FormFile {
  filePath: string;
  content: string;
  hasEditHook: boolean;
  hasCreateStandardListing: boolean;
}

// Patterns to identify what needs to be added
const PATTERNS = {
  useEditListingImport: /import.*useEditListing.*from.*useEditListing/,
  useEditListingHook: /useEditListing\(\)/,
  editUseEffect: /useEffect.*isEditMode.*editData.*editLoading/,
  createStandardListing: /createStandardListing/,
  updateStandardListing: /updateStandardListing/
};

async function findFormFiles(): Promise<FormFile[]> {
  const pattern = path.join(FORMS_DIR, '**/*.tsx').replace(/\\/g, '/');
  const files = await glob(pattern);
  
  const formFiles: FormFile[] = [];
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Only process files that use createStandardListing
      if (!PATTERNS.createStandardListing.test(content)) {
        continue;
      }
      
      const hasEditHook = PATTERNS.useEditListingHook.test(content);
      const hasCreateStandardListing = PATTERNS.createStandardListing.test(content);
      
      formFiles.push({
        filePath,
        content,
        hasEditHook,
        hasCreateStandardListing
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }
  
  return formFiles;
}

function addEditHookImport(content: string): string {
  // Check if import already exists
  if (PATTERNS.useEditListingImport.test(content)) {
    return content;
  }
  
  // Find the useConfirmDialog import and add useEditListing after it
  const useConfirmImportRegex = /import.*useConfirmDialog.*from.*useConfirmDialog.*;/;
  const match = content.match(useConfirmImportRegex);
  
  if (match) {
    const importLine = match[0];
    const replacement = importLine + "\nimport { useEditListing } from '../../../hooks/useEditListing';";
    return content.replace(useConfirmImportRegex, replacement);
  }
  
  // Fallback: Add after other hook imports
  const hookImportRegex = /import.*use.*from.*hooks/;
  const hookMatch = content.match(hookImportRegex);
  if (hookMatch) {
    const importLine = hookMatch[0];
    const replacement = importLine + "\nimport { useEditListing } from '../../../hooks/useEditListing';";
    return content.replace(hookImportRegex, replacement);
  }
  
  return content;
}

function addEditHook(content: string): string {
  // Check if hook is already used
  if (PATTERNS.useEditListingHook.test(content)) {
    return content;
  }
  
  // Find the useConfirmDialog hook usage and add edit hook after it
  const confirmHookRegex = /const.*useConfirmDialog\(\);/;
  const match = content.match(confirmHookRegex);
  
  if (match) {
    const hookLine = match[0];
    const replacement = hookLine + "\n  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();";
    return content.replace(confirmHookRegex, replacement);
  }
  
  return content;
}

function addEditUseEffect(content: string): string {
  // Check if edit useEffect already exists
  if (PATTERNS.editUseEffect.test(content)) {
    return content;
  }
  
  // Find user data loading useEffect and add edit useEffect after it
  const userEffectRegex = /useEffect\(\(\) => \{[^}]+user[^}]+\}, \[user\]\);/s;
  const match = content.match(userEffectRegex);
  
  if (match) {
    const effectBlock = match[0];
    const replacement = effectBlock + `

  // Edit modu için veri yükle
  useEffect(() => {
    if (isEditMode && editData && !editLoading) {
      fillFormWithEditData(setFormData);
    }
  }, [isEditMode, editData, editLoading]);`;
    
    return content.replace(userEffectRegex, replacement);
  }
  
  return content;
}

function updateHandleSubmit(content: string): string {
  // Check if handleSubmit already supports edit mode
  if (PATTERNS.updateStandardListing.test(content)) {
    return content;
  }
  
  // Find the createStandardListing API call and replace with edit-aware logic
  const apiCallRegex = /const response = await listingService\.createStandardListing\(.*?\);[\s\S]*?if \(response\.success\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
  const match = content.match(apiCallRegex);
  
  if (match) {
    const apiBlock = match[0];
    const replacement = `// Edit mode or create mode handling
      if (isEditMode && editData) {
        console.log('İlan güncelleniyor:', payload || standardPayload);
        const response = await listingService.updateStandardListing(editData.id, payload || standardPayload);
        
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
        console.log('İlan oluşturuluyor:', payload || standardPayload);
        const response = await listingService.createStandardListing(payload || standardPayload);
        
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
    
    return content.replace(apiCallRegex, replacement);
  }
  
  return content;
}

function updateErrorMessages(content: string): string {
  // Update error messages to handle both create and edit
  const errorRegex = /const errorMessage = .*'İlan oluşturulurken bir hata oluştu';/;
  const replacement = `const errorMessage = error.response?.data?.message || error.message || 
        \`İlan \${isEditMode ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu\`;`;
  
  return content.replace(errorRegex, replacement);
}

async function updateFormFile(formFile: FormFile): Promise<boolean> {
  try {
    let updatedContent = formFile.content;
    
    // Add import
    updatedContent = addEditHookImport(updatedContent);
    
    // Add hook usage
    updatedContent = addEditHook(updatedContent);
    
    // Add edit useEffect
    updatedContent = addEditUseEffect(updatedContent);
    
    // Update handleSubmit
    updatedContent = updateHandleSubmit(updatedContent);
    
    // Update error messages
    updatedContent = updateErrorMessages(updatedContent);
    
    // Only write if content changed
    if (updatedContent !== formFile.content) {
      fs.writeFileSync(formFile.filePath, updatedContent, 'utf-8');
      console.log(`✅ Updated: ${formFile.filePath}`);
      return true;
    } else {
      console.log(`⏭️  Skipped (no changes needed): ${formFile.filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${formFile.filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Finding form files...');
  const formFiles = await findFormFiles();
  console.log(`Found ${formFiles.length} form files that use createStandardListing`);
  
  const filesToUpdate = formFiles.filter(f => !f.hasEditHook);
  console.log(`${filesToUpdate.length} files need edit functionality`);
  
  if (filesToUpdate.length === 0) {
    console.log('✅ All forms already have edit functionality!');
    return;
  }
  
  console.log('\n📝 Files to update:');
  filesToUpdate.forEach(f => console.log(`  - ${f.filePath}`));
  
  console.log('\n🚀 Starting updates...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const formFile of filesToUpdate) {
    const success = await updateFormFile(formFile);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`⏭️  Already up to date: ${formFiles.length - filesToUpdate.length} files`);
}

if (require.main === module) {
  main().catch(console.error);
}
