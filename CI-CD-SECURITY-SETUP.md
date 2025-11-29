# 🔒 CI/CD Security Setup - Complete Guide

## 📋 Overview

Your CI/CD pipeline now implements **security-first architecture** with vulnerability prevention on every push.

## 🎯 What's Configured

### **Credentials Checking:**
- ✅ **Staging Branch**: Only credentials are checked before deployment
- ✅ **All Pushes & PRs**: Full vulnerability scanning (XSS, SQL injection, auth bypass, etc.)

### **Branch Strategy:**
```
main branch     → Full security scan → Production deployment
staging branch  → Credentials check only → Staging deployment
develop branch  → Full security scan → No deployment
Pull Requests   → Full security scan → No deployment
```

---

## 🔐 Security Checks on EVERY Push

### **1. Secrets Scan** (BLOCKS IMMEDIATELY)
**Runs on:** All pushes & pull requests  
**Tools:** TruffleHog + GitLeaks + Custom patterns  
**Blocks:**
- ❌ Hardcoded API keys
- ❌ Database passwords
- ❌ Private keys
- ❌ Access tokens
- ❌ Firebase service accounts

### **2. Code Security Analysis** (BLOCKS VULNERABLE CODE)
**Runs on:** All pushes & pull requests  
**Tools:** CodeQL + Custom regex patterns  
**Blocks:**
- ❌ **XSS vulnerabilities** (innerHTML, dangerouslySetInnerHTML, eval)
- ❌ **SQL Injection** (string concatenation in queries)
- ❌ **Command Injection** (exec/spawn with user input)
- ❌ **Path Traversal** (.. in file paths)
- ❌ **Insecure Random** (Math.random for security)
- ❌ **ReDoS** (complex regex patterns)
- ❌ **SSRF** (unvalidated external requests)

**Example Patterns Detected:**
```javascript
// ❌ BLOCKED - XSS
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ BLOCKED - SQL Injection
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ❌ BLOCKED - Command Injection
exec(`ls ${userInput}`);
```

### **3. Auth Security** (BLOCKS AUTH BYPASS)
**Runs on:** All pushes & pull requests  
**Blocks:**
- ❌ Weak passwords (< 6 characters)
- ❌ Weak JWT secrets (< 20 chars)
- ❌ Insecure CORS (origin: "*")
- ❌ Missing authentication middleware
- ❌ Insecure session configuration

**Example Patterns Detected:**
```javascript
// ❌ BLOCKED - Weak password
if (password.length < 6) return true;

// ❌ BLOCKED - Insecure CORS
app.use(cors({ origin: "*" }));

// ❌ BLOCKED - Weak JWT
jwt.sign(payload, "short", { expiresIn: '1h' });
```

### **4. Security Assessment** (PUSH ONLY)
**Runs on:** Push events only  
**Tools:** Snyk + OWASP + Trivy  
**Detects:** Known CVEs in dependencies

### **5. Dependency Security** (PUSH ONLY)
**Runs on:** Push events only  
**Blocks:**
- ❌ HIGH/CRITICAL npm vulnerabilities
- ❌ Known malicious packages
- ❌ Typosquatting attacks

---

## 🧪 Staging Environment Setup

### **Staging Deployment:**
```yaml
Branch: staging
Trigger: Push to staging branch
Security: Credentials check ONLY
Result: Fast deployment for testing
```

### **What Staging Checks:**
✅ No hardcoded credentials  
✅ No exposed API keys  
✅ No database passwords  
✅ Environment variables used properly

### **To Deploy to Staging:**
```bash
# Create staging branch if not exists
git checkout -b staging

# Make your changes
git add .
git commit -m "feat: your changes"

# Push to staging
git push origin staging
```

**Pipeline Flow:**
```
Push to staging
    ↓
Secrets Scan (credentials check)
    ↓
✅ Pass → Deploy to Staging
❌ Fail → BLOCKED (fix credentials)
```

---

## 🚀 Production Deployment

### **Production Deployment:**
```yaml
Branch: main
Trigger: Push to main branch
Security: FULL security scan (all 11 gates)
Result: Production deployment after all checks pass
```

### **Security Gates Before Production:**
1. ✅ Secrets scan
2. ✅ Security assessment
3. ✅ Code security analysis
4. ✅ Dependency security
5. ✅ Auth security
6. ✅ Code quality
7. ✅ Backend tests
8. ✅ Frontend build
9. ✅ Integration tests
10. ✅ Docker build
11. ✅ Security gate (final check)

**Pipeline Flow:**
```
Push to main
    ↓
All 11 Security Gates
    ↓
✅ All Pass → Deploy to Production
❌ Any Fail → BLOCKED (fix issues)
    ↓
Post-Deploy Security Check
    ↓
Notification
```

---

## 🛡️ What Gets Blocked on Push

### **Immediate Blocking (Cannot Push):**
```
🔴 Hardcoded credentials
🔴 XSS vulnerabilities (innerHTML with user input)
🔴 SQL injection patterns (string concatenation)
🔴 Command injection (exec with user input)
🔴 Weak passwords (< 6 chars)
🔴 Insecure CORS (origin: "*")
🔴 Math.random() for security
🔴 Missing file upload validation
🔴 HIGH/CRITICAL CVEs in dependencies
```

### **Example Blocked Code:**
```javascript
// ❌ XSS - BLOCKED
document.getElementById('output').innerHTML = userComment;

// ❌ SQL Injection - BLOCKED
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ❌ Command Injection - BLOCKED
exec(`git clone ${userRepo}`);

// ❌ Weak Password - BLOCKED
if (password.length < 5) return false;

// ❌ Insecure CORS - BLOCKED
app.use(cors({ origin: "*" }));

// ❌ Insecure Random - BLOCKED
const sessionToken = Math.random().toString(36);
```

---

## ✅ Safe Code Examples

### **XSS Prevention:**
```javascript
// ✅ SAFE - Use textContent
element.textContent = userInput;

// ✅ SAFE - Sanitize HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userHTML);
element.innerHTML = clean;
```

### **SQL Injection Prevention:**
```javascript
// ✅ SAFE - Parameterized query
db.query('SELECT * FROM users WHERE email = ?', [email]);

// ✅ SAFE - Firestore
db.collection('users').doc(userId).get();
```

### **Command Injection Prevention:**
```javascript
// ✅ SAFE - Allowlist approach
const allowedCommands = ['ls', 'pwd', 'date'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}
```

### **Strong Password:**
```javascript
// ✅ SAFE - Strong requirements
if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
  return false;
}
```

### **Secure CORS:**
```javascript
// ✅ SAFE - Restricted origins
app.use(cors({ 
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true 
}));
```

### **Secure Random:**
```javascript
// ✅ SAFE - Cryptographically secure
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
```

---

## 🔧 Testing Your Code Locally

### **Before Pushing:**

1. **Check for credentials:**
```bash
# Run GitLeaks locally
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path -v
```

2. **Check for XSS:**
```bash
grep -rn "innerHTML\s*=" --include="*.jsx" --include="*.js"
grep -rn "dangerouslySetInnerHTML" --include="*.jsx"
```

3. **Check for SQL injection:**
```bash
grep -rn "query.*\`" --include="*.js" backend/
grep -rn "SELECT.*\${" --include="*.js" backend/
```

4. **Check for command injection:**
```bash
grep -rn "exec\s*\(" --include="*.js" backend/
grep -rn "spawn\s*\(" --include="*.js" backend/
```

5. **Check dependencies:**
```bash
npm audit
```

---

## 📊 Workflow Summary

### **On Every Push/PR:**
```
✅ Secrets scan (blocks credentials)
✅ Code security analysis (blocks XSS, SQL injection, etc.)
✅ Auth security (blocks auth bypass)
❌ If any fail → Push is BLOCKED
```

### **On Push to Staging:**
```
✅ Credentials check only
✅ Fast deployment
```

### **On Push to Main:**
```
✅ All 11 security gates
✅ Full vulnerability scan
✅ Production deployment
✅ Post-deploy verification
```

---

## 🚨 What to Do If Blocked

### **If Credentials Detected:**
1. Remove hardcoded credentials
2. Add to environment variables
3. Update .gitignore to prevent .env commits
4. Commit and push again

### **If XSS Detected:**
1. Replace innerHTML with textContent
2. Or use DOMPurify to sanitize
3. Remove dangerouslySetInnerHTML
4. Commit and push again

### **If SQL Injection Detected:**
1. Use parameterized queries
2. Or use ORM (Firestore, Prisma)
3. Never concatenate user input in queries
4. Commit and push again

### **If Auth Bypass Detected:**
1. Strengthen password requirements (min 12 chars)
2. Restrict CORS to specific domains
3. Add authentication middleware to routes
4. Commit and push again

---

## 📞 Support

**If you need help:**
- Check SECURITY.md for detailed guidance
- Review failed pipeline logs in GitHub Actions
- Test locally before pushing
- Fix one issue at a time

---

**Last Updated:** November 29, 2025  
**Security Level:** 🔒 Enterprise-Grade  
**Vulnerability Prevention:** ✅ Active on All Pushes
