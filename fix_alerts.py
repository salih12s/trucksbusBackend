import os
import re
import glob

# Alert kullanılan formları bul
form_files = glob.glob("Frontend/src/pages/Forms/**/*.tsx", recursive=True)

print(f"Found {len(form_files)} form files")

for file_path in form_files:
    print(f"Processing: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if useConfirmDialog is already imported
        if 'useConfirmDialog' not in content:
            # Add useConfirmDialog import
            if "import { useAuth }" in content:
                content = content.replace(
                    "import { useAuth }",
                    "import { useConfirmDialog } from '../../../hooks/useConfirmDialog';\nimport { useAuth }"
                )
            elif "import React" in content:
                # Find the right place to add import
                lines = content.split('\n')
                react_import_line = -1
                for i, line in enumerate(lines):
                    if line.startswith("import React"):
                        react_import_line = i
                        break
                
                if react_import_line != -1:
                    lines.insert(react_import_line + 1, "import { useConfirmDialog } from '../../../hooks/useConfirmDialog';")
                    content = '\n'.join(lines)
        
        # Add confirm hook declaration if needed
        if '{ confirm } = useConfirmDialog()' not in content:
            # Look for useAuth or similar hooks
            if 'const { user } = useAuth();' in content:
                content = content.replace(
                    'const { user } = useAuth();',
                    'const { user } = useAuth();\n  const { confirm } = useConfirmDialog();'
                )
            elif 'const navigate = useNavigate();' in content:
                content = content.replace(
                    'const navigate = useNavigate();',
                    'const navigate = useNavigate();\n  const { confirm } = useConfirmDialog();'
                )
        
        # Replace alert calls
        alert_patterns = [
            # Basic alerts
            (r"alert\('([^']+)'\);", r"await confirm({ title: 'Bilgi', description: '\1', severity: 'info' });"),
            
            # Specific messages
            (r"alert\('En fazla (\d+) fotoğraf yükleyebilirsiniz\.'\);", r"await confirm({ title: 'Fotoğraf Limiti', description: 'En fazla \1 fotoğraf yükleyebilirsiniz.', severity: 'warning' });"),
            (r"alert\('Lütfen tüm gerekli alanları doldurun\.'\);", r"await confirm({ title: 'Eksik Bilgi', description: 'Lütfen tüm gerekli alanları doldurun.', severity: 'warning' });"),
            (r"alert\('Lütfen şehir ve ilçe seçimi yapınız\.'\);", r"await confirm({ title: 'Eksik Bilgi', description: 'Lütfen şehir ve ilçe seçimi yapınız.', severity: 'warning' });"),
            (r"alert\('İlanınız başarıyla oluşturuldu[^']*'\);", r"await confirm({ title: 'Başarılı', description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.', severity: 'success' });"),
            (r"alert\(`Veri doğrulama hatası: ([^`]+)`\);", r"await confirm({ title: 'Doğrulama Hatası', description: `Veri doğrulama hatası: \1`, severity: 'error' });"),
            (r"alert\(([^)]+message[^)]+)\);", r"await confirm({ title: 'Hata', description: \1, severity: 'error' });"),
        ]
        
        original_content = content
        
        for pattern, replacement in alert_patterns:
            content = re.sub(pattern, replacement, content)
        
        # Make handleImageUpload async if it contains await
        if 'handleImageUpload' in content and 'await confirm' in content:
            content = re.sub(
                r'const handleImageUpload = \(([^)]+)\) => \{',
                r'const handleImageUpload = async (\1) => {',
                content
            )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Updated {file_path}")
        else:
            print(f"  ⏭️  No changes needed for {file_path}")
            
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")

print("✅ Alert fixing complete!")
