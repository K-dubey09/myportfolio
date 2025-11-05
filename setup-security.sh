#!/bin/bash

# Security Setup Script for Portfolio Application
# This script helps set up the environment securely

echo "🔐 Security Setup for Portfolio Application"
echo "==========================================="
echo ""

# Check if firebase-service-account.json exists
if [ ! -f "backend/firebase-service-account.json" ]; then
    echo "❌ ERROR: backend/firebase-service-account.json not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Download your Firebase service account key from:"
    echo "   https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk"
    echo "2. Save it as: backend/firebase-service-account.json"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Firebase credentials found"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file from template..."
    cp backend/.env.example backend/.env
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    # Update .env with generated secrets (works on Linux/Mac)
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" backend/.env
    sed -i "s/your-super-secret-session-key-change-this-in-production/$SESSION_SECRET/" backend/.env
    
    echo "✅ Created backend/.env with secure random secrets"
else
    echo "⚠️  backend/.env already exists - skipping"
fi

# Verify gitignore
if grep -q "firebase-service-account.json" .gitignore; then
    echo "✅ .gitignore properly configured"
else
    echo "⚠️  WARNING: .gitignore may need updating"
fi

echo ""
echo "🎉 Security setup complete!"
echo ""
echo "Next steps:"
echo "1. Review backend/.env and adjust values as needed"
echo "2. Make sure firebase-service-account.json is NEVER committed to git"
echo "3. For production deployment, use environment variables instead of files"
echo ""
