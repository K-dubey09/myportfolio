# 🚀 Quick Reference - CI/CD Security Pipeline

## 📌 TL;DR

**Staging Branch:**  
✅ Only credentials check → Fast deployment

**All Other Pushes (main, develop, PRs):**  
✅ Full security scan → Blocks XSS, SQL injection, auth bypass, etc.

---

## 🔀 Branch Workflows

### **Staging Branch** (`staging`)
```bash
git push origin staging
    ↓
🔒 Credentials Check ONLY
    ↓
🧪 Deploy to Staging
```

**Checks:**
- ❌ Hardcoded API keys
- ❌ Database passwords
- ❌ Private keys
- ✅ Everything else bypassed

**Use Case:** Quick testing without full security scan

---

### **Main Branch** (`main`)
```bash
git push origin main
    ↓
🔒 Full Security Scan (11 gates)
    ↓
✅ All Pass → 🚀 Deploy to Production
❌ Any Fail → 🚫 BLOCKED
```

**Checks:**
- Secrets
- XSS vulnerabilities
- SQL injection
- Command injection
- Auth bypass
- Dependency CVEs
- Code quality
- Build verification
- Integration tests

**Use Case:** Production deployment with full protection

---

### **Develop/Feature Branches**
```bash
git push origin develop
    ↓
🔒 Full Security Scan
    ↓
✅ All Pass → ✅ Ready to merge
❌ Any Fail → 🚫 BLOCKED
```

**No deployment**, just validation

---

## ❌ What Gets BLOCKED on Push

### **High Priority (Blocks ALL Pushes)**

```javascript
// ❌ XSS
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: data }} />

// ❌ SQL Injection
db.query(`SELECT * FROM users WHERE id = ${id}`);

// ❌ Command Injection
exec(`git clone ${repo}`);

// ❌ Weak Password
if (password.length < 6) return false;

// ❌ Insecure CORS
app.use(cors({ origin: "*" }));

// ❌ Insecure Random
const token = Math.random().toString(36);

// ❌ Hardcoded Credentials
const API_KEY = "sk-1234567890";
```

---

## ✅ Safe Alternatives

```javascript
// ✅ XSS Prevention
element.textContent = userInput;
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(data);

// ✅ SQL Injection Prevention
db.query('SELECT * FROM users WHERE id = ?', [id]);
db.collection('users').doc(id).get(); // Firestore

// ✅ Command Injection Prevention
const allowed = ['ls', 'pwd'];
if (!allowed.includes(cmd)) throw new Error('Invalid');

// ✅ Strong Password
if (password.length < 12 || !/[A-Z]/.test(password)) return false;

// ✅ Secure CORS
app.use(cors({ origin: ['https://yourdomain.com'] }));

// ✅ Secure Random
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');

// ✅ Environment Variables
const API_KEY = process.env.API_KEY;
```

---

## 🔧 Quick Commands

### **Test Locally Before Push**

```bash
# Check for credentials
git grep -i "password\|api_key\|secret" --exclude-dir=node_modules

# Check for XSS
git grep "innerHTML\s*=" -- "*.jsx" "*.js"

# Check for SQL injection
git grep "query.*\`" -- backend/

# Check dependencies
npm audit

# Run tests
npm test
```

### **Fix Blocked Push**

```bash
# 1. See what failed
# Check GitHub Actions tab for details

# 2. Fix locally
# Remove hardcoded credentials
# Fix XSS/SQL injection
# Update dependencies

# 3. Test again
npm test
npm audit

# 4. Push again
git add .
git commit -m "fix: address security issues"
git push
```

---

## 📋 Environment Setup

### **Required Files**

```
.env.example          # Template with dummy values
.gitignore            # Ignore .env files
.gitleaks.toml        # GitLeaks config (excludes .md files)
.pre-commit-config.yaml # Local pre-commit hooks
```

### **Environment Variables (Never Hardcode)**

```bash
# ✅ In .env (never commit)
VITE_API_BASE=https://api.yourdomain.com
VITE_FIREBASE_API_KEY=your-key-here
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here

# ✅ In .env.example (commit this)
VITE_API_BASE=https://api.example.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-jwt-secret-at-least-32-chars
```

---

## 🔍 Pipeline Status

### **Check Status**
- Go to: `GitHub → Actions tab`
- See: Real-time pipeline execution
- Review: Failed job details

### **Failed Job?**
1. Click on failed job
2. Read error message
3. Fix issue locally
4. Test locally
5. Push again

---

## 🆘 Common Issues

### **"Credentials detected"**
**Fix:** Remove hardcoded values, use `process.env.*`

### **"XSS vulnerability detected"**
**Fix:** Use `textContent` or `DOMPurify.sanitize()`

### **"SQL injection detected"**
**Fix:** Use parameterized queries or Firestore

### **"HIGH severity vulnerability"**
**Fix:** Run `npm audit fix` or update specific package

### **"Weak password requirements"**
**Fix:** Increase minimum length to 12+ characters

### **"Insecure CORS configuration"**
**Fix:** Restrict to specific domains, remove `"*"`

---

## 📊 Pipeline Jobs

### **For Staging Branch:**
```
1. 🔒 Secrets Scan → Deploy
```

### **For Main/Develop:**
```
1. 🔒 Secrets Scan
2. 🛡️ Vulnerability Assessment
3. 🔬 Code Security Analysis
4. 🔐 Dependency Security
5. 🔑 Auth Security
6. 📊 Code Quality
7. 🔒 Backend Tests
8. 🎨 Frontend Build
9. 🔗 Integration Tests
10. 🐳 Docker Build
11. 🚦 Security Gate
    ↓
12. 🚀 Deploy (main only)
13. 🔍 Post-Deploy Check
14. 📢 Notify
```

---

## 💡 Pro Tips

1. **Test locally first** - Don't rely on CI/CD to catch issues
2. **Use .md files for examples** - Credentials in docs are excluded from scanning
3. **Run `npm audit` regularly** - Weekly is good practice
4. **Use pre-commit hooks** - Catch issues before pushing
5. **Review security warnings** - Don't ignore them
6. **Keep dependencies updated** - Monthly updates recommended
7. **Use staging for experiments** - Fast iteration without full scan

---

## 🔗 Quick Links

- **Actions Tab:** `github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Security Tab:** `github.com/YOUR_USERNAME/YOUR_REPO/security`
- **SECURITY.md:** Full security documentation
- **CI-CD-SECURITY-SETUP.md:** Detailed setup guide

---

**Need Help?** Check `SECURITY.md` or `CI-CD-SECURITY-SETUP.md` for detailed guides.

**Last Updated:** November 29, 2025
