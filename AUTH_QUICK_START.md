# 🚀 Quick Start - Persistent Login System

## 🎯 What Changed

Your portfolio now has **persistent login sessions**! Users stay logged in even after:
- ✅ Page refreshes
- ✅ Closing and reopening browser
- ✅ Computer restarts (for up to 30 days)

---

## 🔧 Setup (One-Time)

### 1. Environment Variables

Add to `backend/.env`:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_JWT_SECRET=your-super-secret-refresh-jwt-key-change-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/portfolio
FRONTEND_URL=http://localhost:5173
```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 💻 Usage Examples

### Login
```javascript
import { useAuth } from './context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(email, password);
    
    if (result.success) {
      console.log('Logged in!');
      // Navigate to dashboard
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Check Login Status
```javascript
import { useAuth } from './context/AuthContext';

function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Welcome back, {user.name}!</div>;
  }

  return <div>Please log in</div>;
}
```

### Protected Component
```javascript
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminPanel() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user.role !== 'admin') return <div>Admin access required</div>;

  return <div>Admin Panel Content</div>;
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

### Make Authenticated Request
```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { token } = useAuth();

  const fetchData = async () => {
    const response = await fetch('/api/protected-data', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 401) {
      console.error('Token expired or invalid');
      // AuthContext will auto-refresh if possible
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

---

## 🔍 Testing

### 1. Test Login Persistence

1. **Login** to your application
2. **Refresh the page** → Should still be logged in ✅
3. **Close browser** and reopen → Should still be logged in ✅
4. **Check console** → Should see: "Session restored from refresh token"

### 2. Test Auto-Refresh

1. **Login** to your application
2. **Open browser console**
3. **Wait 10 minutes** → Should see: "Auto-refreshing token..."
4. **User stays logged in** ✅

### 3. Test Logout

1. **Login** to your application
2. **Click logout**
3. **Refresh page** → Should be logged out ✅
4. **Try to access protected route** → Should redirect to login ✅

---

## 🐛 Common Issues

### Issue: "No refresh token provided"

**Cause**: Cookie not being sent

**Fix**:
- Ensure `credentials: 'include'` in all fetch calls
- Check CORS configuration allows credentials
- Verify cookie path is `/api/auth`

### Issue: User logged out after refresh

**Cause**: Cookie not persisting

**Fix**:
- Check browser cookie settings
- Verify `httpOnly`, `sameSite`, `secure` settings
- Clear browser cache and cookies
- Try in incognito mode

### Issue: "Invalid refresh token"

**Cause**: Token mismatch

**Fix**:
- Clear database: `db.users.updateMany({}, { $set: { refreshToken: null, refreshTokenExpiry: null } })`
- Logout and login again
- Check JWT secrets in `.env`

---

## 📊 How It Works

```
┌──────────────┐
│    LOGIN     │
└──────┬───────┘
       │
       ├─ Access Token (15 min) → Memory
       │
       └─ Refresh Token (30 days) → Cookie
              │
              ▼
       ┌──────────────┐
       │  Auto-Refresh │ (Every 10 min)
       │   New Tokens  │
       └──────┬────────┘
              │
              ├─ New Access Token → Memory
              │
              └─ New Refresh Token → Cookie
                     │
                     ▼
              (Repeat until logout)
```

---

## ✅ Features

- 🔒 **Secure**: HttpOnly cookies, token rotation
- ⚡ **Fast**: Auto-refresh before expiry
- 🔄 **Persistent**: Sessions last 30 days
- 🛡️ **Protected**: Tokens validated against database
- 🎯 **Seamless**: No user interruption

---

## 🎉 You're Done!

Users can now:
- ✅ Stay logged in across page refreshes
- ✅ Keep sessions for 30 days
- ✅ Experience seamless auto-refresh
- ✅ Never lose their login state

**No more annoying "Please log in again" messages!** 🚀

---

## 📚 More Info

See `AUTH_SYSTEM_GUIDE.md` for complete documentation.
