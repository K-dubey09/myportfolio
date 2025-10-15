# ✅ Testing Checklist - Authentication System

## 🎯 Test Plan

### Phase 1: Basic Authentication ✅

#### Test 1.1: Login
- [ ] Open `http://localhost:5173`
- [ ] Navigate to login page
- [ ] Enter credentials: `admin@portfolio.com` / `admin123`
- [ ] Click "Login"
- [ ] **Expected**: Successfully logged in, redirected to dashboard
- [ ] **Check console**: "✅ Login successful for: admin@portfolio.com"
- [ ] **Check console**: "⏰ Setting up automatic token refresh"

#### Test 1.2: Registration
- [ ] Navigate to register page
- [ ] Fill in: name, email, password
- [ ] Click "Register"
- [ ] **Expected**: Account created, automatically logged in
- [ ] **Check console**: "✅ Registration successful"

#### Test 1.3: Logout
- [ ] While logged in, click "Logout"
- [ ] **Expected**: Logged out, redirected to login
- [ ] **Check console**: "👋 Logging out..."
- [ ] **Check console**: "✅ Logged out successfully"

---

### Phase 2: Session Persistence ✅

#### Test 2.1: Page Refresh (Logged In)
- [ ] Login successfully
- [ ] Refresh the page (F5 or Ctrl+R)
- [ ] **Expected**: Still logged in ✅
- [ ] **Check console**: "🚀 AuthProvider initializing..."
- [ ] **Check console**: "🔄 Attempting to refresh access token..."
- [ ] **Check console**: "✅ Token refreshed successfully"
- [ ] **Check console**: "✅ Session restored for: [email]"

#### Test 2.2: Browser Close & Reopen
- [ ] Login successfully
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to `http://localhost:5173`
- [ ] **Expected**: Still logged in ✅
- [ ] **Check console**: Same messages as Test 2.1

#### Test 2.3: New Tab
- [ ] While logged in, open new tab
- [ ] Navigate to `http://localhost:5173`
- [ ] **Expected**: Already logged in ✅

---

### Phase 3: Auto-Refresh Mechanism ✅

#### Test 3.1: Auto-Refresh Timer
- [ ] Login successfully
- [ ] Wait 10 minutes
- [ ] **Check console at 10-min mark**: "⏰ Auto-refreshing token..."
- [ ] **Check console**: "✅ Token refreshed successfully"
- [ ] **Expected**: User stays logged in seamlessly

#### Test 3.2: Multiple Auto-Refreshes
- [ ] Login successfully
- [ ] Wait 20 minutes
- [ ] **Expected**: 2 auto-refreshes occurred
- [ ] User still logged in
- [ ] No interruption to user experience

---

### Phase 4: Token Expiry ✅

#### Test 4.1: Access Token Expiry
- [ ] Login successfully
- [ ] Wait 15 minutes (access token expires)
- [ ] Make an API request
- [ ] **Expected**: Request succeeds after auto-refresh
- [ ] No error shown to user

#### Test 4.2: Refresh Token Expiry
- [ ] Manually set token expiry in database to past date
- [ ] Refresh page
- [ ] **Expected**: Logged out, redirected to login
- [ ] **Check console**: "❌ Refresh token expired for user"

---

### Phase 5: Security Tests ✅

#### Test 5.1: HttpOnly Cookie
- [ ] Login successfully
- [ ] Open DevTools → Application → Cookies
- [ ] Find `refreshToken` cookie
- [ ] **Expected**: 
  - ✅ HttpOnly flag is set
  - ✅ SameSite is "Strict"
  - ✅ Path is "/api/auth"
  - ✅ Expires in ~30 days

#### Test 5.2: Token Rotation
- [ ] Login successfully
- [ ] Note the refresh token in DB: `db.users.findOne({email: 'admin@portfolio.com'})`
- [ ] Trigger a refresh (wait 10 min or call endpoint)
- [ ] Check DB again
- [ ] **Expected**: Refresh token changed ✅

#### Test 5.3: Invalid Token Rejection
- [ ] Login successfully
- [ ] Manually change refresh token in database to "invalid"
- [ ] Refresh page
- [ ] **Expected**: Logged out, can't restore session
- [ ] **Check console**: "❌ Invalid refresh token"

#### Test 5.4: Logout Clears Everything
- [ ] Login successfully
- [ ] Check DB: refresh token exists
- [ ] Logout
- [ ] Check DB: refresh token is null
- [ ] Check cookies: refreshToken cookie cleared
- [ ] **Expected**: All tokens cleared ✅

---

### Phase 6: API Requests ✅

#### Test 6.1: Authenticated Request
- [ ] Login successfully
- [ ] Make API request to protected endpoint
- [ ] Example: Fetch projects
- [ ] **Expected**: Request succeeds with auth token
- [ ] **Check headers**: `Authorization: Bearer [token]`

#### Test 6.2: Request After Token Refresh
- [ ] Login successfully
- [ ] Wait 10 minutes (auto-refresh occurs)
- [ ] Make API request
- [ ] **Expected**: Request uses new token
- [ ] Request succeeds

---

### Phase 7: Edge Cases ✅

#### Test 7.1: Concurrent Tabs
- [ ] Login in Tab 1
- [ ] Open Tab 2 (already logged in)
- [ ] Logout in Tab 1
- [ ] Refresh Tab 2
- [ ] **Expected**: Tab 2 is also logged out

#### Test 7.2: Network Failure
- [ ] Login successfully
- [ ] Disconnect internet
- [ ] Wait 10 minutes (auto-refresh will fail)
- [ ] Reconnect internet
- [ ] **Expected**: Next refresh succeeds, user stays logged in

#### Test 7.3: Server Restart
- [ ] Login successfully
- [ ] Note: refresh token in DB
- [ ] Restart backend server
- [ ] Refresh page
- [ ] **Expected**: Session restored from cookie ✅

---

### Phase 8: User Experience ✅

#### Test 8.1: No Interruption
- [ ] Login successfully
- [ ] Work for 30 minutes
- [ ] **Expected**: No login prompts, no interruptions
- [ ] 3 auto-refreshes occurred silently

#### Test 8.2: Loading State
- [ ] Clear cookies
- [ ] Refresh page
- [ ] **Expected**: Brief loading state
- [ ] Then shows "Please log in"

#### Test 8.3: Error Messages
- [ ] Try to login with wrong password
- [ ] **Expected**: Clear error message
- [ ] Try to access protected route while logged out
- [ ] **Expected**: Redirected to login

---

## 🔧 Manual Testing Commands

### Backend Testing

#### 1. Check User's Refresh Token
```javascript
// In MongoDB shell or Compass
db.users.findOne(
  { email: 'admin@portfolio.com' },
  { refreshToken: 1, refreshTokenExpiry: 1, email: 1 }
)
```

#### 2. Clear Refresh Tokens (Force Logout All)
```javascript
db.users.updateMany(
  {},
  { $set: { refreshToken: null, refreshTokenExpiry: null } }
)
```

#### 3. Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@portfolio.com", "password": "admin123"}' \
  -c cookies.txt
```

#### 4. Test Refresh Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt
```

#### 5. Test Logout Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

### Frontend Testing

#### 1. Check AuthContext State
```javascript
// In browser console
const authContext = React.useContext(AuthContext);
console.log({
  isAuthenticated: authContext.isAuthenticated,
  user: authContext.user,
  token: authContext.token ? 'EXISTS' : 'NULL'
});
```

#### 2. Manually Trigger Refresh
```javascript
// In browser console
const { refreshAccessToken } = React.useContext(AuthContext);
const newToken = await refreshAccessToken();
console.log('New token:', newToken);
```

#### 3. Check Cookie
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('refreshToken'))
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Phase 1: Basic Authentication
  ✅ Test 1.1: Login
  ✅ Test 1.2: Registration
  ✅ Test 1.3: Logout

Phase 2: Session Persistence
  ✅ Test 2.1: Page Refresh
  ✅ Test 2.2: Browser Close & Reopen
  ✅ Test 2.3: New Tab

Phase 3: Auto-Refresh
  ✅ Test 3.1: Auto-Refresh Timer
  ✅ Test 3.2: Multiple Auto-Refreshes

Phase 4: Token Expiry
  ✅ Test 4.1: Access Token Expiry
  ✅ Test 4.2: Refresh Token Expiry

Phase 5: Security
  ✅ Test 5.1: HttpOnly Cookie
  ✅ Test 5.2: Token Rotation
  ✅ Test 5.3: Invalid Token Rejection
  ✅ Test 5.4: Logout Clears Everything

Phase 6: API Requests
  ✅ Test 6.1: Authenticated Request
  ✅ Test 6.2: Request After Token Refresh

Phase 7: Edge Cases
  ✅ Test 7.1: Concurrent Tabs
  ✅ Test 7.2: Network Failure
  ✅ Test 7.3: Server Restart

Phase 8: User Experience
  ✅ Test 8.1: No Interruption
  ✅ Test 8.2: Loading State
  ✅ Test 8.3: Error Messages

Overall Result: ✅ PASS / ❌ FAIL
Notes:
_______________________________________________
_______________________________________________
```

---

## 🐛 Common Issues During Testing

### Issue: "No refresh token provided"
**Fix**: Check that `credentials: 'include'` is in fetch calls

### Issue: Cookie not persisting
**Fix**: Check browser settings, try incognito mode

### Issue: CORS error
**Fix**: Verify backend CORS config allows `credentials: true`

### Issue: Token not refreshing
**Fix**: Check auto-refresh timer is running, check console logs

### Issue: User logged out unexpectedly
**Fix**: Check database for refresh token, check token expiry

---

## ✅ Success Criteria

All tests must pass:
- ✅ Users stay logged in across refreshes
- ✅ Sessions persist for 30 days
- ✅ Auto-refresh works every 10 minutes
- ✅ Tokens are secure (httpOnly, rotation)
- ✅ Logout clears all auth state
- ✅ No errors in console
- ✅ Seamless user experience

---

## 🎉 Final Verification

After all tests pass:

1. **Restart both backend and frontend**
2. **Login**
3. **Refresh page** → Still logged in ✅
4. **Close and reopen browser** → Still logged in ✅
5. **Wait 10 minutes** → Still logged in ✅
6. **Logout** → Logged out completely ✅

**If all ✅, system is production-ready!** 🚀

---

**Last Updated**: October 14, 2025
