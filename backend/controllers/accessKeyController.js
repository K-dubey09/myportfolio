import AccessKey from '../models/AccessKey.js';
import ConversionLog from '../models/ConversionLog.js';
import User from '../models/User.js';
import crypto from 'crypto';

const generateUniqueKey = () => {
  // generate a URL-safe 32-char string
  return crypto.randomBytes(24).toString('base64url');
};

export const AccessKeyController = {
  // Admin: create a new access key
  async createKey(req, res) {
    try {
      const key = generateUniqueKey();
      const doc = new AccessKey({ key, createdBy: req.user.userId, notes: req.body.notes || '' });
      await doc.save();
      res.json({ success: true, key: doc });
    } catch (error) {
      console.error('Create key error:', error);
      res.status(500).json({ success: false, error: 'Failed to create key' });
    }
  },

  // Admin: list active keys
  async listKeys(req, res) {
    try {
      const keys = await AccessKey.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, data: keys });
    } catch (error) {
      console.error('List keys error:', error);
      res.status(500).json({ success: false, error: 'Failed to list keys' });
    }
  },

  // Admin: delete a key
  async deleteKey(req, res) {
    try {
      const { id } = req.params;
      await AccessKey.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete key error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete key' });
    }
  },

  // Public: use a key to convert a viewer to editor (one-time)
  async useKey(req, res) {
    try {
      const { key } = req.body;
      if (!key) return res.status(400).json({ success: false, error: 'Key required' });

      // Find and delete key atomically
      const doc = await AccessKey.findOneAndDelete({ key });
      if (!doc) return res.status(404).json({ success: false, error: 'Key not found or already used' });

      // Promote user
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const oldRole = user.role;
      user.role = 'editor';
      await user.save();

      const log = new ConversionLog({ user: user._id, keyUsed: key, changedBy: doc.createdBy || null, fromRole: oldRole, toRole: 'editor' });
      await log.save();

      res.json({ success: true, message: 'Converted to editor', user: user.toJSON(), log });
    } catch (error) {
      console.error('Use key error:', error);
      res.status(500).json({ success: false, error: 'Failed to use key' });
    }
  },

  // Admin: list conversion logs
  async listConversions(req, res) {
    try {
      const logs = await ConversionLog.find().populate('user', 'name email role').populate('changedBy', 'name email').sort({ usedAt: -1 }).lean();
      res.json({ success: true, data: logs });
    } catch (error) {
      console.error('List conversions error:', error);
      res.status(500).json({ success: false, error: 'Failed to list conversions' });
    }
  },

  // Admin: revert a user's role back to viewer
  async revertUser(req, res) {
    try {
      const { id } = req.params; // user id
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const oldRole = user.role;
      user.role = 'viewer';
      await user.save();

      const log = new ConversionLog({ user: user._id, keyUsed: 'admin-revert', changedBy: req.user.userId, fromRole: oldRole, toRole: 'viewer' });
      await log.save();

      res.json({ success: true, user: user.toJSON(), log });
    } catch (error) {
      console.error('Revert user error:', error);
      res.status(500).json({ success: false, error: 'Failed to revert user' });
    }
  }
};

export default AccessKeyController;
