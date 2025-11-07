import firebaseConfig from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';

// Store pending user registration data temporarily (in production, use Redis or database)
const pendingRegistrations = new Map();

// Request email verification for registration
export const requestEmailVerification = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log('📨 Email verification request received:', { email, name });

    if (!email || !name || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists in our database
    console.log('🔍 Checking if user exists in our database...');
    const existingUser = await UserHelpers.getUserByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists in our database');
      return res.status(400).json({ message: 'User already exists' });
    }

    try {
      // Create Firebase Auth user (this will automatically send verification email)
      console.log('🔥 Creating Firebase Auth user...');
      const userRecord = await firebaseConfig.getAuth().createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: false
      });

      console.log('✅ Firebase Auth user created:', userRecord.uid);

      // Store pending registration data (to be completed when email is verified)
      const registrationData = {
        uid: userRecord.uid,
        email: email,
        name: name,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      pendingRegistrations.set(userRecord.uid, registrationData);
      console.log('💾 Pending registration stored');

      // Generate email verification link
      console.log('📧 Generating email verification link...');
      const link = await firebaseConfig.getAuth().generateEmailVerificationLink(email);
      console.log('🔗 Email verification link generated:', link);

      // In a real app, you would send this link via email service
      // For now, we'll return it in the response for testing
      console.log('✉️ Email verification link ready');

      res.json({
        message: 'Firebase user created. Verification link generated.',
        verificationLink: link, // In production, remove this and send via email
        uid: userRecord.uid,
        expiresIn: 86400
      });

    } catch (firebaseError) {
      console.error('❌ Firebase Auth error:', firebaseError);
      
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({ message: 'Email is already registered with Firebase Auth' });
      }
      
      throw firebaseError;
    }
  } catch (error) {
    console.error('❌ Request email verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete registration after Firebase email verification
export const verifyEmail = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    console.log('🔍 Verifying email for Firebase user:', uid);

    // Get Firebase user to check email verification status
    const firebaseUser = await firebaseConfig.getAuth().getUser(uid);
    
    if (!firebaseUser.emailVerified) {
      return res.status(400).json({ message: 'Email not yet verified. Please check your email and click the verification link.' });
    }

    console.log('✅ Firebase email verified for:', firebaseUser.email);

    // Check if we have pending registration data
    const pendingData = pendingRegistrations.get(uid);
    if (!pendingData) {
      return res.status(400).json({ message: 'No pending registration found for this user' });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(uid);
      return res.status(400).json({ message: 'Registration has expired. Please register again.' });
    }

    // Check if user already exists in our database
    const existingUser = await UserHelpers.getUserByEmail(firebaseUser.email);
    if (existingUser) {
      pendingRegistrations.delete(uid);
      return res.status(400).json({ message: 'User already exists in our database' });
    }

    console.log('📝 Creating user in our database...');
    
    // Create user in our database with the same UID as Firebase
    const newUser = await UserHelpers.createUserWithUID(uid, { 
      email: firebaseUser.email, 
      name: pendingData.name,
      emailVerified: true 
    });

    // Clean up pending registration
    pendingRegistrations.delete(uid);
    console.log('🧹 Pending registration cleaned up');

    const customToken = await firebaseConfig.getAuth().createCustomToken(newUser.uid, {
      role: newUser.role,
      permissions: newUser.permissions
    });

    console.log('✅ Registration completed successfully');
    
    res.status(201).json({
      message: 'Email verified and registration successful',
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
    console.error('❌ Verify email error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const register = async (req, res) => {
  // Direct registration is disabled - use email verification instead
  return res.status(403).json({ 
    message: 'Direct registration is disabled. Please use email verification to register.',
    useEmailVerification: true 
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
