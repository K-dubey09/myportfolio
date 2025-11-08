import firebaseConfig, { admin } from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';

// Store pending user registration data temporarily (in production, use Redis or database)
const pendingRegistrations = new Map();

// Handle email link sign-in completion
export const handleEmailLinkSignIn = async (req, res) => {
  try {
    const { idToken, email, name } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({ message: 'ID token and email are required' });
    }

    console.log('🔍 Processing email link sign-in for:', email);

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    console.log('✅ Firebase token verified for UID:', uid);

    // Check if user exists in our database
    let user = await UserHelpers.getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      console.log('📝 Creating new user in database...');
      isNewUser = true;
      
      // Create user in our database with Firebase UID
      user = await UserHelpers.createUserWithUID(uid, {
        email: email,
        name: name || 'User',
        emailVerified: true,
        provider: 'email-link'
      });

      console.log('✅ New user created:', user.uid);
    } else {
      console.log('👤 Existing user found:', user.uid);
      await UserHelpers.updateLastLogin(user.uid);
    }

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Sign-in successful',
      isNewUser,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('❌ Email link sign-in error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

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
      // Create Firebase Auth user with password
      console.log('🔥 Creating Firebase Auth user...');
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: false
      });

      // Generate custom token for the user to sign in on frontend
      console.log('🔐 Generating custom token...');
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      console.log('✅ Custom token generated');

      // Store pending registration data
      const registrationData = {
        uid: userRecord.uid,
        email: email,
        name: name,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      pendingRegistrations.set(userRecord.uid, registrationData);
      console.log('💾 Pending registration stored');

      // Return custom token so frontend can sign in and send verification email
      res.json({
        success: true,
        message: 'Account created! Verification email will be sent.',
        customToken: customToken,
        uid: userRecord.uid,
        email: email,
        expiresIn: 86400
      });

    } catch (firebaseError) {
      console.error('❌ Firebase Auth error:', firebaseError);
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
    const { uid, oobCode } = req.body;

    console.log('🔍 Verifying email with:', { uid, hasOobCode: !!oobCode });

    let firebaseUser;
    
    // If we have oobCode, verify it and get the email
    if (oobCode) {
      try {
        // Check the action code to get email
        const info = await admin.auth().checkActionCode(oobCode);
        const email = info.data.email;
        console.log('� Email from action code:', email);
        
        // Get user by email
        firebaseUser = await admin.auth().getUserByEmail(email);
      } catch (codeError) {
        console.error('❌ Invalid or expired action code:', codeError);
        return res.status(400).json({ message: 'Invalid or expired verification link' });
      }
    } else if (uid) {
      // Fallback to UID if provided
      firebaseUser = await admin.auth().getUser(uid);
    } else {
      return res.status(400).json({ message: 'Either UID or verification code is required' });
    }

    const userUid = firebaseUser.uid;
    console.log('👤 Firebase user UID:', userUid);
    
    if (!firebaseUser.emailVerified) {
      return res.status(400).json({ message: 'Email not yet verified. Please check your email and click the verification link.' });
    }

    console.log('✅ Firebase email verified for:', firebaseUser.email);

    // Check if we have pending registration data
    const pendingData = pendingRegistrations.get(userUid);
    if (!pendingData) {
      return res.status(400).json({ message: 'No pending registration found for this user' });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(userUid);
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
    const newUser = await UserHelpers.createUserWithUID(userUid, { 
      email: firebaseUser.email, 
      name: pendingData.name,
      emailVerified: true 
    });

    // Clean up pending registration
    pendingRegistrations.delete(userUid);
    console.log('🧹 Pending registration cleaned up');

    const customToken = await admin.auth().createCustomToken(newUser.uid, {
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
    console.error('❌ Complete email link sign-in error:', error);
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
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        permissions,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
