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
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
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

      // Create Firestore document for cross-device verification tracking
      try {
        await admin.firestore().collection('verificationTracking').doc(userRecord.uid).set({
          email: email,
          name: name,
          status: 'pending', // Will change to 'verified' when email is verified
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        console.log('📊 Firestore verification tracking created');
      } catch (firestoreError) {
        console.warn('⚠️ Failed to create verification tracking:', firestoreError.message);
        // Non-critical error, continue anyway
      }

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
    const { oobCode } = req.body;

    if (!oobCode) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    console.log('🔍 Verifying email with oobCode...');

    // 1. Check the action code to get user info (email)
    const info = await admin.auth().checkActionCode(oobCode);
    const email = info.data.email;
    console.log('✅ Action code is valid for email:', email);

    // 2. Apply the action code. This marks the user as `emailVerified` in Firebase Auth.
    await admin.auth().applyActionCode(oobCode);
    console.log('✅ Email verified in Firebase Authentication for:', email);

    // 3. Get the user from Firebase to get their UID
    const firebaseUser = await admin.auth().getUserByEmail(email);
    const userUid = firebaseUser.uid;
    console.log('👤 Firebase user UID:', userUid);

    // 4. Update our Firestore verification tracking document
    const trackingDocRef = admin.firestore().collection('verificationTracking').doc(userUid);
    const trackingDoc = await trackingDocRef.get();

    if (trackingDoc.exists) {
      await trackingDocRef.update({
        status: 'verified',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('📊 Firestore verification tracking updated to "verified"');
    } else {
      // If for some reason the tracking doc doesn't exist, create it now as verified.
      await trackingDocRef.set({
        email: email,
        status: 'verified',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp() // Fallback
      });
       console.warn(`⚠️ Verification tracking doc for ${userUid} did not exist. Created it now.`);
    }

    // The user is NOT created in the main 'users' collection here.
    // That happens in the `getVerificationStatus` controller when the original device polls.
    // This endpoint's only job is to verify the email and update the tracking status.

    res.status(200).json({
      success: true,
      message: 'Email has been successfully verified.'
    });

  } catch (error) {
    console.error('❌ Email verification completion error:', error);
    if (error.code === 'auth/invalid-action-code') {
      return res.status(400).json({ message: 'Invalid or expired verification link. Please try registering again.' });
    }
    res.status(500).json({ message: 'Server error during email verification.', error: error.message });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    console.log(`[Status Check] Checking verification for UID: ${uid}`);

    const trackingDocRef = admin.firestore().collection('verificationTracking').doc(uid);
    const trackingDoc = await trackingDocRef.get();

    if (!trackingDoc.exists) {
      console.log(`[Status Check] No tracking document found for UID: ${uid}`);
      // To prevent polling indefinitely for a non-existent registration, we should check if the user exists and is verified.
      try {
        const user = await admin.auth().getUser(uid);
        if (user.emailVerified) {
           console.log(`[Status Check] User ${uid} is already verified in Firebase Auth.`);
           // If user exists and is verified, but no tracking doc, something went wrong.
           // Let's try to recover by creating a user record if it doesn't exist.
           let dbUser = await UserHelpers.getUserById(uid);
           if (!dbUser) {
             dbUser = await UserHelpers.createUserWithUID(uid, {
               email: user.email,
               name: user.displayName || 'User',
               emailVerified: true,
             });
           }
           const customToken = await admin.auth().createCustomToken(uid);
           return res.json({ status: 'verified', customToken, user: dbUser });
        }
      } catch (userError) {
        // User does not exist in Firebase Auth either.
        return res.status(404).json({ status: 'not_found', message: 'Registration not found.' });
      }
      return res.status(404).json({ status: 'not_found', message: 'Registration process not initiated.' });
    }

    const trackingData = trackingDoc.data();
    console.log(`[Status Check] Tracking status for ${uid}: ${trackingData.status}`);

    if (trackingData.status === 'verified') {
      // The user is verified. Let's ensure they exist in our main 'users' collection.
      let user = await UserHelpers.getUserById(uid);
      if (!user) {
        console.log(`[Status Check] User ${uid} verified, but not in DB. Creating now.`);
        // If the user document doesn't exist, create it now.
        const firebaseUser = await admin.auth().getUser(uid);
        user = await UserHelpers.createUserWithUID(uid, {
          email: firebaseUser.email,
          name: trackingData.name || firebaseUser.displayName,
          emailVerified: true,
          role: 'viewer', // Default role for new users
          isTemporarilySuspended: false, // Not suspended initially
          suspendedAt: null,
          suspensionReason: null
        });
      }
      
      // Generate a custom token for login
      const customToken = await admin.auth().createCustomToken(uid);
      console.log(`[Status Check] Generated token for verified user ${uid}.`);
      
      return res.json({
        status: 'verified',
        customToken,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      });
    }

    // If not verified, just return the pending status.
    res.json({ status: 'pending' });

  } catch (error) {
    console.error('❌ Error in getVerificationStatus:', error);
    res.status(500).json({ message: 'Server error while checking status.', error: error.message });
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
