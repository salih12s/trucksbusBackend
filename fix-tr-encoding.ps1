# Turkish Mojibake Encoding Fix Script
# Finds and fixes Turkish character encoding issues across the repository

param(
    [string]$Root = ".",
    [switch]$DryRun
)

# Configuration
$TextExtensions = @('*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.html', '*.css', '*.scss', '*.md', '*.yml', '*.yaml')
$ExcludeDirs = @('.git', 'node_modules', 'dist', 'build', '.next', 'out', 'coverage')

# Statistics
$Stats = @{
    ProcessedFiles = 0
    ChangedFiles = 0
    SkippedFiles = 0
    ErrorFiles = 0
    ChangedFilesList = @()
}

function Test-IsBinaryFile {
    param([string]$FilePath)
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes.Length -eq 0) { return $false }
        
        # Check first 1024 bytes for null bytes
        $checkLength = [Math]::Min(1024, $bytes.Length)
        for ($i = 0; $i -lt $checkLength; $i++) {
            if ($bytes[$i] -eq 0) { return $true }
        }
        return $false
    }
    catch {
        return $true
    }
}

function Test-HasMojibakePattern {
    param([string]$Content)
    # Check for common mojibake patterns
    if ($Content -match "Ã") { return $true }
    if ($Content -match "Ä±") { return $true }
    if ($Content -match "Å") { return $true }
    if ($Content -match "Â") { return $true }
    if ($Content -match "â€") { return $true }
    return $false
}

function Convert-FromCP1252 {
    param([string]$Content)
    
    try {
        $bytes = [System.Text.Encoding]::GetEncoding("windows-1252").GetBytes($Content)
        $result = [System.Text.Encoding]::UTF8.GetString($bytes)
        return $result
    }
    catch {
        return $null
    }
}

function Convert-FromCP1254 {
    param([string]$Content)
    
    try {
        $bytes = [System.Text.Encoding]::GetEncoding("windows-1254").GetBytes($Content)
        $result = [System.Text.Encoding]::UTF8.GetString($bytes)
        return $result
    }
    catch {
        return $null
    }
}

function Test-ConversionImprovement {
    param(
        [string]$Original,
        [string]$Converted
    )
    
    if ($null -eq $Converted -or $Converted -eq $Original) {
        return $false
    }
    
    # Count problematic characters
    $originalProblems = 0
    $convertedProblems = 0
    
    # Count mojibake patterns
    if ($Original -match "Ã") { $originalProblems++ }
    if ($Original -match "Ä±") { $originalProblems++ }
    if ($Original -match "Å") { $originalProblems++ }
    if ($Original -match "Â") { $originalProblems++ }
    
    if ($Converted -match "Ã") { $convertedProblems++ }
    if ($Converted -match "Ä±") { $convertedProblems++ }
    if ($Converted -match "Å") { $convertedProblems++ }
    if ($Converted -match "Â") { $convertedProblems++ }
    
    # Count Turkish characters
    $originalTurkish = 0
    $convertedTurkish = 0
    
    if ($Original -match "İ") { $originalTurkish++ }
    if ($Original -match "ı") { $originalTurkish++ }
    if ($Original -match "Ş") { $originalTurkish++ }
    if ($Original -match "ş") { $originalTurkish++ }
    if ($Original -match "Ğ") { $originalTurkish++ }
    if ($Original -match "ğ") { $originalTurkish++ }
    if ($Original -match "Ç") { $originalTurkish++ }
    if ($Original -match "ç") { $originalTurkish++ }
    if ($Original -match "Ö") { $originalTurkish++ }
    if ($Original -match "ö") { $originalTurkish++ }
    if ($Original -match "Ü") { $originalTurkish++ }
    if ($Original -match "ü") { $originalTurkish++ }
    
    if ($Converted -match "İ") { $convertedTurkish++ }
    if ($Converted -match "ı") { $convertedTurkish++ }
    if ($Converted -match "Ş") { $convertedTurkish++ }
    if ($Converted -match "ş") { $convertedTurkish++ }
    if ($Converted -match "Ğ") { $convertedTurkish++ }
    if ($Converted -match "ğ") { $convertedTurkish++ }
    if ($Converted -match "Ç") { $convertedTurkish++ }
    if ($Converted -match "ç") { $convertedTurkish++ }
    if ($Converted -match "Ö") { $convertedTurkish++ }
    if ($Converted -match "ö") { $convertedTurkish++ }
    if ($Converted -match "Ü") { $convertedTurkish++ }
    if ($Converted -match "ü") { $convertedTurkish++ }
    
    # Return true if problems decreased or Turkish chars increased
    return ($convertedProblems -lt $originalProblems) -or ($convertedTurkish -gt $originalTurkish)
}

function Fix-FileEncoding {
    param([string]$FilePath)
    
    try {
        $Stats.ProcessedFiles++
        
        # Skip binary files
        if (Test-IsBinaryFile $FilePath) {
            Write-Host "SKIP (binary): $FilePath" -ForegroundColor Yellow
            $Stats.SkippedFiles++
            return
        }
        
        # Read current content
        $originalContent = Get-Content $FilePath -Raw -Encoding UTF8
        if ($null -eq $originalContent -or $originalContent.Length -eq 0) {
            $Stats.SkippedFiles++
            return
        }
        
        # Check if file has mojibake patterns
        if (-not (Test-HasMojibakePattern $originalContent)) {
            return # No mojibake detected
        }
        
        Write-Host "ANALYZING: $FilePath" -ForegroundColor Cyan
        
        $bestContent = $originalContent
        $bestImprovement = $false
        $usedEncoding = "none"
        
        # Try CP1252 first
        $cp1252Content = Convert-FromCP1252 $originalContent
        if ($null -ne $cp1252Content -and (Test-ConversionImprovement $originalContent $cp1252Content)) {
            $bestContent = $cp1252Content
            $bestImprovement = $true
            $usedEncoding = "CP1252"
        }
        
        # If CP1252 didn't help, try CP1254
        if (-not $bestImprovement) {
            $cp1254Content = Convert-FromCP1254 $originalContent
            if ($null -ne $cp1254Content -and (Test-ConversionImprovement $originalContent $cp1254Content)) {
                $bestContent = $cp1254Content
                $bestImprovement = $true
                $usedEncoding = "CP1254"
            }
        }
        
        # If we found an improvement
        if ($bestImprovement -and $bestContent -ne $originalContent) {
            if ($DryRun) {
                Write-Host "WOULD FIX ($usedEncoding): $FilePath" -ForegroundColor Green
            }
            else {
                # Create backup if it doesn't exist
                $backupPath = $FilePath + ".bak"
                if (-not (Test-Path $backupPath)) {
                    Copy-Item $FilePath $backupPath -Force
                }
                
                # Write the fixed content as UTF-8 without BOM
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($FilePath, $bestContent, $utf8NoBom)
                
                Write-Host "FIXED ($usedEncoding): $FilePath" -ForegroundColor Green
            }
            
            $Stats.ChangedFiles++
            $Stats.ChangedFilesList += $FilePath
        }
        else {
            Write-Host "NO IMPROVEMENT: $FilePath" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "ERROR: $FilePath - $($_.Exception.Message)" -ForegroundColor Red
        $Stats.ErrorFiles++
    }
}

# Main execution
Write-Host "=== Turkish Mojibake Encoding Fix ===" -ForegroundColor Magenta
Write-Host "Root: $((Resolve-Path $Root).Path)" -ForegroundColor Yellow
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'WRITE' })" -ForegroundColor Yellow
Write-Host "Extensions: $($TextExtensions -join ', ')" -ForegroundColor Yellow
Write-Host ""

# Get all files to process
$allFiles = @()
foreach ($ext in $TextExtensions) {
    $files = Get-ChildItem -Path $Root -Filter $ext -Recurse -File | Where-Object { 
        $relativePath = $_.FullName.Substring((Resolve-Path $Root).Path.Length + 1)
        $excludeDir = $false
        foreach ($dir in $ExcludeDirs) {
            if ($relativePath -like "$dir/*" -or $relativePath -like "$dir\*") {
                $excludeDir = $true
                break
            }
        }
        -not $excludeDir
    }
    $allFiles += $files
}

Write-Host "Found $($allFiles.Count) files to process..." -ForegroundColor Yellow
Write-Host ""

# Process each file
foreach ($file in $allFiles) {
    Fix-FileEncoding $file.FullName
}

# Final report
Write-Host ""
Write-Host "=== SUMMARY REPORT ===" -ForegroundColor Magenta
Write-Host "Root Path: $((Resolve-Path $Root).Path)" -ForegroundColor Yellow
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'WRITE' })" -ForegroundColor Yellow
Write-Host "Processed: $($Stats.ProcessedFiles) files" -ForegroundColor Yellow
Write-Host "Changed: $($Stats.ChangedFiles) files" -ForegroundColor Green
Write-Host "Skipped: $($Stats.SkippedFiles) files" -ForegroundColor Gray
Write-Host "Errors: $($Stats.ErrorFiles) files" -ForegroundColor Red
Write-Host ""

if ($Stats.ChangedFiles -gt 0) {
    Write-Host "Changed files:" -ForegroundColor Green
    foreach ($file in $Stats.ChangedFilesList) {
        Write-Host "  - $file" -ForegroundColor White
    }
    Write-Host ""
}

# Configuration tips
if (-not $DryRun -and $Stats.ChangedFiles -gt 0) {
    Write-Host "=== CONFIGURATION TIPS ===" -ForegroundColor Magenta
    Write-Host "To prevent future encoding issues, consider adding:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. .editorconfig file:" -ForegroundColor Cyan
    Write-Host "   [*]" -ForegroundColor White
    Write-Host "   charset = utf-8" -ForegroundColor White
    Write-Host "   end_of_line = lf" -ForegroundColor White
    Write-Host ""
    Write-Host "2. .vscode/settings.json:" -ForegroundColor Cyan
    Write-Host "   {" -ForegroundColor White
    Write-Host '     "files.encoding": "utf8",' -ForegroundColor White
    Write-Host '     "files.autoGuessEncoding": false' -ForegroundColor White
    Write-Host "   }" -ForegroundColor White
    Write-Host ""
}

Write-Host "=== USAGE EXAMPLES ===" -ForegroundColor Magenta
Write-Host "# Dry run (preview changes):" -ForegroundColor Cyan
Write-Host "powershell -ExecutionPolicy Bypass -File .\fix-tr-encoding.ps1 -Root . -DryRun" -ForegroundColor White
Write-Host ""
Write-Host "# Actual fix:" -ForegroundColor Cyan
Write-Host "powershell -ExecutionPolicy Bypass -File .\fix-tr-encoding.ps1 -Root ." -ForegroundColor White
Write-Host ""

Write-Host "Script completed!" -ForegroundColor Green
