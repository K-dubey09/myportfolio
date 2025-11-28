import firebaseConfig from '../config/firebase.js';
import { admin } from '../config/firebase.js';

/**
 * Complete User Profile Controller
 * Handles profile completion for suspended users
 */

// Get current user profile with suspension details
export const getProfileCompletionStatus = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const userId = req.user.userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: {
        email: userData.email,
        name: userData.name || '',
        role: userData.role,
        isTemporarilySuspended: userData.isTemporarilySuspended || false,
        suspensionReason: userData.suspensionReason || '',
        suspendedAt: userData.suspendedAt,
        suspensionExpiresAt: userData.suspensionExpiresAt,
        dataIncomplete: userData.dataIncomplete || false,
        missingFields: userData.missingFields || [],
        inconsistencies: userData.inconsistencies || [],
        daysRemaining: userData.suspensionExpiresAt ? 
          Math.ceil((new Date(userData.suspensionExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching profile completion status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile status',
      message: error.message
    });
  }
};

// Complete user profile and restore access
export const completeProfile = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    const userId = req.user.userId;
    
    const { name, email } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name and email are required'
      });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    
    // Update Firestore
    await db.collection('users').doc(userId).update({
      name: name.trim(),
      email: email.trim(),
      isTemporarilySuspended: false,
      suspensionReason: null,
      suspendedAt: null,
      suspensionExpiresAt: null,
      dataIncomplete: false,
      missingFields: [],
      inconsistencies: [],
      profileCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update Firebase Auth
    try {
      await auth.updateUser(userId, {
        email: email.trim(),
        displayName: name.trim()
      });
      
      // Update custom claims
      await auth.setCustomUserClaims(userId, {
        role: userData.role,
        permissions: userData.permissions || {}
      });
    } catch (error) {
      console.error('Error updating auth user:', error);
      // Continue even if auth update fails
    }
    
    // Log profile completion
    await db.collection('userInconsistencyLogs').add({
      userId,
      type: 'profile_completed',
      details: {
        previousData: userData,
        newData: { name, email },
        completedAt: new Date().toISOString()
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      resolved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      message: 'Profile completed successfully. Your account has been restored.',
      data: {
        name,
        email,
        role: userData.role,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete profile',
      message: error.message
    });
  }
};

export const ProfileCompletionController = {
  getProfileCompletionStatus,
  completeProfile
};

export default ProfileCompletionController;
