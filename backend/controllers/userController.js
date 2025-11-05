import firebaseConfig from '../config/firebase.js';

const db = firebaseConfig.getFirestore();

export const UserController = {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
      const users = usersSnapshot.docs.map(doc => {
        const { password, ...userData } = doc.data();
        return {
          id: doc.id,
          ...userData
        };
      });

      res.json({
        success: true,
        data: users,
        users, // For backward compatibility
        total: users.length
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch users' 
      });
    }
  },

  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const userDoc = await db.collection('users').doc(id).get();

      if (!userDoc.exists) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const { password, ...userData } = userDoc.data();
      res.json({
        success: true,
        data: {
          id: userDoc.id,
          ...userData
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user' 
      });
    }
  },

  // Update user role and permissions (admin only)
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role, isActive, permissions } = req.body;

      const userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const user = userDoc.data();

      // Protect admin/root admin accounts from being modified
      const protectedRoles = ['admin', 'root admin'];
      if (protectedRoles.includes((user.role || '').toLowerCase())) {
        return res.status(403).json({ 
          success: false,
          error: 'Action not allowed on admin/root admin users' 
        });
      }

      // Prevent admin from changing their own role
      if (id === req.user.userId && role && role !== 'admin') {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot change your own admin role' 
        });
      }

      // Build update object
      const updates = {
        updatedAt: new Date()
      };
      
      if (role) {
        updates.role = role;
        // Update permissions based on role
        if (role === 'admin') {
          updates.permissions = {
            canCreatePosts: true,
            canEditPosts: true,
            canDeletePosts: true,
            canManageUsers: true,
            canEditProfile: true,
            canUploadFiles: true,
            canViewAnalytics: true
          };
        } else if (role === 'editor') {
          updates.permissions = {
            canCreatePosts: true,
            canEditPosts: true,
            canDeletePosts: false,
            canManageUsers: false,
            canEditProfile: true,
            canUploadFiles: true,
            canViewAnalytics: false
          };
        } else {
          updates.permissions = {
            canCreatePosts: false,
            canEditPosts: false,
            canDeletePosts: false,
            canManageUsers: false,
            canEditProfile: false,
            canUploadFiles: false,
            canViewAnalytics: false
          };
        }
      }
      
      if (typeof isActive === 'boolean') updates.isActive = isActive;
      if (permissions) updates.permissions = { ...user.permissions, ...permissions };

      await db.collection('users').doc(id).update(updates);

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update user' 
      });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.userId) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot delete your own account' 
        });
      }

      const userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const user = userDoc.data();

      // Protect admin/root admin accounts from deletion
      const protectedRoles = ['admin', 'root admin'];
      if (protectedRoles.includes((user.role || '').toLowerCase())) {
        return res.status(403).json({ 
          success: false,
          error: 'Action not allowed on admin/root admin users' 
        });
      }

      await db.collection('users').doc(id).delete();

      res.json({ 
        success: true,
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete user' 
      });
    }
  },

  // Get user statistics (admin only)
  async getUserStats(req, res) {
    try {
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => doc.data());

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const editorUsers = users.filter(u => u.role === 'editor').length;
      const viewerUsers = users.filter(u => u.role === 'viewer').length;

      const recentUsersSnapshot = await db.collection('users')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      const recentUsers = recentUsersSnapshot.docs.map(doc => {
        const { password, ...userData } = doc.data();
        return {
          id: doc.id,
          ...userData
        };
      });

      res.json({
        success: true,
        data: {
          statistics: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
            roles: {
              admin: adminUsers,
              editor: editorUsers,
              viewer: viewerUsers
            }
          },
          recentUsers
        },
        statistics: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          roles: {
            admin: adminUsers,
            editor: editorUsers,
            viewer: viewerUsers
          }
        },
        recentUsers
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user statistics' 
      });
    }
  },

  // Assign or generate a unique userId for a user (admin only)
  async assignUserNumber(req, res) {
    try {
      const { id } = req.params;
      const { userId: providedUserId } = req.body || {};

      const userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const user = userDoc.data();

      // Do not allow assigning/altering userId for protected roles
      const protectedRoles = ['admin', 'root admin'];
      if (protectedRoles.includes((user.role || '').toLowerCase())) {
        return res.status(403).json({ 
          success: false,
          error: 'Action not allowed on admin/root admin users' 
        });
      }

      // If a userId was provided, validate it
      if (providedUserId) {
        const candidate = String(providedUserId).trim();
        if (!/^[A-Za-z0-9_-]{4,32}$/.test(candidate)) {
          return res.status(400).json({ 
            success: false,
            error: 'Invalid userId format. Allowed: letters, numbers, _ and -, length 4-32.' 
          });
        }

        // Check uniqueness
        const existingSnapshot = await db.collection('users')
          .where('userId', '==', candidate)
          .limit(1)
          .get();
        
        if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== id) {
          return res.status(409).json({ 
            success: false,
            error: 'userId already in use' 
          });
        }

        await db.collection('users').doc(id).update({
          userId: candidate,
          updatedAt: new Date()
        });
        
        return res.json({ 
          success: true,
          message: 'userId assigned',
          data: { userId: candidate }
        });
      }

      // Generate a unique userId
      const timestamp = Date.now();
      const formatted = `USER${timestamp}`;

      await db.collection('users').doc(id).update({
        userId: formatted,
        updatedAt: new Date()
      });
      
      return res.json({ 
        success: true,
        message: 'userId generated',
        data: { userId: formatted }
      });
    } catch (error) {
      console.error('assignUserNumber error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to assign userId' 
      });
    }
  }
};