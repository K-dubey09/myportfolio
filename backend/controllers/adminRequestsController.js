import firebaseConfig from '../config/firebase.js';

/**
 * Admin Requests Controller
 * Manages user role upgrade requests
 */

// Get all admin requests
export const getAllRequests = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const requestsRef = db.collection('adminRequests');
    const snapshot = await requestsRef.orderBy('createdAt', 'desc').get();
    
    const requests = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Fetch user details
      let userData = null;
      if (data.userId) {
        const userDoc = await db.collection('users').doc(data.userId).get();
        if (userDoc.exists) {
          const user = userDoc.data();
          userData = {
            email: user.email,
            fullName: user.fullName || user.email,
            currentRole: user.role
          };
        }
      }
      
      requests.push({
        id: doc.id,
        ...data,
        user: userData
      });
    }

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin requests',
      message: error.message
    });
  }
};

// Create a new admin request
export const createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestedRole, reason } = req.body;

    // Check if user already has a pending request
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const existingRequest = await db.collection('adminRequests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequest.empty) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending request'
      });
    }

    const newRequest = {
      userId,
      requestedRole: requestedRole || 'editor',
      reason: reason || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('adminRequests').add(newRequest);

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...newRequest
      },
      message: 'Request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating admin request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request',
      message: error.message
    });
  }
};

// Approve admin request
export const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const approvedBy = req.user.userId;

    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const requestDoc = await db.collection('adminRequests').doc(requestId).get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const requestData = requestDoc.data();

    // Update user role
    await db.collection('users').doc(requestData.userId).update({
      role: requestData.requestedRole,
      permissions: getPermissionsByRole(requestData.requestedRole),
      updatedAt: new Date().toISOString()
    });

    // Update request status
    await db.collection('adminRequests').doc(requestId).update({
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Request approved successfully'
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve request',
      message: error.message
    });
  }
};

// Reject admin request
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const rejectedBy = req.user.userId;
    const { reason } = req.body;

    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const requestDoc = await db.collection('adminRequests').doc(requestId).get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Update request status
    await db.collection('adminRequests').doc(requestId).update({
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || '',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject request',
      message: error.message
    });
  }
};

// Revert user role
export const revertUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Revert to viewer role
    await db.collection('users').doc(userId).update({
      role: 'viewer',
      permissions: getPermissionsByRole('viewer'),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'User role reverted to viewer successfully'
    });
  } catch (error) {
    console.error('Error reverting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revert user',
      message: error.message
    });
  }
};

// Helper function to get permissions by role
const getPermissionsByRole = (role) => {
  const permissions = {
    viewer: {
      canViewContent: true,
      canCreatePosts: false,
      canEditPosts: false,
      canDeletePosts: false,
      canEditProfile: false,
      canManageUsers: false,
      canAccessAnalytics: false
    },
    editor: {
      canViewContent: true,
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canEditProfile: false,
      canManageUsers: false,
      canAccessAnalytics: true
    },
    admin: {
      canViewContent: true,
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canEditProfile: true,
      canManageUsers: true,
      canAccessAnalytics: true
    }
  };

  return permissions[role] || permissions.viewer;
};

export const AdminRequestsController = {
  getAllRequests,
  createRequest,
  approveRequest,
  rejectRequest,
  revertUser
};

export default AdminRequestsController;
