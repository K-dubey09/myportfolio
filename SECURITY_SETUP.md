# 🔐 Security Setup Guide

## ⚠️ IMPORTANT: Never Commit Sensitive Files

This repository uses Firebase and requires credentials that should **NEVER** be committed to git.

## Quick Setup

### Windows (PowerShell)
```powershell
.\setup-security.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x setup-security.sh
./setup-security.sh
```

## Manual Setup

### 1. Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded file as `backend/firebase-service-account.json`

**⚠️ CRITICAL: This file is in `.gitignore` and should NEVER be committed!**

### 2. Environment Variables

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Update the following variables in `backend/.env`:

```env
# Generate strong random secrets:
JWT_SECRET=your-generated-secret-here
SESSION_SECRET=your-generated-secret-here
```

To generate secure random secrets:

**Windows PowerShell:**
```powershell
# Generate JWT Secret
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

## Files That Should NEVER Be Committed

✅ **Already in .gitignore:**
- `backend/firebase-service-account.json`
- `backend/.env`
- `frontend/.env`
- `node_modules/`

## Production Deployment

For production environments (like Heroku, Vercel, AWS, etc.), use environment variables instead of files:

### Option 1: Base64 Encoded Service Account

```bash
# Linux/Mac
base64 -w 0 backend/firebase-service-account.json

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("backend/firebase-service-account.json"))
```

Set the result as `FIREBASE_SERVICE_ACCOUNT_BASE64` environment variable.

### Option 2: Individual Environment Variables

Set these in your deployment platform:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

## Security Checklist

- [ ] Firebase service account file is NOT in git history
- [ ] `.env` files are in `.gitignore`
- [ ] Strong random secrets generated for JWT and sessions
- [ ] Frontend and backend URLs configured correctly
- [ ] Production uses environment variables (not files)
- [ ] HTTPS enabled in production
- [ ] CORS configured properly for production domains

## Testing Security

Check if any sensitive files are tracked by git:
```bash
git ls-files | grep -E "(firebase|\.env$|service-account)"
```

This command should return **nothing**. If it shows any files, they need to be removed from git history.

## If You Accidentally Committed Secrets

1. **Immediately** rotate/regenerate the exposed credentials
2. Remove the file from git history:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch backend/firebase-service-account.json" \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push to remote:
   ```bash
   git push origin --force --all
   ```
4. Contact GitHub support to purge the cached files

## Need Help?

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Environment Variables Guide](https://12factor.net/config)
