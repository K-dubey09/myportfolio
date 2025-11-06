import firebaseConfig from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';
import crypto from 'crypto';

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via email (placeholder - integrate with email service)
const sendOTPEmail = async (email, otp, name) => {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`📧 OTP for ${email} (${name}): ${otp}`);
  console.log(`⚠️ In production, send this via email service`);
  // For now, just log it - in production, use email service
  return true;
};

// Request OTP for registration
export const requestRegisterOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log('📨 OTP Request received:', { email, name });

    if (!email || !name) {
      console.log('❌ Missing email or name');
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await UserHelpers.getUserByEmail(email);
    console.log('✅ User check complete:', existingUser ? 'EXISTS' : 'NEW USER');
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    console.log('🔢 OTP generated:', otp);

    // Store OTP
    otpStore.set(email, { otp, expiresAt, name, purpose: 'register' });
    console.log('💾 OTP stored in memory');

    // Send OTP via email
    await sendOTPEmail(email, otp, name);
    console.log('✉️ OTP email sent (console logged)');

    console.log('✅ OTP request successful');
    res.json({
      message: 'OTP sent to your email',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('❌ Request OTP error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP and complete registration
export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check OTP
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (storedData.purpose !== 'register') {
      return res.status(400).json({ message: 'Invalid OTP purpose' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, create user
    const newUser = await UserHelpers.createUser({ 
      email, 
      password, 
      name: storedData.name,
      emailVerified: true 
    });

    // Clean up OTP
    otpStore.delete(email);

    const customToken = await firebaseConfig.getAuth().createCustomToken(newUser.uid, {
      role: newUser.role,
      permissions: newUser.permissions
    });

    res.status(201).json({
      message: 'Registration successful',
      customToken,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const register = async (req, res) => {
  // Direct registration is disabled - use OTP verification instead
  return res.status(403).json({ 
    message: 'Direct registration is disabled. Please use email verification (OTP) to register.',
    useOTP: true 
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Support both 'password' and 'passwordHash' field names for backward compatibility
    const hashedPassword = user.passwordHash || user.password;
    if (!hashedPassword) {
      return res.status(500).json({ message: 'User password not found in database' });
    }

    const isPasswordValid = await UserHelpers.comparePassword(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await UserHelpers.updateLastLogin(user.uid);

    const customToken = await firebaseConfig.getAuth().createCustomToken(user.uid, {
      role: user.role,
      permissions: user.permissions
    });

    res.json({
      message: 'Login successful',
      customToken,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserHelpers.getUserById(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
      userNumber: user.userNumber,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = await UserHelpers.updateUser(req.user.uid, updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await UserHelpers.getUserById(req.user.uid);
    const isPasswordValid = await UserHelpers.comparePassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    await UserHelpers.updateUser(user.uid, { password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    await firebaseConfig.getAuth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google OAuth login/register
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify Google ID token
    const decodedToken = await firebaseConfig.getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await UserHelpers.getUserById(uid);

    if (!user) {
      // Create new user from Google account
      const db = firebaseConfig.getFirestore();
      const usersCollection = db.collection('users');
      const snapshot = await usersCollection.count().get();
      const totalUsers = snapshot.data().count;
      const isFirstUser = totalUsers === 0;

      const role = isFirstUser ? 'admin' : 'viewer';
      const permissions = isFirstUser 
        ? {
            canCreatePosts: true,
            canEditPosts: true,
            canDeletePosts: true,
            canManageUsers: true,
            canUploadFiles: true,
            canEditProfile: true,
            canViewAnalytics: true
          }
        : {
            canCreatePosts: false,
            canEditPosts: false,
            canDeletePosts: false,
            canManageUsers: false,
            canUploadFiles: false,
            canEditProfile: true,
            canViewAnalytics: false
          };

      await firebaseConfig.getAuth().setCustomUserClaims(uid, { role, permissions });

      const userDoc = {
        uid,
        email,
        name: name || email.split('@')[0],
        role,
        isActive: true,
        avatar: picture || null,
        userNumber: totalUsers + 1,
        authProvider: 'google',
        emailVerified: true,
        lastLogin: firebaseConfig.admin.firestore.FieldValue.serverTimestamp(),
        permissions,
        createdAt: firebaseConfig.admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseConfig.admin.firestore.FieldValue.serverTimestamp()
      };

      await usersCollection.doc(uid).set(userDoc);
      user = { uid, ...userDoc };
    } else {
      // Update last login
      await UserHelpers.updateLastLogin(uid);
    }

    const customToken = await firebaseConfig.getAuth().createCustomToken(uid, {
      role: user.role,
      permissions: user.permissions
    });

    res.json({
      message: 'Google authentication successful',
      customToken,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};
