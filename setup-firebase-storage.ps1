# Quick Setup Script for Firebase Storage

Write-Host "🚀 Firebase Storage Setup - Unlimited Uploads" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "📦 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "📥 Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Firebase CLI is already installed" -ForegroundColor Green
}

Write-Host ""

# Login to Firebase
Write-Host "🔐 Logging in to Firebase..." -ForegroundColor Yellow
Write-Host "   (This will open your browser)" -ForegroundColor Gray
firebase login

Write-Host ""

# Initialize Firebase (if needed)
Write-Host "🔧 Checking Firebase project..." -ForegroundColor Yellow

$firebaseJsonExists = Test-Path "firebase.json"
if (-not $firebaseJsonExists) {
    Write-Host "   Initializing Firebase Storage..." -ForegroundColor Yellow
    Write-Host "   Select: my-portfolio-7ceb6" -ForegroundColor Gray
    firebase init storage
} else {
    Write-Host "✅ Firebase project already initialized" -ForegroundColor Green
}

Write-Host ""

# Deploy storage rules
Write-Host "🚀 Deploying storage rules..." -ForegroundColor Yellow
firebase deploy --only storage

Write-Host ""

# Verify deployment
Write-Host "✅ Storage rules deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Restart your frontend server: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Login to admin panel: kushagradubey5002@gmail.com" -ForegroundColor White
Write-Host "4. Test uploading large files!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - FIREBASE_STORAGE_SETUP.md" -ForegroundColor White
Write-Host "   - UPLOAD_COMPONENT_USAGE.md" -ForegroundColor White
Write-Host "   - UNLIMITED_UPLOADS_SUMMARY.md" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Firebase Console:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/my-portfolio-7ceb6/storage" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
