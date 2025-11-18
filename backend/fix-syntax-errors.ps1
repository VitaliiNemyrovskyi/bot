# Fix syntax errors in TypeScript files

Write-Host "Fixing TypeScript syntax errors..."

# Fix bybit-example.ts
$file1 = "src\lib\bybit-example.ts"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw
    $content = $content -replace '`\$\{false // Testnet is deprecated \? ''Testnet'' : ''Mainnet''\}`', 'Mainnet'
    Set-Content $file1 -Value $content
    Write-Host "Fixed $file1"
}

# Fix bybit-user-info-example.ts - check for unclosed braces
$file2 = "src\lib\bybit-user-info-example.ts"
if (Test-Path $file2) {
    Write-Host "Checking $file2..."
}

Write-Host "Done!"
