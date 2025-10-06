import User from '../models/User.js';

export const UserController = {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await User.find({}, '-password')
        .sort({ createdAt: -1 });

      res.json({
        users,
        total: users.length
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Get user by ID (admin only)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id, '-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Update user role and permissions (admin only)
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role, isActive, permissions } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent admin from changing their own role
      if (user._id.toString() === req.user.userId && role && role !== 'admin') {
        return res.status(400).json({ error: 'Cannot change your own admin role' });
      }

      // Update fields
      if (role) user.role = role;
      if (typeof isActive === 'boolean') user.isActive = isActive;
      if (permissions) {
        user.permissions = { ...user.permissions, ...permissions };
      }

      await user.save();

      res.json({
        message: 'User updated successfully',
        user: await User.findById(id, '-password')
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  // Get user statistics (admin only)
  async getUserStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const adminUsers = await User.countDocuments({ role: 'admin' });
      const editorUsers = await User.countDocuments({ role: 'editor' });
      const viewerUsers = await User.countDocuments({ role: 'viewer' });

      const recentUsers = await User.find({}, 'name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
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
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  }
};