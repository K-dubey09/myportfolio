import firebaseConfig from '../config/firebase.js';

/**
 * User Inconsistency Logs Controller
 * Admin panel to view and manage user data inconsistencies
 */

// Get all inconsistency logs
export const getAllInconsistencyLogs = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    const { status, type, limit = 100 } = req.query;
    
    let query = db.collection('userInconsistencyLogs').orderBy('timestamp', 'desc');
    
    // Filter by resolution status
    if (status === 'resolved') {
      query = query.where('resolved', '==', true);
    } else if (status === 'unresolved') {
      query = query.where('resolved', '==', false);
    }
    
    // Filter by type
    if (type) {
      query = query.where('type', '==', type);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const logs = [];
    for (const doc of snapshot.docs) {
      const logData = doc.data();
      
      // Get user details
      let userData = null;
      if (logData.userId) {
        const userDoc = await db.collection('users').doc(logData.userId).get();
        if (userDoc.exists) {
          const user = userDoc.data();
          userData = {
            email: user.email,
            name: user.name,
            role: user.role,
            isTemporarilySuspended: user.isTemporarilySuspended
          };
        }
      }
      
      logs.push({
        id: doc.id,
        ...logData,
        user: userData,
        timestamp: logData.timestamp?.toDate?.()?.toISOString() || null
      });
    }
    
    res.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Error fetching inconsistency logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
};

// Get inconsistency logs for a specific user
export const getUserInconsistencyLogs = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const { userId } = req.params;
    
    const snapshot = await db.collection('userInconsistencyLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user logs',
      message: error.message
    });
  }
};

// Get deleted accounts log
export const getDeletedAccounts = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    const { limit = 100 } = req.query;
    
    const snapshot = await db.collection('deletedAccounts')
      .orderBy('deletedAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deletedAt: doc.data().deletedAt?.toDate?.()?.toISOString() || null
    }));
    
    res.json({
      success: true,
      data: accounts,
      total: accounts.length
    });
  } catch (error) {
    console.error('Error fetching deleted accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deleted accounts',
      message: error.message
    });
  }
};

// Mark inconsistency as resolved
export const markInconsistencyResolved = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const { logId } = req.params;
    const { notes } = req.body;
    
    await db.collection('userInconsistencyLogs').doc(logId).update({
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.user.userId,
      resolutionNotes: notes || ''
    });
    
    res.json({
      success: true,
      message: 'Inconsistency marked as resolved'
    });
  } catch (error) {
    console.error('Error marking inconsistency resolved:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update log',
      message: error.message
    });
  }
};

// Get inconsistency statistics
export const getInconsistencyStats = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    const [totalSnapshot, unresolvedSnapshot, suspendedSnapshot] = await Promise.all([
      db.collection('userInconsistencyLogs').count().get(),
      db.collection('userInconsistencyLogs').where('resolved', '==', false).count().get(),
      db.collection('users').where('isTemporarilySuspended', '==', true).count().get()
    ]);
    
    const stats = {
      totalInconsistencies: totalSnapshot.data().count,
      unresolvedInconsistencies: unresolvedSnapshot.data().count,
      suspendedUsers: suspendedSnapshot.data().count,
      resolvedInconsistencies: totalSnapshot.data().count - unresolvedSnapshot.data().count
    };
    
    // Get types breakdown
    const typeSnapshot = await db.collection('userInconsistencyLogs').get();
    const typeBreakdown = {};
    
    typeSnapshot.docs.forEach(doc => {
      const type = doc.data().type;
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });
    
    stats.typeBreakdown = typeBreakdown;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching inconsistency stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
};

// Manually restore user access (admin override)
export const restoreUserAccess = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const { userId } = req.params;
    const { notes } = req.body;
    
    await db.collection('users').doc(userId).update({
      isTemporarilySuspended: false,
      suspensionReason: null,
      suspendedAt: null,
      suspensionExpiresAt: null,
      dataIncomplete: false,
      missingFields: [],
      inconsistencies: [],
      manuallyRestored: true,
      restoredBy: req.user.userId,
      restoredAt: new Date().toISOString(),
      restorationNotes: notes || ''
    });
    
    // Log the manual restoration
    await db.collection('userInconsistencyLogs').add({
      userId,
      type: 'manual_restoration',
      details: {
        restoredBy: req.user.userId,
        notes,
        timestamp: new Date().toISOString()
      },
      resolved: true,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'User access restored successfully'
    });
  } catch (error) {
    console.error('Error restoring user access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore user access',
      message: error.message
    });
  }
};

export const InconsistencyLogsController = {
  getAllInconsistencyLogs,
  getUserInconsistencyLogs,
  getDeletedAccounts,
  markInconsistencyResolved,
  getInconsistencyStats,
  restoreUserAccess
};

export default InconsistencyLogsController;
