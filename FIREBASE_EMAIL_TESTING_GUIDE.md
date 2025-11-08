# Firebase Email Verification Testing Guide

## Why Emails Might Not Be Sent

Firebase Client SDK's `sendEmailVerification()` will only work if:

1. ✅ Firebase project has email/password authentication enabled
2. ✅ User is authenticated (signed in)
3. ✅ Email hasn't been verified yet
4. ✅ Email template is configured in Firebase Console
5. ✅ Rate limits haven't been exceeded

## Quick Verification Checklist

### 1. Check Firebase Console - Authentication

```
Firebase Console → Your Project → Authentication → Sign-in method
```

**Verify:**
- [ ] Email/Password provider is **ENABLED**
- [ ] Status shows "Enabled" (not just added)

### 2. Check Email Templates

```
Firebase Console → Authentication → Templates → Email address verification
```

**Verify:**
- [ ] Template exists
- [ ] "From" email is configured
- [ ] Template is not in draft mode

### 3. Check Current Browser Console

When you register, you should see these logs:
```javascript
📧 Attempting to send verification email to: your@email.com
✅ Verification email sent successfully to: your@email.com
```

If you see an error instead, it will show the Firebase error code.

### 4. Common Firebase Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/too-many-requests` | Rate limit exceeded | Wait 1 hour or use different email |
| `auth/user-not-found` | User doesn't exist | Check backend created user |
| `auth/invalid-action-code` | Link expired/used | Generate new verification |
| `auth/network-request-failed` | No internet | Check connection |

## Testing Steps

### Step 1: Clear Everything

```bash
# Clear browser data
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Close and reopen browser
```

### Step 2: Check Backend Logs

Start backend and watch for:
```
📨 Email verification request received: { email: 'test@test.com', name: 'Test' }
🔥 Creating Firebase Auth user...
✅ Firebase Auth user created: [UID]
🔐 Generating custom token...
✅ Custom token generated
```

### Step 3: Check Frontend Logs

In browser console, watch for:
```
📧 Attempting to send verification email to: test@test.com
✅ Verification email sent successfully to: test@test.com
```

### Step 4: Verify in Firebase Console

```
Firebase Console → Authentication → Users
```

You should see:
- ✅ New user with your email
- ✅ Email verified: **No** (initially)
- ✅ Created: just now

### Step 5: Check Your Email

**Wait 1-2 minutes**, then check:
- Inbox folder
- Spam/Junk folder
- Promotions tab (Gmail)

Email subject will be something like:
```
"Verify your email for [Your App Name]"
```

## If Email Is Still Not Sent

### Option 1: Check Firebase Quotas

```
Firebase Console → Usage → Authentication
```

Free tier limits:
- 100 emails/day
- If exceeded, upgrade or wait 24 hours

### Option 2: Manual Verification Link

Add this to backend temporarily for testing:

```javascript
// In authController.js - requestEmailVerification function
const link = await admin.auth().generateEmailVerificationLink(email, {
  url: 'http://localhost:5176/email-verification'
});

console.log('🔗 MANUAL VERIFICATION LINK:', link);
console.log('📋 Copy this link and paste in browser to verify email');

// Return link in response for testing
res.json({
  success: true,
  message: 'Account created!',
  customToken: customToken,
  uid: userRecord.uid,
  email: email,
  expiresIn: 86400,
  // REMOVE THIS IN PRODUCTION
  verificationLink: link
});
```

Then in frontend, you can display the link for manual testing.

### Option 3: Check Firebase Auth Domain

```
Firebase Console → Authentication → Settings → Authorized domains
```

Add:
- `localhost`
- Your production domain

### Option 4: Use Firebase Emulator (Development)

```bash
# Install
npm install -g firebase-tools

# Login
firebase login

# Start emulator
firebase emulators:start --only auth
```

Update frontend config:
```javascript
import { connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Quick Fix - Force Email Send

Update `AuthContext.jsx`:

```javascript
const requestEmailVerification = async (email, name, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register/request-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Backend response:', data);
      
      // Sign in with custom token
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      console.log('✅ User signed in:', userCredential.user.email);
      
      const user = userCredential.user;
      
      // Check if user object exists
      if (!user) {
        throw new Error('No user after sign-in');
      }
      
      console.log('📧 User email verified status:', user.emailVerified);
      console.log('📧 Sending verification email...');
      
      try {
        await sendEmailVerification(user, {
          url: 'http://localhost:5176/email-verification',
          handleCodeInApp: false
        });
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        console.error('Error code:', emailError.code);
        console.error('Error message:', emailError.message);
        throw emailError;
      }
      
      return { 
        success: true, 
        message: 'Verification email sent!',
        uid: data.uid,
        email: data.email
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Full error:', error);
    return { success: false, error: error.message };
  }
};
```

## What Should Happen

1. **Backend creates user** → See UID in logs
2. **Frontend signs in user** → See "User signed in" log
3. **Frontend calls sendEmailVerification()** → See "EMAIL SENT SUCCESSFULLY"
4. **Firebase sends email** → Check inbox in 1-2 minutes
5. **User clicks link** → Redirected to app, email verified

## Still Not Working?

Try this diagnostic:

```javascript
// Add to AuthContext after sign-in
console.log('=== DIAGNOSTIC INFO ===');
console.log('User object:', user);
console.log('Email:', user.email);
console.log('Email verified:', user.emailVerified);
console.log('UID:', user.uid);
console.log('Provider:', user.providerData);
console.log('=====================');
```

The output will tell us exactly what's wrong.

## Next Steps

1. Follow the checklist above
2. Check all console logs
3. Verify Firebase Console settings
4. Test with the enhanced logging
5. Share any error messages you see
