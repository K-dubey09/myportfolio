# 🔒 Security Guidelines & CI/CD Configuration

## Overview
This document outlines the security measures implemented in the CI/CD pipeline to prevent credential leaks and detect code breaks.

## 🛡️ Security Features Implemented

### 1. **Secrets & Credentials Detection**
The pipeline includes multiple layers of secrets detection:

#### **Tools Used:**
- **TruffleHog**: Scans for verified secrets in git history
- **GitLeaks**: Comprehensive secrets scanning with custom rules
- **Custom Regex Patterns**: Detects hardcoded credentials

#### **What Gets Detected:**
- ✅ API Keys (Firebase, AWS, etc.)
- ✅ Database Connection Strings (MongoDB, PostgreSQL, MySQL)
- ✅ Private Keys (SSH, RSA, etc.)
- ✅ Bearer Tokens & JWT
- ✅ OAuth Tokens
- ✅ Service Account Keys
- ✅ Passwords & Secrets
- ✅ Slack Webhooks
- ✅ GitHub Personal Access Tokens

#### **Exclusions:**
- ✅ Markdown files (`.md`) - Documentation is safe
- ✅ Example configurations
- ✅ Dummy/placeholder values

### 2. **Dependency Security Auditing**
- **npm audit** runs on both frontend and backend
- Fails on **HIGH** severity vulnerabilities
- Checks for outdated packages
- Provides security advisories

### 3. **Code Quality Checks**
- ESLint for code quality
- Prettier for code formatting
- Console.log detection (warning)
- Import validation
- Syntax error checking

### 4. **Build Verification**
- ✅ Frontend build success verification
- ✅ Build output validation (dist/index.html)
- ✅ Backend syntax checking
- ✅ File structure validation

### 5. **Integration Testing**
- API endpoint consistency checking
- TypeScript validation (if applicable)
- Circular dependency detection

### 6. **Post-Deployment Verification**
- Health check endpoints
- Deployment status verification
- Build artifact verification

## 🚫 What is BLOCKED from Committing

### **Strictly Forbidden Files:**
```
.env
.env.local
.env.production
firebase-service-account.json
*-service-account.json
serviceAccountKey.json
credentials.json
secrets.json
*.pem
*.key (private keys)
```

### **Patterns Detected:**
```javascript
// ❌ WILL BE CAUGHT
const apiKey = "AIzaSyD...real-key-here"
const password = "my-real-password"
const mongoUri = "mongodb+srv://user:pass@cluster.mongodb.net"

// ✅ ALLOWED (in .md files)
Documentation showing: `VITE_API_KEY=your-api-key-here`
```

## 📋 CI/CD Pipeline Jobs

### Job Execution Order:
```
1. secrets-scan (FIRST - Blocks everything if secrets found)
   ├── TruffleHog scan
   ├── GitLeaks scan
   ├── Hardcoded credentials check
   ├── Firebase credentials check
   └── .env file check

2. code-quality (Runs in parallel after secrets-scan)
   ├── ESLint
   ├── Prettier
   └── Console.log detection

3. dependency-security (Runs in parallel)
   ├── npm audit (high severity fails)
   └── Outdated packages check

4. backend-test (Runs in parallel)
   ├── Syntax checking
   ├── Environment validation
   ├── Tests
   └── Structure validation

5. frontend-build (After code-quality)
   ├── Build with dummy env vars
   ├── Import validation
   ├── Tests
   └── Build verification

6. integration-test (After build & backend tests)
   ├── API endpoint consistency
   ├── TypeScript checking
   └── Circular dependency check

7. docker-build (Only on main branch)
   └── Build Docker images

8. deploy-production (Only on main + push)
   └── Deploy to configured platforms

9. post-deploy-check
   └── Health checks

10. notify
    └── Status notifications & summary
```

## 🔧 Setup Instructions

### 1. Install Pre-commit Hooks (Local Development)
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Test all hooks
pre-commit run --all-files
```

### 2. Required GitHub Secrets (For Deployment)
Add these secrets in GitHub Settings → Secrets and variables → Actions:

```
# Optional - For Vercel deployment
VERCEL_TOKEN

# Optional - For Render deployment
RENDER_DEPLOY_HOOK

# Optional - For Netlify deployment
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID

# Optional - For SSH deployment
SSH_HOST
SSH_USERNAME
SSH_PRIVATE_KEY

# Optional - For notifications
SLACK_WEBHOOK

# Optional - For GitLeaks
GITLEAKS_LICENSE
```

### 3. Environment Variables (Production)
Set these in your deployment platform (Vercel, Render, etc.):
```bash
VITE_API_BASE=https://your-api-domain.com
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
# ... other Firebase config
```

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```javascript
// Hardcoding credentials in code
const apiKey = "AIzaSyD-real-key";
const mongoUri = "mongodb+srv://user:password@cluster.mongodb.net";
```

### ✅ DO THIS INSTEAD:
```javascript
// Use environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const mongoUri = process.env.MONGODB_URI;
```

### ❌ DON'T COMMIT:
- `.env` files
- `firebase-service-account.json`
- Any file with real credentials
- Private keys

### ✅ DO COMMIT:
- `.env.example` (with dummy values)
- Documentation with placeholder values
- Configuration templates

## 🔍 Testing the Pipeline Locally

### Test Secrets Detection:
```bash
# Run GitLeaks
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path -v

# Run TruffleHog
trufflehog git file://. --since-commit HEAD
```

### Test Build:
```bash
cd frontend
npm run build
```

### Test Backend:
```bash
cd backend
node --check server.js
npm test
```

## 📊 Pipeline Status Badges

Add to your README.md:
```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)
```

## 🆘 Troubleshooting

### Pipeline Fails on Secrets Scan:
1. Review the failed check logs
2. Remove the detected secret
3. Update git history if needed: `git filter-branch` or `git rebase`
4. Rotate the exposed credential immediately

### False Positives:
1. Check `.gitleaks.toml` configuration
2. Add pattern to allowlist if it's documentation
3. Ensure `.md` files are excluded

### Build Fails:
1. Check error logs in GitHub Actions
2. Test build locally first
3. Verify all dependencies are in package.json
4. Check Node version compatibility

## 📚 Additional Resources

- [GitLeaks Documentation](https://github.com/gitleaks/gitleaks)
- [TruffleHog Documentation](https://github.com/trufflesecurity/trufflehog)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🔄 Maintenance

### Regular Tasks:
- Review and update `.gitleaks.toml` patterns
- Update pre-commit hook versions
- Rotate credentials regularly
- Monitor dependency vulnerabilities
- Review GitHub Actions logs

### Monthly:
- Audit npm dependencies: `npm audit`
- Check for outdated packages: `npm outdated`
- Review security advisories

---

**Remember**: Security is everyone's responsibility! 🛡️

If you discover a security vulnerability, please report it immediately to the repository owner.
