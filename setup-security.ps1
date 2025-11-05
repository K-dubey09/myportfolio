# Security Setup Script for Portfolio Application (Windows PowerShell)
# This script helps set up the environment securely

Write-Host "🔐 Security Setup for Portfolio Application" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if firebase-service-account.json exists
if (-not (Test-Path "backend/firebase-service-account.json")) {
    Write-Host "❌ ERROR: backend/firebase-service-account.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Download your Firebase service account key from:"
    Write-Host "   https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk"
    Write-Host "2. Save it as: backend/firebase-service-account.json"
    Write-Host "3. Run this script again"
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase credentials found" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "📝 Creating backend/.env file from template..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    
    # Generate random secrets
    $jwtBytes = New-Object byte[] 32
    $sessionBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($jwtBytes)
    $rng.GetBytes($sessionBytes)
    $JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
    $SESSION_SECRET = [Convert]::ToBase64String($sessionBytes)
    
    # Update .env with generated secrets
    $content = Get-Content "backend/.env" -Raw
    $content = $content -replace "your-super-secret-jwt-key-change-this-in-production", $JWT_SECRET
    $content = $content -replace "your-super-secret-session-key-change-this-in-production", $SESSION_SECRET
    Set-Content "backend/.env" $content
    
    Write-Host "✅ Created backend/.env with secure random secrets" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env already exists - skipping" -ForegroundColor Yellow
}

# Verify gitignore
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -match "firebase-service-account.json") {
    Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: .gitignore may need updating" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Security setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review backend/.env and adjust values as needed"
Write-Host "2. Make sure firebase-service-account.json is NEVER committed to git"
Write-Host "3. For production deployment, use environment variables instead of files"
Write-Host ""
Write-Host "To start the application, run: npm run dev" -ForegroundColor Yellow
Write-Host ""
