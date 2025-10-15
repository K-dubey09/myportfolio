# 🔐 Authentication System - Complete Guide

## 📋 Overview

The portfolio application now features a **robust, production-ready authentication system** with **persistent sessions** using refresh tokens. Users stay logged in even after page refreshes or browser restarts.

---

## ✨ Key Features

### 1. **Persistent Sessions**
- ✅ Users remain logged in across page refreshes
- ✅ Sessions persist for **30 days**
- ✅ Automatic token refresh every 10 minutes
- ✅ Secure httpOnly cookies for refresh tokens

### 2. **Dual Token System**
- **Access Token**: Short-lived (15 minutes), stored in memory
- **Refresh Token**: Long-lived (30 days), stored in httpOnly cookie

### 3. **Enhanced Security**
- 🔒 Refresh tokens stored in httpOnly cookies (can't be accessed by JavaScript)
- 🔒 Access tokens never stored in localStorage
- 🔒 Refresh token rotation on every refresh
- 🔒 Tokens validated against database
- 🔒 Token expiry tracking in database

### 4. **Automatic Token Management**
- ⚡ Auto-refresh every 10 minutes (before access token expires)
- ⚡ Silent refresh on page load
- ⚡ Automatic logout if refresh fails
- ⚡ Session restoration from cookies

---

## 🏗️ Architecture

### Backend (Node.js/Express)

```
┌─────────────────────────────────────────┐
│         User Authentication Flow         │
└─────────────────────────────────────────┘

1. LOGIN
   ↓
   User provides credentials
   ↓
   Server validates credentials
   ↓
   Generate Access Token (15 min) + Refresh Token (30 days)
   ↓
   Store refresh token in database
   ↓
   Send Access Token in response body
   Send Refresh Token in httpOnly cookie
   ↓
   Client stores Access Token in memory

2. API REQUESTS
   ↓
   Client sends Access Token in Authorization header
   ↓
   Server validates Access Token
   ↓
   Grant access if valid

3. TOKEN REFRESH (every 10 min or on page load)
   ↓
   Client sends Refresh Token (automatically via cookie)
   ↓
   Server validates Refresh Token against database
   ↓
   Generate new Access Token + new Refresh Token
   ↓
   Rotate tokens (invalidate old refresh token)
   ↓
   Send new tokens to client

4. LOGOUT
   ↓
   Client sends logout request
   ↓
   Server removes refresh token from database
   ↓
   Clear httpOnly cookie
   ↓
   Client clears access token from memory
```

### Frontend (React)

```
┌─────────────────────────────────────────┐
│        AuthContext State Management      │
└─────────────────────────────────────────┘

State:
- isAuthenticated (boolean)
- user (object)
- token (string - access token in memory)
- loading (boolean)
- refreshInterval (timer)

On Mount:
1. Try to refresh from cookie
2. If successful, fetch user profile
3. Set authenticated state
4. Start auto-refresh timer (10 min)

On Login:
1. POST credentials to /api/auth/login
2. Receive access token + user data
3. Refresh token automatically set in cookie
4. Store access token in memory
5. Start auto-refresh timer

On Logout:
1. Clear auto-refresh timer
2. POST to /api/auth/logout
3. Clear access token from memory
4. Server clears refresh token cookie

Auto-Refresh:
- Runs every 10 minutes
- Calls /api/auth/refresh endpoint
- Updates access token in memory
- If refresh fails, logs out user
```

---

## 🔧 Implementation Details

### Backend Files Modified

#### 1. **User Model** (`backend/models/User.js`)

Added fields:
```javascript
refreshToken: {
  type: String,
  default: null
},
refreshTokenExpiry: {
  type: Date,
  default: null
}
```

Security:
```javascript
// Removed from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.refreshTokenExpiry;
  return user;
};
```

#### 2. **Auth Controller** (`backend/controllers/authController.js`)

**Login Flow:**
```javascript
// Create short-lived access token
const accessToken = jwt.sign(
  { userId, email, role, permissions },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// Create long-lived refresh token
const refreshToken = jwt.sign(
  { userId, type: 'refresh' },
  process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

// Save to database
user.refreshToken = refreshToken;
user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
await user.save();

// Set httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth'
});
```

**Refresh Flow:**
```javascript
async refresh(req, res) {
  // 1. Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  
  // 2. Verify JWT signature
  const payload = jwt.verify(refreshToken, secret);
  
  // 3. Find user and validate token
  const user = await User.findById(payload.userId);
  if (user.refreshToken !== refreshToken) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  // 4. Check expiry
  if (new Date() > user.refreshTokenExpiry) {
    return res.status(401).json({ error: 'Refresh token expired' });
  }
  
  // 5. Generate new tokens
  const newAccessToken = jwt.sign({...}, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({...}, { expiresIn: '30d' });
  
  // 6. Rotate refresh token (invalidate old one)
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();
  
  // 7. Send new tokens
  res.cookie('refreshToken', newRefreshToken, {...});
  res.json({ accessToken: newAccessToken, user });
}
```

**Logout Flow:**
```javascript
async logout(req, res) {
  // 1. Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  
  // 2. Find user and clear refresh token
  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    user.refreshTokenExpiry = null;
    await user.save();
  }
  
  // 3. Clear cookie
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logout successful' });
}
```

### Frontend Files Modified

#### 1. **AuthContext** (`frontend/src/context/AuthContext.jsx`)

**State Management:**
```javascript
const [token, setToken] = useState(null); // Access token in memory
const [refreshInterval, setRefreshInterval] = useState(null); // Auto-refresh timer
```

**Auto-Refresh Setup:**
```javascript
useEffect(() => {
  if (isAuthenticated && token) {
    // Refresh token every 10 minutes
    const interval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        logout(); // Failed to refresh, log out
      }
    }, 10 * 60 * 1000);
    
    setRefreshInterval(interval);
    
    return () => clearInterval(interval);
  }
}, [isAuthenticated, token]);
```

**Initialization (Page Load):**
```javascript
useEffect(() => {
  const init = async () => {
    // Try to refresh from cookie
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Fetch user profile
      const resp = await fetch(`${API_BASE}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${refreshed}` }
      });
      
      if (resp.ok) {
        const userData = await resp.json();
        setUser(userData);
        setIsAuthenticated(true);
      }
    }
    
    setLoading(false);
  };
  
  init();
}, []); // Only run once on mount
```

**Login:**
```javascript
const login = async (identifier, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include', // Send/receive cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  
  const data = await response.json();
  
  if (data.accessToken && data.user) {
    setToken(data.accessToken); // Store in memory
    setUser(data.user);
    setIsAuthenticated(true);
    return { success: true, user: data.user };
  }
};
```

**Logout:**
```javascript
const logout = async () => {
  // Clear auto-refresh timer
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Notify server
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  
  // Clear state
  setToken(null);
  setUser(null);
  setIsAuthenticated(false);
};
```

---

## 🚀 Usage

### Login
```javascript
import { useAuth } from './context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    const result = await login('user@example.com', 'password123');
    
    if (result.success) {
      console.log('Logged in!', result.user);
      // User will stay logged in across page refreshes
    } else {
      console.error('Login failed:', result.error);
    }
  };
}
```

### Protected Routes
```javascript
import { useAuth } from './context/AuthContext';

function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Protected content</div>;
}
```

### Making Authenticated Requests
```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { token } = useAuth();
  
  const fetchData = async () => {
    const response = await fetch('/api/protected-endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  };
}
```

### Logout
```javascript
import { useAuth } from './context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

---

## 🔒 Security Features

### 1. **HttpOnly Cookies**
- Refresh tokens stored in httpOnly cookies
- Can't be accessed by JavaScript
- Protection against XSS attacks

### 2. **Token Rotation**
- New refresh token issued on every refresh
- Old refresh token immediately invalidated
- Protection against token theft

### 3. **Database Validation**
- Refresh tokens validated against database
- Revoked tokens immediately rejected
- Can force logout by clearing database token

### 4. **Short-lived Access Tokens**
- Access tokens expire in 15 minutes
- Limits damage if token is stolen
- Auto-refresh before expiry

### 5. **Secure Cookie Options**
```javascript
{
  httpOnly: true,        // Can't access via JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  path: '/api/auth',     // Limited scope
  maxAge: 30 days        // Auto-expire
}
```

### 6. **In-Memory Access Tokens**
- Never stored in localStorage
- Lost on page close (but session persists via refresh token)
- Can't be stolen if computer is left unlocked

---

## 🐛 Troubleshooting

### Issue: User logged out on page refresh

**Cause**: Refresh token cookie not being sent/received

**Solutions**:
1. Check `credentials: 'include'` in fetch calls
2. Verify CORS allows credentials: `credentials: true`
3. Check cookie `sameSite` and `path` settings
4. In development, ensure frontend and backend on same domain or configure CORS properly

### Issue: "Invalid refresh token" error

**Cause**: Token mismatch between cookie and database

**Solutions**:
1. Clear browser cookies
2. Check database for valid refresh token
3. Verify JWT_SECRET and REFRESH_JWT_SECRET in .env
4. Ensure token rotation is working correctly

### Issue: Automatic refresh not working

**Cause**: Interval not set up or cleared

**Solutions**:
1. Check browser console for "Setting up automatic token refresh"
2. Verify `isAuthenticated` and `token` are both true
3. Check for errors in refresh endpoint
4. Ensure interval is not being cleared prematurely

### Issue: Session expires too quickly

**Cause**: Refresh token expiry too short

**Solutions**:
1. Increase `expiresIn: '30d'` in refresh token generation
2. Check `maxAge` in cookie options matches token expiry
3. Verify database `refreshTokenExpiry` is being set correctly

---

## 📊 Token Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    Token Timeline                         │
└──────────────────────────────────────────────────────────┘

Login
│
├─ Access Token Created (expires in 15 min)
│  └─ Stored in memory
│
└─ Refresh Token Created (expires in 30 days)
   └─ Stored in database + httpOnly cookie

─────────────────────────────────────────────────────────

10 minutes later (Auto-refresh timer)
│
├─ Call /api/auth/refresh with cookie
│
├─ Validate refresh token
│
├─ Generate new Access Token (15 min)
│  └─ Replace old token in memory
│
└─ Generate new Refresh Token (30 days)
   ├─ Invalidate old refresh token in database
   └─ Update cookie with new token

─────────────────────────────────────────────────────────

This cycle repeats every 10 minutes

─────────────────────────────────────────────────────────

Logout or Token Expiry
│
├─ Clear access token from memory
│
├─ Remove refresh token from database
│
└─ Clear refresh token cookie
```

---

## 🧪 Testing

### Test Persistent Login

1. **Login**:
   ```
   POST /api/auth/login
   {
     "identifier": "admin@portfolio.com",
     "password": "admin123"
   }
   ```

2. **Refresh the page**:
   - User should still be logged in
   - Check console: "Session restored from refresh token"

3. **Wait 10 minutes**:
   - Check console: "Auto-refreshing token..."
   - Token should refresh automatically

4. **Close and reopen browser**:
   - User should still be logged in (if within 30 days)

### Test Token Refresh

```bash
# Get refresh token from cookie
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"

# Should return new access token
```

### Test Logout

```bash
# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"

# Try to refresh (should fail)
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"

# Should return 401 Unauthorized
```

---

## 📝 Environment Variables

Add to `.env`:

```bash
# JWT Secrets (use different secrets for production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_JWT_SECRET=your-super-secret-refresh-jwt-key-change-in-production

# Node environment
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important**: Use **different secrets** for `JWT_SECRET` and `REFRESH_JWT_SECRET` in production!

---

## 🎯 Best Practices

### 1. **Never store tokens in localStorage**
❌ Bad:
```javascript
localStorage.setItem('token', accessToken);
```

✅ Good:
```javascript
// Access token in memory only
const [token, setToken] = useState(null);
```

### 2. **Always use credentials: 'include'**
```javascript
fetch('/api/endpoint', {
  credentials: 'include' // Send/receive cookies
});
```

### 3. **Handle token expiry gracefully**
```javascript
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 401) {
  // Try to refresh
  const newToken = await refreshAccessToken();
  
  if (newToken) {
    // Retry request with new token
  } else {
    // Logout user
    logout();
  }
}
```

### 4. **Clear intervals on logout**
```javascript
const logout = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  // ... rest of logout logic
};
```

### 5. **Validate tokens on server**
```javascript
// Always check token against database
const user = await User.findById(userId);
if (user.refreshToken !== providedToken) {
  throw new Error('Invalid token');
}
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS (for `secure: true` cookies)
- [ ] Configure CORS for production domain
- [ ] Set proper `sameSite` cookie option
- [ ] Test token refresh in production
- [ ] Monitor failed refresh attempts
- [ ] Set up token cleanup job (optional)

---

## 📚 Resources

- [JWT.io](https://jwt.io/) - JWT debugger
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

## ✅ Summary

Your authentication system now provides:

1. ✅ **Persistent sessions** - Users stay logged in across refreshes
2. ✅ **Automatic token refresh** - Seamless user experience
3. ✅ **Enhanced security** - HttpOnly cookies, token rotation, database validation
4. ✅ **Production-ready** - Scalable and secure architecture

**No more annoying login prompts on every page refresh!** 🎉

---

**Last Updated**: October 14, 2025
**Version**: 2.0.0
