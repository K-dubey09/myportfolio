# Appwrite Authentication Setup

## Admin Credentials
- **Email**: kushagradubey5002@gmail.com
- **Password**: Dubey@5002

## Setup Instructions

### 1. Create Admin Account in Appwrite (First Time Only)

If you haven't created the admin account yet, you need to register it in Appwrite:

```bash
cd frontend
npm run create-admin
```

Or manually through Appwrite Console:
1. Go to https://syd.cloud.appwrite.io/console
2. Select your project: `68ef61ed0005c49591cf`
3. Go to **Auth** → **Users**
4. Click **"Create User"**
5. Enter:
   - Email: kushagradubey5002@gmail.com
   - Password: Dubey@5002
   - Name: Admin

### 2. How Authentication Works

The application now uses **Appwrite** as the primary authentication provider with backend fallback:

1. **Login Flow**:
   - User enters email/password
   - System attempts Appwrite authentication first
   - If Appwrite fails, falls back to backend authentication
   - Session is stored in localStorage and Appwrite cookies

2. **Session Verification**:
   - On app load, checks Appwrite session first
   - Falls back to backend token verification if needed
   - Auto-refreshes tokens every 45 minutes

3. **Logout**:
   - Deletes Appwrite session
   - Clears localStorage
   - Resets authentication state

### 3. Appwrite Configuration

Located in `frontend/src/lib/appwrite.js`:
```javascript
client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68ef61ed0005c49591cf');
```

### 4. Login with Admin Credentials

Simply use the login form with:
- **Email**: kushagradubey5002@gmail.com
- **Password**: Dubey@5002

The system will authenticate through Appwrite and grant admin access.

## Modified Files

1. **frontend/src/context/AuthContext.jsx**
   - Added Appwrite import
   - Updated `login()` to use Appwrite authentication
   - Updated `logout()` to delete Appwrite session
   - Updated `verifyToken()` to check Appwrite session first

2. **frontend/src/lib/appwrite.js**
   - Already configured with Appwrite client and account

## Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page

3. Enter admin credentials:
   - Email: kushagradubey5002@gmail.com
   - Password: Dubey@5002

4. You should be authenticated and redirected to the admin panel

## Troubleshooting

**Error: "User not found"**
- The admin account doesn't exist in Appwrite yet
- Create it manually through Appwrite Console (see step 1 above)

**Error: "Invalid credentials"**
- Double-check email and password
- Ensure password is exactly: Dubey@5002 (case-sensitive)

**Error: "Network error"**
- Check Appwrite endpoint is accessible
- Verify project ID is correct
- Check browser console for detailed errors
