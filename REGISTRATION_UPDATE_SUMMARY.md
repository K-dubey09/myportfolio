# Registration System Update Summary

## Changes Made

### 1. **User Model Updates** (`backend/models/User.js`)
- Added `username` field (unique, required, 3-30 characters, lowercase letters/numbers/underscores only)
- Added `emailVerified` (boolean, default: false)
- Added `emailVerificationOTP` (string, stores 6-digit OTP)
- Added `emailOTPExpires` (Date, OTP expiry timestamp)
- `name` field remains (full name, can be duplicate across users)

### 2. **Auth Controller Updates** (`backend/controllers/authController.js`)
- **register()**: Now creates unverified user and sends OTP email
  - Validates username format and uniqueness
  - Generates 6-digit OTP (valid for 10 minutes)
  - Sends OTP to email (currently logs to console - integrate real email service)
  - Returns `requiresVerification: true`
  
- **verifyEmail()**: New endpoint to verify email with OTP
  - Validates OTP and expiry
  - Sets `emailVerified` to true
  - Issues access and refresh tokens
  - Returns user data
  
- **resendOTP()**: New endpoint to resend OTP
  - Generates new OTP
  - Updates expiry time
  - Sends new OTP email

- **login()**: Updated to check email verification
  - Accepts email, username, or phone as identifier
  - Returns error if email not verified

### 3. **Server Routes** (`backend/server.js`)
- Added `/api/auth/verify-email` (POST)
- Added `/api/auth/resend-otp` (POST)

### 4. **Frontend AuthContext** (`frontend/src/context/AuthContext.jsx`)
- **register()**: Updated to accept `username` parameter
  - Now returns `requiresVerification` flag
  - Does not auto-login after registration
  
- **verifyEmail()**: New function for OTP verification
  - Accepts email and OTP
  - Logs in user upon successful verification
  
- **resendOTP()**: New function to request new OTP

### 5. **Registration Page** (`frontend/src/components/RegistrationPage.jsx`)
- Added `username` input field with validation
- Added Step 3: OTP Verification screen
- Updated flow:
  1. **Step 1**: Basic Info (name, username, email)
  2. **Step 2**: Password
  3. **Step 3**: OTP Verification (new)
  4. **Step 4**: Success

## User Registration Flow

```
1. User fills form (name, username, email, password)
   ↓
2. System validates and creates unverified user
   ↓
3. System sends 6-digit OTP to email
   ↓
4. User enters OTP on verification screen
   ↓
5. System verifies OTP
   ↓
6. Email marked as verified
   ↓
7. User logged in and redirected to profile
```

## Key Features

✅ **Unique Username**: Required, 3-30 characters, lowercase alphanumeric + underscores  
✅ **Full Name**: Can be duplicate (allows multiple users with same name)  
✅ **Email Verification**: Mandatory OTP verification via email  
✅ **Login Support**: Users can login with email, username, or phone  
✅ **Session Persistence**: Refresh tokens keep users logged in  
✅ **OTP Resend**: Users can request new OTP if expired  

## TODO

- [ ] Integrate real email service (SendGrid, AWS SES, etc.) in `sendEmailOTP()` function
- [ ] Add rate limiting for OTP requests
- [ ] Add OTP attempt limit (e.g., max 3 wrong attempts)
- [ ] Consider SMS verification as optional 2FA

## Testing

1. **Register New User**:
   ```
   POST /api/auth/register
   Body: { email, username, password, name }
   Response: { requiresVerification: true, email }
   ```

2. **Verify Email**:
   ```
   POST /api/auth/verify-email
   Body: { email, otp }
   Response: { accessToken, user }
   ```

3. **Resend OTP**:
   ```
   POST /api/auth/resend-otp
   Body: { email }
   Response: { message: "OTP sent successfully" }
   ```

4. **Login** (after verification):
   ```
   POST /api/auth/login
   Body: { identifier: "username or email", password }
   Response: { accessToken, user }
   ```

## Console OTP Display

Since email service is not yet integrated, OTPs are logged to the backend console:
```
📧 Sending OTP to user@example.com: 123456
```

Check your terminal running the backend to see the OTP during testing.
