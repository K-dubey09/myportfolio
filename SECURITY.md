# 🔒 Security Policy & CI/CD Protection

## Overview

This project implements **security-first architecture** with comprehensive protection against:
- ✅ Credential leaks and API key exposure
- ✅ Security vulnerabilities and CVEs
- ✅ Code injection attacks (SQL, XSS, Command)
- ✅ Authentication and authorization flaws  
- ✅ Supply chain attacks
- ✅ System bugs and exploitation vectors
- ✅ Future security threats and hacks

**Security Level:** 🔒 Enterprise-Grade  
**Pipeline Status:** ✅ 14 Security Gates Active  
**Architecture:** Security-First Design

---

## 🛡️ Security-First Architecture

Our CI/CD pipeline prevents vulnerable code from reaching production through **14 comprehensive security gates**:

### Layer 1: 🔒 Secrets & Credentials Protection
- **TruffleHog** - Verified secrets detection  
- **GitLeaks** - Custom rule-based scanning  
- **Custom Regex** - Pattern-based credential detection  
- **Firebase Key Detection** - Service account protection  
- **Environment File Check** - .env file prevention

### Layer 2: 🛡️ Vulnerability Assessment  
- **Snyk Security** - Real-time vulnerability database  
- **OWASP Dependency Check** - Known vulnerability scanning  
- **Trivy Scanner** - Critical/High severity detection  
- **GitHub Security Alerts** - SARIF integration

### Layer 3: 🔬 Code Security Analysis  
- **CodeQL** - Advanced semantic analysis  
- **SQL Injection Detection** - Query pattern analysis  
- **XSS Prevention** - DOM manipulation checks  
- **Command Injection** - Process execution validation  
- **Path Traversal** - File system access audit  
- **Insecure Random** - Cryptographic randomness  
- **Deserialization** - Unsafe data parsing  
- **ReDoS Protection** - Regex complexity analysis  
- **SSRF Prevention** - External request validation

### Layer 4: 🔐 Dependency & Supply Chain Security  
- **Malicious Package Detection** - Typosquatting prevention  
- **Package Integrity** - Signature verification  
- **npm Audit** - High/Critical CVE blocking  
- **Outdated Dependencies** - Version tracking  
- **License Compliance** - Legal verification

### Layer 5: 🔑 Authentication & Authorization Security  
- **Password Validation** - Strength requirements  
- **JWT Security** - Token implementation audit  
- **Session Security** - Cookie configuration  
- **CORS Verification** - Origin policy enforcement  
- **Rate Limiting** - Abuse prevention  
- **Unprotected Routes** - Middleware verification

### Layer 6: 🔒 Backend Security Hardening  
- **Input Validation** - User data sanitization  
- **Parameterized Queries** - SQL injection prevention  
- **Security Headers** - HTTP header enforcement (Helmet)  
- **File Upload Security** - MIME type validation  
- **Environment Variables** - Configuration security

### Layer 7: 🎨 Frontend Security  
- **Build Security** - Production artifact verification  
- **Console Statements** - Debug code detection  
- **ESLint Security** - Security rule enforcement  
- **Code Formatting** - Prettier checks

### Layer 8: 🔗 Integration Security  
- **API Consistency** - Endpoint validation  
- **TypeScript Checks** - Type safety  
- **Circular Dependencies** - Architecture validation

### Layer 9: 🐳 Container Security  
- **Docker Image Scanning** - Container vulnerability detection  
- **Trivy Container Scan** - Critical/High severity  
- **SARIF Integration** - GitHub Security tab

### Layer 10: 🚦 Final Security Gate  
- **Multi-layer Verification** - All checks passed summary  
- **Security Report** - Comprehensive status  
- **Deployment Readiness** - Green light confirmation

### Layer 11: 🔍 Post-Deploy Security  
- **Security Headers Check** - Production verification  
- **SSL/TLS Validation** - Certificate verification  
- **OWASP ZAP Scan** - Live security testing  
- **Secrets in Build Check** - Final verification

---

## 🚫 What Gets BLOCKED (Push Prevented)

### 🔴 CRITICAL - Immediate Block

#### 1. **Exposed Credentials**
```javascript
❌ API keys, access tokens, secret keys
❌ Database connection strings (MongoDB, PostgreSQL, MySQL)
❌ AWS credentials (AKIA...)
❌ Firebase service account keys
❌ JWT secrets shorter than 20 characters
❌ Private keys in code files (.pem, .key)
❌ Bearer tokens, OAuth tokens
❌ Slack webhooks, GitHub tokens
```

#### 2. **Security Vulnerabilities**
```javascript
❌ XSS patterns (innerHTML, dangerouslySetInnerHTML, eval)
❌ Command injection (exec/spawn with user input)
❌ SQL injection (string concatenation in queries)
❌ Weak password requirements (< 6 characters)
❌ Insecure CORS (origin: "*")
❌ Math.random() for security operations
❌ Insecure deserialization (unsafe JSON.parse)
```

#### 3. **High/Critical CVEs**
```
❌ Dependencies with HIGH or CRITICAL severity vulnerabilities
❌ Known malicious packages (typosquatting)
❌ Unpatched security issues
❌ Exploitable vulnerabilities
```

#### 4. **File Upload Vulnerabilities**
```javascript
❌ Missing file type validation
❌ No file size limits
❌ Unrestricted MIME types
❌ No malware scanning
```

#### 5. **Committed Secret Files**
```
❌ .env, .env.local, .env.production
❌ firebase-service-account.json
❌ credentials.json, secrets.json
❌ Private keys (.pem, .key)
❌ serviceAccountKey.json
```

### ⚠️ WARNING - Detected but Allowed (with alerts)
```
⚠️ Console.log statements
⚠️ TODO/FIXME in security-critical code
⚠️ Path traversal patterns
⚠️ Potential SSRF vulnerabilities
⚠️ Debug statements (debugger;)
⚠️ Missing rate limiting
⚠️ Insecure session configuration
```

---

## ✅ What's ALLOWED

### Markdown Documentation (.md files)
All `.md` files are **excluded** from secrets scanning, enabling safe documentation:

✅ Example API keys in documentation  
✅ Sample credentials in setup guides  
✅ Tutorial code with dummy secrets  
✅ Configuration examples

**Examples:**
```markdown
<!-- ✅ SAFE in .md files -->
API_KEY="sk-example-1234567890abcdef"
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net"
FIREBASE_KEY="dummy-firebase-key-for-documentation"
password="example-password-123"
```

---

## 📋 Security Pipeline Job Order

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 🔒 secrets-scan (CRITICAL - BLOCKS ALL)                  │
│    ├─ TruffleHog (verified secrets)                         │
│    ├─ GitLeaks (pattern-based)                              │
│    ├─ Custom Patterns (regex)                               │
│    ├─ Firebase Detection                                    │
│    └─ .env Check                                            │
│    ❌ FAIL = ENTIRE PIPELINE STOPS                          │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐
│ 2. 🛡️ security│  │ 3. 🔬 code   │  │ 4. 🔐 depend │  │ 5. 🔑 auth   │
│ assessment   │  │ security     │  │ security     │  │ security     │
│ (Snyk,OWASP) │  │ (CodeQL,XSS) │  │ (npm audit)  │  │ (JWT,CORS)   │
└──────────────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                         │                 │                 │
                  ┌──────▼──────┐         │                 │
                  │ 6. 📊 code  │         │                 │
                  │ quality     │         │                 │
                  │ (ESLint)    │         │                 │
                  └──────┬──────┘         │                 │
                         │                 │                 │
                  ┌──────▼──────┐  ┌──────▼─────────┐       │
                  │ 8. 🎨 frontend│  │ 7. 🔒 backend  │       │
                  │ build       │  │ test           │       │
                  └──────┬──────┘  └──────┬─────────┘       │
                         │                 │                 │
                         └────────┬────────┴─────────────────┘
                                  │
                         ┌────────▼────────┐
                         │ 9. 🔗 integration│
                         │ test            │
                         └────────┬────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
       ┌────────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐
       │ 10. 🐳 docker   │ │ 11. 🚦     │ │ (All security   │
       │ build & scan    │ │ security   │ │ jobs must pass) │
       └─────────────────┘ │ gate       │ └─────────────────┘
                           └─────┬──────┘
                                 │
                        ┌────────▼────────┐
                        │ 12. 🚀 deploy   │
                        │ production      │
                        │ (main only)     │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ 13. 🔍 post     │
                        │ deploy check    │
                        │ (OWASP ZAP)     │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ 14. 📢 notify   │
                        │ & security alert│
                        └─────────────────┘
```

**Key Enforcement Rules:**
- ❌ If **secrets-scan** fails → Entire pipeline STOPS  
- ❌ If **code-security-analysis** fails → No deployment  
- ❌ If **dependency-security** fails → Push BLOCKED  
- ❌ If **auth-security** fails → Cannot proceed  
- ⚠️ Warnings logged but don't block  
- ✅ All 11 security gates must pass before deployment

---

## 🔧 Tools & Technologies

### Security Scanners
| Tool | Version | Purpose | Time |
|------|---------|---------|------|
| **TruffleHog** | v3.63.2 | High entropy secret detection | ~30s |
| **GitLeaks** | v8.18.1 | Pattern-based credential scanning | ~30s |
| **Snyk** | Latest | Real-time vulnerability database | ~1-2m |
| **OWASP Check** | Latest | Known CVE scanning | ~1-2m |
| **Trivy** | Latest | Container vulnerability scanner | ~1-2m |
| **CodeQL** | Latest | Semantic code analysis | ~2-3m |
| **OWASP ZAP** | Latest | Web app security testing | ~2-3m |

### Custom Security Scripts
```bash
# SQL Injection Detection
grep -rniE 'SELECT.*FROM.*WHERE.*\$\{' --include="*.js"

# XSS Detection  
grep -rniE 'dangerouslySetInnerHTML|innerHTML\s*=' --include="*.jsx"

# Command Injection
grep -rniE 'exec\s*\(.*\$\{|spawn\s*\(.*\$\{' --include="*.js"

# Weak Password
grep -rniE 'password.*length.*[<].*6' --include="*.js"

# Insecure CORS
grep -rniE 'cors.*origin:\s*[\"\x27]\*[\"\x27]' --include="*.js"

# Insecure Random
grep -rniE 'Math\.random\(\).*password|token|secret|key' --include="*.js"
```

---

## 📝 Security Job Details

### Job 1: 🔒 secrets-scan (CRITICAL)
**Prevents:** Credential leaks, API exposure  
**Blocks:** Any hardcoded secrets in code  
**Excludes:** .md files, examples, dummy values  
**Time:** ~30 seconds  
**Exit on Fail:** Yes - STOPS ENTIRE PIPELINE

### Job 2: 🛡️ security-assessment
**Prevents:** Known vulnerabilities, CVEs  
**Detects:** CRITICAL and HIGH severity issues  
**Uploads:** Results to GitHub Security tab  
**Tools:** Snyk, OWASP Dependency Check, Trivy  
**Time:** ~1-2 minutes

### Job 3: 🔬 code-security-analysis
**Prevents:** Injection attacks, insecure patterns  
**Checks:**
- ✅ SQL Injection (string concatenation in queries)
- ✅ XSS vulnerabilities (unsafe DOM manipulation)
- ✅ Command Injection (exec with user input)
- ✅ Path Traversal (.. in file paths)
- ✅ Insecure Random (Math.random for security)
- ✅ Deserialization (unsafe JSON.parse)
- ✅ ReDoS (complex regex patterns)
- ✅ SSRF (unvalidated external requests)

**Time:** ~2-3 minutes  
**Exit on Fail:** Yes - BLOCKS DEPLOYMENT

### Job 4: 🔐 dependency-security
**Prevents:** Supply chain attacks, malicious packages  
**Checks:**
- ✅ Known malicious packages (typosquatting)
- ✅ Package signature integrity
- ✅ npm audit HIGH/CRITICAL CVEs
- ✅ License compliance

**Blocks:** Any HIGH severity vulnerability  
**Time:** ~1 minute  
**Exit on Fail:** Yes - PUSH BLOCKED

### Job 5: 🔑 auth-security
**Prevents:** Authentication bypass, weak security  
**Checks:**
- ✅ Weak password requirements (< 6 chars)
- ✅ Missing authentication middleware
- ✅ Weak JWT secrets (< 20 chars)
- ✅ Insecure session configuration
- ✅ CORS misconfigurations (origin: "*")
- ✅ Missing rate limiting

**Blocks:** Critical auth flaws  
**Time:** ~30 seconds  
**Exit on Fail:** Yes - CANNOT PROCEED

### Job 6: 📊 code-quality
**Prevents:** Code quality issues  
**Checks:**
- ✅ ESLint security rules
- ✅ Console.log in production
- ✅ Debug statements
- ✅ Unresolved security TODOs

**Time:** ~1 minute

### Job 7: 🔒 backend-test
**Prevents:** Backend vulnerabilities  
**Checks:**
- ✅ Input validation libraries
- ✅ Parameterized query usage
- ✅ Security header middleware (helmet)
- ✅ File upload validation
- ✅ Environment variable usage

**Blocks:** String concatenation in SQL, missing file filters  
**Time:** ~1 minute

### Job 8: 🎨 frontend-build
**Prevents:** Build failures, broken deployments  
**Verifies:** Build succeeds and artifacts exist  
**Time:** ~2-3 minutes

### Job 9: 🔗 integration-test
**Prevents:** Integration issues, breaking changes  
**Checks:**
- ✅ API endpoint consistency
- ✅ TypeScript compilation
- ✅ Circular dependencies

**Time:** ~1 minute

### Job 10: 🐳 docker-build
**Prevents:** Container vulnerabilities  
**Scans:** Docker images for CRITICAL/HIGH CVEs  
**Tool:** Trivy  
**Time:** ~2-4 minutes

### Job 11: 🚦 security-gate
**Prevents:** Deployment of vulnerable code  
**Verifies:** All security jobs passed  
**Generates:** Security report summary  
**Time:** ~10 seconds  
**Required:** YES - Must pass before deployment

### Job 12: 🚀 deploy-production
**Action:** Deploys to production  
**Condition:** Only on main branch + all security passed  
**Time:** Varies by platform

### Job 13: 🔍 post-deploy-check
**Prevents:** Production security issues  
**Checks:**
- ✅ Security headers in production
- ✅ SSL/TLS certificate validity
- ✅ OWASP ZAP live scan
- ✅ No secrets exposed in build

**Time:** ~2-3 minutes

### Job 14: 📢 notify
**Action:** Sends deployment status and security alerts  
**Always:** Runs regardless of success/failure  
**Includes:** Security summary, failed checks, warnings  
**Time:** ~10 seconds

---

## 🚀 Setup Instructions

### 1. Local Development Setup

#### Install Pre-commit Hooks (Recommended)
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Test all hooks
pre-commit run --all-files
```

#### Configure Git
```bash
# Use .gitignore
git config core.excludesFile .gitignore

# Enable automatic line ending conversion
git config core.autocrlf true
```

### 2. CI/CD Pipeline Setup

#### GitHub Secrets (Optional for Enhanced Scanning)
```
Settings → Secrets and variables → Actions → New repository secret

SNYK_TOKEN          - From https://app.snyk.io/account
GITLEAKS_LICENSE    - GitLeaks commercial features (optional)
```

#### Enable GitHub Security Features
```
Settings → Security → Code security and analysis

✅ Dependency graph
✅ Dependabot alerts
✅ Dependabot security updates
✅ Code scanning (CodeQL)
✅ Secret scanning
✅ Push protection (recommended)
```

#### Configure Branch Protection
```
Settings → Branches → Add rule for 'main'

✅ Require a pull request before merging
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Status checks that are required:
     - secrets-scan
     - security-assessment
     - code-security-analysis
     - dependency-security
     - auth-security
     - code-quality
✅ Require linear history
✅ Include administrators
✅ Restrict who can push to matching branches
```

---

## ⚠️ Common Security Mistakes & Solutions

### ❌ DON'T Do This (Code Files)

```javascript
// ❌ BLOCKED - Hardcoded credentials
const API_KEY = "sk-1234567890abcdef";
const dbUri = "mongodb+srv://user:pass@cluster.mongodb.net";
const password = "mySecretPassword123";

// ❌ BLOCKED - SQL Injection
db.query(`SELECT * FROM users WHERE id = ${userId}`);
const query = "SELECT * FROM users WHERE email = '" + userEmail + "'";

// ❌ BLOCKED - XSS Vulnerability
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ BLOCKED - Command Injection
exec(`ls ${userInput}`);
spawn('git', ['clone', userRepo]);

// ❌ BLOCKED - Weak Password
if (password.length < 6) return false;

// ❌ BLOCKED - Insecure CORS
app.use(cors({ origin: "*" }));

// ❌ BLOCKED - Insecure Random for Security
const token = Math.random().toString(36).substring(7);
const sessionId = Math.floor(Math.random() * 1000000);

// ❌ BLOCKED - File Upload Without Validation
app.post('/upload', upload.single('file'), (req, res) => {
  // No fileFilter, no limits - VULNERABLE
});

// ❌ BLOCKED - Unsafe Deserialization
const userData = JSON.parse(req.body.data);
const obj = eval('(' + userInput + ')');
```

### ✅ DO This Instead

```javascript
// ✅ SAFE - Use environment variables
const API_KEY = process.env.API_KEY;
const dbUri = process.env.MONGODB_URI;

// ✅ SAFE - Parameterized queries
db.query('SELECT * FROM users WHERE id = ?', [userId]);
// Or with Firestore
db.collection('users').doc(userId).get();

// ✅ SAFE - Use textContent or sanitize
element.textContent = userInput;
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ SAFE - Avoid command execution or use allowlist
const allowedCommands = ['ls', 'pwd', 'date'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}

// ✅ SAFE - Strong password requirements
if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
  return false;
}

// ✅ SAFE - Restricted CORS
app.use(cors({ 
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ SAFE - Cryptographically secure random
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
const sessionId = crypto.randomUUID();

// ✅ SAFE - File upload with validation
const upload = multer({
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }
    
    cb(null, true);
  }
});

// ✅ SAFE - Safe deserialization with validation
const Joi = require('joi');
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});
const { error, value } = schema.validate(JSON.parse(req.body.data));
if (error) throw new Error('Invalid data');
```

### ✅ SAFE in .md Documentation

```markdown
<!-- ✅ These are ALLOWED in .md files -->
```bash
# Example configuration
API_KEY="sk-example-1234567890abcdef"
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/db"
JWT_SECRET="your-super-secret-key-here"
```

<!-- ✅ Tutorial examples -->
```javascript
// Example for documentation only - NOT for production
const apiKey = "dummy-api-key-for-tutorial";
const password = "example-password-123";
```
```

---

## 🧪 Testing Security Features

### Test 1: Secrets Detection (Should FAIL)
```bash
echo 'const API_KEY = "sk-1234567890abcdef";' >> test.js
git add test.js
git commit -m "Test commit"
# ❌ Should FAIL with "Potential credentials found"
```

### Test 2: SQL Injection Detection (Should FAIL)
```bash
echo 'db.query(`SELECT * FROM users WHERE id = ${userId}`);' >> controller.js
git add controller.js
git commit -m "Add query"
# ❌ Should FAIL in CI/CD with "SQL injection vulnerability"
```

### Test 3: XSS Detection (Should FAIL)
```bash
echo 'element.innerHTML = userInput;' >> component.jsx
git add component.jsx
git commit -m "Add HTML"
# ❌ Should FAIL with "XSS vulnerability detected"
```

### Test 4: Vulnerable Dependency (Should FAIL)
```bash
npm install lodash@4.17.15  # Known vulnerability
git add package.json package-lock.json
git commit -m "Update deps"
# ❌ Should FAIL with "High severity vulnerabilities"
```

### Test 5: Documentation (Should SUCCEED)
```bash
echo '## Example\n```\nAPI_KEY="sk-example-key"\n```' >> README.md
git add README.md
git commit -m "Update docs"
# ✅ Should SUCCEED - .md files excluded
```

### Test 6: Command Injection (Should FAIL)
```bash
echo 'exec(`rm -rf ${userInput}`);' >> utils.js
git add utils.js
git commit -m "Add utility"
# ❌ Should FAIL with "Command injection vulnerability"
```

### Test 7: Weak Password (Should FAIL)
```bash
echo 'if (password.length < 5) return true;' >> auth.js
git add auth.js
git commit -m "Update auth"
# ❌ Should FAIL with "Weak password requirements"
```

---

## 🔍 Troubleshooting

### Problem: Pre-commit hooks not running
**Symptom:** Commits going through without checks  
**Solution:**
```bash
pre-commit uninstall
pre-commit install
pre-commit run --all-files
# Verify hooks are installed
ls .git/hooks/ | grep pre-commit
```

### Problem: False positive in secrets scan
**Symptom:** Legitimate code flagged as secret  

**Solution 1:** Exclude pattern in `.gitleaks.toml`
```toml
[allowlist]
regexes = [
  '''dummy-key-\d+''',
  '''example\.com''',
  '''placeholder-[a-z]+''',
]
paths = [
  '''.*_test\.js$''',
  '''.*\.test\.jsx$''',
]
```

**Solution 2:** Use .md files for documentation examples

### Problem: Cannot push due to old commits with secrets
**Symptom:** Git history contains exposed secrets  
**Solution:**
```bash
# Option 1: BFG Repo Cleaner (Recommended)
git clone --mirror git@github.com:username/repo.git
java -jar bfg.jar --delete-files credentials.json repo.git
cd repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push

# Option 2: Git Filter-Branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret.json" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all

# IMPORTANT: Rotate all exposed credentials immediately!
```

### Problem: CI/CD failing on AUTH security job
**Symptom:** auth-security job showing errors  
**Solution:**
```bash
# Check authentication middleware exists
grep -rn "requireAuth\|authenticateToken\|verifyToken" backend/middleware/

# Verify routes are protected
grep -rn "router\." backend/routes/ | grep -v "requireAuth"

# Check JWT secret length
grep -rn "jwt.sign" backend/ --include="*.js" -A 2
```

### Problem: CodeQL taking too long
**Symptom:** CodeQL analysis runs for > 5 minutes  
**Solution:** This is normal for comprehensive analysis. CodeQL performs deep semantic analysis and may take 2-5 minutes depending on codebase size. Can be optimized by:
```yaml
# .github/workflows/ci-cd.yml
- uses: github/codeql-action/init@v3
  with:
    languages: javascript
    queries: security-only  # Focus on security
```

### Problem: Snyk token not working
**Symptom:** security-assessment job fails with auth error  
**Solution:**
```bash
# 1. Get token from https://app.snyk.io/account
# 2. Add to GitHub Secrets:
#    Settings → Secrets and variables → Actions
#    Name: SNYK_TOKEN
#    Value: [your-token]
# 3. Verify secret name matches workflow
grep SNYK_TOKEN .github/workflows/ci-cd.yml
```

### Problem: Build failing on environment variables
**Symptom:** Frontend build fails with "undefined" errors  
**Solution:**
```bash
# Check .env.example exists
ls -la .env.example

# Verify all required env vars are listed
cat .env.example

# In CI/CD, ensure dummy values provided
# .github/workflows/ci-cd.yml should have:
# env:
#   VITE_API_BASE: "http://localhost:5000"
#   VITE_FIREBASE_API_KEY: "dummy-key"
```

### Problem: Docker build failing with vulnerabilities
**Symptom:** docker-build job fails on Trivy scan  
**Solution:**
```bash
# Run Trivy locally first
docker run --rm -v $(pwd):/app aquasec/trivy fs /app

# Update base image to latest
# Dockerfile
FROM node:20-alpine  # Use latest LTS

# Minimize attack surface
RUN npm ci --only=production
```

---

## 📊 Security Metrics Dashboard

### View Security Status
```
GitHub Repository → Insights → Security

Dashboard shows:
🔴 Critical vulnerabilities (0 target)
🟠 High severity issues (0 target)
🟡 Medium severity issues (<5 target)
🟢 Resolved vulnerabilities
📈 Security trends over time
```

### Monitor Pipeline Status
```
GitHub Repository → Actions → CI/CD Pipeline

Track:
✅ Secrets scan pass rate (100% target)
✅ Security gate pass rate (100% target)
⚠️ Warning trends
📉 Vulnerability reduction
```

### GitHub Security Features
```
Settings → Security → Code security and analysis

Enable:
✅ Dependency graph
✅ Dependabot alerts (email notifications)
✅ Dependabot security updates (auto-PR)
✅ Code scanning (weekly schedule)
✅ Secret scanning (push protection)
```

---

## 🎯 Security Best Practices

### For Developers
1. ✅ **Always** use environment variables for secrets  
2. ✅ **Always** use parameterized queries or ORMs  
3. ✅ **Always** validate and sanitize user input  
4. ✅ **Always** use HTTPS in production  
5. ✅ **Never** commit .env files  
6. ✅ **Never** use `eval()` or `exec()` with user input  
7. ✅ **Never** trust client-side data  
8. ✅ **Review** security warnings in PR checks  
9. ✅ **Update** dependencies regularly (monthly)  
10. ✅ **Test** security features locally before pushing

### For Administrators
1. ✅ Enable branch protection rules  
2. ✅ Require security checks before merge  
3. ✅ Review Security tab weekly  
4. ✅ Rotate secrets quarterly  
5. ✅ Monitor failed pipeline runs daily  
6. ✅ Review Dependabot PRs within 48 hours  
7. ✅ Set up security alerts for email  
8. ✅ Conduct security audits quarterly  
9. ✅ Keep GitHub Actions updated  
10. ✅ Document security incidents

### Secure Development Workflow
```
1. Create feature branch
2. Run pre-commit hooks locally
3. Test security features
4. Push to GitHub
5. Wait for CI/CD security gates
6. Review security warnings
7. Fix any issues
8. Get approval
9. Merge to main (triggers deployment)
10. Monitor post-deploy checks
```

---

## 🆘 Emergency Response

### If a Secret is Exposed

#### Immediate Actions (within 1 hour)
1. **REVOKE** the exposed credential immediately
   - Firebase: Console → Project Settings → Service accounts → Generate new key
   - Database: Change password, rotate connection strings
   - API Keys: Regenerate/revoke in provider dashboard
   - GitHub: Revoke personal access tokens

2. **ASSESS** the damage
   ```bash
   # Check when secret was exposed
   git log --all --full-history -- path/to/secret.json
   
   # Check if secret was pushed to remote
   git log origin/main --oneline | grep "commit message"
   ```

3. **REMOVE** from Git history
   ```bash
   # Using BFG (recommended)
   git clone --mirror git@github.com:user/repo.git
   java -jar bfg.jar --delete-files secret.json repo.git
   cd repo.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

4. **AUDIT** access logs
   - Check database access logs
   - Review API usage logs
   - Monitor for unauthorized access

5. **NOTIFY** team and stakeholders
   ```
   Subject: [SECURITY] Credential Exposure Incident
   
   - What: [Describe exposed credential]
   - When: [Time of exposure]
   - Impact: [Affected systems]
   - Actions: [Revoked, rotated]
   - Status: [Resolved/Ongoing]
   ```

#### Follow-up Actions (within 24 hours)
- Update all documentation
- Review security procedures
- Add to security incident log
- Update `.gitleaks.toml` to catch similar patterns

### If a Vulnerability is Found

#### Severity Assessment
```
CRITICAL: Exploit available, active attacks, data breach risk
  → Fix within 24 hours

HIGH: Exploit likely, potential data access
  → Fix within 7 days

MEDIUM: Exploit possible with complexity
  → Fix within 30 days

LOW: Minimal risk, defense in depth
  → Fix in next sprint
```

#### Response Plan
1. **ASSESS** severity (CRITICAL/HIGH/MEDIUM/LOW)
2. **CHECK** for exploits in the wild
   - Search: CVE number, package name + exploit
   - Check: Exploit-DB, GitHub Security Advisories
3. **UPDATE** dependency immediately if CRITICAL
   ```bash
   npm audit fix --force
   # Or manually
   npm install package@latest
   ```
4. **TEST** thoroughly after update
   ```bash
   npm test
   npm run build
   # Manual testing
   ```
5. **DEPLOY** fix as soon as possible
6. **DOCUMENT** in security changelog

---

## 📚 Additional Resources

### Security Guides
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Most critical web app risks
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) - Security best practices
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/) - Security testing

### Platform-Specific
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### Security Tools
- [TruffleHog Documentation](https://github.com/trufflesecurity/trufflehog)
- [GitLeaks Documentation](https://github.com/gitleaks/gitleaks)
- [Snyk Documentation](https://docs.snyk.io/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)

### Learning Resources
- [Web Security Academy](https://portswigger.net/web-security) - Free security training
- [JWT.io - Best Practices](https://jwt.io/introduction)
- [Secure Code Warrior](https://www.securecodewarrior.com/) - Security training
- [HackerOne](https://www.hackerone.com/resources) - Bug bounty platform

---

## 📞 Security Contact

For security issues or vulnerability reports:

- 📧 **Email:** [Your Security Email]
- 🔒 **GitHub Security Advisories:** Preferred for vulnerabilities
- 📝 **Private Issue:** Create a private security issue
- ⚠️ **Emergency:** [Emergency contact]

**Response Time:**
- CRITICAL: Within 24 hours
- HIGH: Within 3 days
- MEDIUM/LOW: Within 1 week

---

**Last Updated:** November 29, 2025  
**Security Level:** 🔒 Enterprise-Grade  
**Pipeline Status:** ✅ 14 Security Gates Active  
**Architecture:** Security-First Design  
**Maintained By:** Security Team

---

*Remember: Security is everyone's responsibility! 🛡️*

*If you discover a security vulnerability, please report it immediately following responsible disclosure practices.*
