import firebaseConfig, { admin } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Access Keys Controller
 * Manages API access keys for third-party integrations
 */

// Generate a random access key
const generateAccessKey = () => {
  return `ak_${uuidv4().replace(/-/g, '')}`;
};

// Get all access keys
export const getAllAccessKeys = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const accessKeysRef = db.collection('accessKeys');
    const snapshot = await accessKeysRef.orderBy('createdAt', 'desc').get();
    
    const accessKeys = [];
    snapshot.forEach(doc => {
      accessKeys.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: accessKeys
    });
  } catch (error) {
    console.error('Error fetching access keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch access keys',
      message: error.message
    });
  }
};

// Create a new access key
export const createAccessKey = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const { notes } = req.body;
    const createdBy = req.user.userId;

    const newAccessKey = {
      key: generateAccessKey(),
      notes: notes || '',
      createdBy,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: true,
      usageCount: 0
    };

    const docRef = await db.collection('accessKeys').add(newAccessKey);

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...newAccessKey
      },
      message: 'Access key created successfully'
    });
  } catch (error) {
    console.error('Error creating access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create access key',
      message: error.message
    });
  }
};

// Delete an access key
export const deleteAccessKey = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const { id } = req.params;

    await db.collection('accessKeys').doc(id).delete();

    res.json({
      success: true,
      message: 'Access key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete access key',
      message: error.message
    });
  }
};

// Update access key usage
export const updateAccessKeyUsage = async (keyId) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const keyRef = db.collection('accessKeys').doc(keyId);
    await keyRef.update({
      lastUsed: new Date().toISOString(),
      usageCount: admin.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    console.error('Error updating access key usage:', error);
  }
};

// Validate access key
export const validateAccessKey = async (key) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const snapshot = await db.collection('accessKeys')
      .where('key', '==', key)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { valid: false };
    }

    const doc = snapshot.docs[0];
    await updateAccessKeyUsage(doc.id);

    return {
      valid: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    };
  } catch (error) {
    console.error('Error validating access key:', error);
    return { valid: false };
  }
};

export const AccessKeysController = {
  getAllAccessKeys,
  createAccessKey,
  deleteAccessKey,
  validateAccessKey
};

export default AccessKeysController;
