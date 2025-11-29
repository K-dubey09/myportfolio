# Firebase Credentials Setup Guide

## 🚨 CRITICAL: Firebase credentials were removed from this repository for security

The Firebase service account credentials have been **permanently removed** from Git history and should **NEVER** be committed again.

## Setup Instructions

### 1. For Local Development

1. **Get Firebase Credentials**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Download the JSON file

2. **Store Credentials Locally** (NOT in Git):
   ```bash
   # Copy the downloaded file to backend folder
   cp ~/Downloads/your-firebase-credentials.json backend/firebase-service-account.json
   ```

3. **Verify .gitignore** (already configured):
   ```gitignore
   # Firebase Credentials - STRICTLY FORBIDDEN!
   backend/firebase-service-account.json
   firebase-service-account.json
   *-service-account.json
   *.json.backup
   ```

### 2. For GitHub Actions / CI/CD

1. **Add Firebase Credentials as GitHub Secret**:
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the **entire JSON content** of your Firebase service account file
   - Click **Add secret**

2. **Update Workflow** (if needed):
   The workflow should already include:
   ```yaml
   env:
     FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
   ```

### 3. For Production Deployment

#### Option A: Environment Variables (Recommended)
```bash
# Set as environment variable
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

#### Option B: Kubernetes Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: firebase-credentials
type: Opaque
stringData:
  credentials.json: |
    {
      "type": "service_account",
      "project_id": "...",
      ...
    }
```

#### Option C: Docker Secret
```bash
# Create Docker secret
docker secret create firebase_creds backend/firebase-service-account.json

# Use in docker-compose.yml
services:
  backend:
    secrets:
      - firebase_creds
```

### 4. Code Usage

The backend automatically loads credentials from environment variables:

```javascript
// backend/config/firebase.js
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Load from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Development: Load from local file
  serviceAccount = JSON.parse(readFileSync('firebase-service-account.json'));
}
```

## 🔒 Security Best Practices

### ✅ DO:
- Store credentials in environment variables
- Use GitHub Secrets for CI/CD
- Add all credential files to `.gitignore`
- Rotate credentials if exposed
- Use different credentials for dev/staging/production

### ❌ DON'T:
- Commit credentials to Git (even private repos)
- Share credentials via email/Slack/Discord
- Store credentials in frontend code
- Use production credentials for development
- Push credentials to Docker Hub/public registries

## 🚨 If Credentials Are Exposed

1. **Immediately revoke** the compromised credentials in Firebase Console
2. **Generate new credentials**
3. **Update all environments** with new credentials
4. **Remove from Git history** (if committed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/firebase-service-account.json" \
     --prune-empty --tag-name-filter cat -- --all
   
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin main --force
   ```

## Testing

Test that credentials are loaded correctly:

```bash
# Local development
npm run dev

# Should see: 🔐 Loading Firebase credentials from environment variable
# OR: ⚠️  Loading Firebase credentials from local file (development only)
```

## Support

If you have issues:
1. Verify `.gitignore` includes Firebase credential patterns
2. Check that `FIREBASE_SERVICE_ACCOUNT` secret is set in GitHub
3. Ensure JSON format is valid
4. Confirm Firebase project has correct permissions

---

**Last Updated**: After credential removal on 2025-01-03
**Security Status**: ✅ Credentials removed from Git history
