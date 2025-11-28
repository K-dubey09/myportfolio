import firebaseConfig from '../config/firebase.js';
import { admin } from '../config/firebase.js';

/**
 * User Consistency Check Middleware
 * Validates data consistency between Firebase Auth and Firestore
 */

const REQUIRED_FIELDS = ['email', 'name', 'role'];
const SUSPENSION_DURATION_DAYS = 30;

export const checkUserConsistency = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next();
    }

    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    
    const userId = req.user.userId;
    
    // Exempt admin users from consistency checks
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // User exists in Auth but not in Firestore - critical inconsistency
      await logInconsistency(userId, 'missing_firestore_record', {
        authUid: userId,
        timestamp: new Date().toISOString()
      });
      
      // Create minimal Firestore record
      await db.collection('users').doc(userId).set({
        uid: userId,
        email: req.user.email || '',
        name: '',
        role: 'viewer',
        isActive: false,
        isTemporarilySuspended: true,
        suspensionReason: 'Missing Firestore record',
        suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
        suspensionExpiresAt: new Date(Date.now() + SUSPENSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        dataIncomplete: true,
        missingFields: REQUIRED_FIELDS,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      req.user.needsDataCompletion = true;
      req.user.isSuspended = true;
      return next();
    }
    
    const userData = userDoc.data();
    
    // Check if user is already suspended
    if (userData.isTemporarilySuspended) {
      const expiresAt = new Date(userData.suspensionExpiresAt);
      const now = new Date();
      
      // Check if suspension has expired
      if (now > expiresAt) {
        // Delete account after 30 days
        await deleteExpiredAccount(userId, userData);
        return res.status(403).json({
          success: false,
          error: 'Account deleted due to incomplete data',
          message: 'Your account has been deleted as required information was not provided within 30 days.'
        });
      }
      
      req.user.needsDataCompletion = true;
      req.user.isSuspended = true;
      req.user.suspensionExpiresAt = userData.suspensionExpiresAt;
      req.user.missingFields = userData.missingFields || [];
      return next();
    }
    
    // Get user from Firebase Auth
    let authUser;
    try {
      authUser = await auth.getUser(userId);
    } catch (error) {
      // Auth record missing but Firestore exists
      await logInconsistency(userId, 'missing_auth_record', {
        firestoreData: userData,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        error: 'Authentication record missing',
        message: 'Please contact support to restore your account.'
      });
    }
    
    // Check for data inconsistencies
    const inconsistencies = [];
    const missingFields = [];
    
    // Check email consistency
    if (authUser.email !== userData.email) {
      inconsistencies.push({
        field: 'email',
        authValue: authUser.email,
        firestoreValue: userData.email
      });
    }
    
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!userData[field] || userData[field].trim() === '') {
        missingFields.push(field);
      }
    });
    
    // Check custom claims vs Firestore role
    const customClaims = authUser.customClaims || {};
    if (customClaims.role !== userData.role) {
      inconsistencies.push({
        field: 'role',
        authValue: customClaims.role,
        firestoreValue: userData.role
      });
    }
    
    // If inconsistencies found, suspend user
    if (inconsistencies.length > 0 || missingFields.length > 0) {
      await suspendUserForInconsistency(userId, userData, inconsistencies, missingFields);
      
      req.user.needsDataCompletion = true;
      req.user.isSuspended = true;
      req.user.inconsistencies = inconsistencies;
      req.user.missingFields = missingFields;
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in user consistency check:', error);
    next();
  }
};

/**
 * Suspend user due to data inconsistency
 */
async function suspendUserForInconsistency(userId, userData, inconsistencies, missingFields) {
  await firebaseConfig.initialize();
  const db = firebaseConfig.getFirestore();
  
  const suspensionExpiresAt = new Date(Date.now() + SUSPENSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  
  await db.collection('users').doc(userId).update({
    isTemporarilySuspended: true,
    suspensionReason: 'Data inconsistency detected',
    suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
    suspensionExpiresAt: suspensionExpiresAt,
    dataIncomplete: missingFields.length > 0,
    missingFields: missingFields,
    inconsistencies: inconsistencies,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Log the inconsistency
  await logInconsistency(userId, 'data_mismatch', {
    userData,
    inconsistencies,
    missingFields,
    suspensionExpiresAt
  });
}

/**
 * Log inconsistency to admin panel
 */
async function logInconsistency(userId, type, details) {
  await firebaseConfig.initialize();
  const db = firebaseConfig.getFirestore();
  
  await db.collection('userInconsistencyLogs').add({
    userId,
    type,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    resolved: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Delete expired suspended account
 */
async function deleteExpiredAccount(userId, userData) {
  await firebaseConfig.initialize();
  const db = firebaseConfig.getFirestore();
  const auth = firebaseConfig.getAuth();
  
  // Create deletion log
  await db.collection('deletedAccounts').add({
    userId,
    userData,
    reason: 'Suspension expired - incomplete data',
    deletedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Log final inconsistency
  await logInconsistency(userId, 'account_deleted', {
    reason: 'Suspension expired',
    userData,
    deletedAt: new Date().toISOString()
  });
  
  // Delete from Firestore
  await db.collection('users').doc(userId).delete();
  
  // Delete from Firebase Auth
  try {
    await auth.deleteUser(userId);
  } catch (error) {
    console.error('Error deleting auth user:', error);
  }
}

/**
 * Middleware to block suspended users from protected routes
 */
export const blockSuspendedUsers = (req, res, next) => {
  if (req.user && req.user.isSuspended) {
    // Allow access only to data completion and logout routes
    const allowedPaths = ['/api/auth/profile', '/api/auth/logout', '/api/auth/complete-profile'];
    
    if (!allowedPaths.some(path => req.path.startsWith(path))) {
      return res.status(403).json({
        success: false,
        error: 'Account suspended',
        message: 'Please complete your profile information to restore access.',
        needsDataCompletion: true,
        suspensionExpiresAt: req.user.suspensionExpiresAt,
        missingFields: req.user.missingFields || [],
        inconsistencies: req.user.inconsistencies || []
      });
    }
  }
  
  next();
};

export default {
  checkUserConsistency,
  blockSuspendedUsers
};
