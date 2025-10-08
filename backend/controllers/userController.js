import User from '../models/User.js';
import Counter from '../models/Counter.js';

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
  ,

  // Assign or generate a unique userNumber for a user (admin only)
  async assignUserNumber(req, res) {
    try {
      const { id } = req.params;
      const { userNumber } = req.body || {};

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // If a userNumber was provided, validate it (alphanumeric, 4-32 chars)
      if (userNumber) {
        const candidate = String(userNumber).trim();
        if (!/^[A-Za-z0-9_-]{4,32}$/.test(candidate)) {
          return res.status(400).json({ error: 'Invalid userNumber format. Allowed: letters, numbers, _ and -, length 4-32.' });
        }

        // Check uniqueness
        const existing = await User.findOne({ userNumber: candidate });
        if (existing && existing._id.toString() !== id) {
          return res.status(409).json({ error: 'userNumber already in use' });
        }

        user.userNumber = candidate;
        await user.save();
        return res.json({ message: 'userNumber assigned', user: user.toJSON() });
      }

      // Otherwise generate a sequential number using Counter
      const counter = await Counter.findOneAndUpdate({ name: 'userNumber' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      const next = counter.seq;
      // Create a formatted userNumber, e.g. U000123
      const formatted = `U${String(next).padStart(6, '0')}`;

      // Ensure uniqueness just in case
      const exists = await User.findOne({ userNumber: formatted });
      if (exists) {
        // extremely unlikely, but handle by appending timestamp
        user.userNumber = `${formatted}-${Date.now().toString().slice(-4)}`;
      } else {
        user.userNumber = formatted;
      }

      await user.save();
      return res.json({ message: 'userNumber generated', user: user.toJSON() });
    } catch (error) {
      console.error('assignUserNumber error:', error);
      res.status(500).json({ error: 'Failed to assign userNumber' });
    }
  }
};