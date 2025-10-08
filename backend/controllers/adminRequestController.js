import AdminRequest from '../models/AdminRequest.js';
import User from '../models/User.js';
import ConversionLog from '../models/ConversionLog.js';

export const AdminRequestController = {
  async createRequest(req, res) {
    try {
      const { message } = req.body;
      const existing = await AdminRequest.findOne({ user: req.user.userId, status: 'pending' });
      if (existing) return res.status(400).json({ success: false, error: 'Request already pending' });

      const doc = new AdminRequest({ user: req.user.userId, message: message || '' });
      await doc.save();
      res.json({ success: true, data: doc });
    } catch (error) {
      console.error('Create admin request error:', error);
      res.status(500).json({ success: false, error: 'Failed to create request' });
    }
  },

  // Admin: list requests
  async listRequests(req, res) {
    try {
      const list = await AdminRequest.find().populate('user', 'name email role').sort({ createdAt: -1 }).lean();
      res.json({ success: true, data: list });
    } catch (error) {
      console.error('List admin requests error:', error);
      res.status(500).json({ success: false, error: 'Failed to list requests' });
    }
  },

  // Admin: approve a request (promote user to editor)
  async approveRequest(req, res) {
    try {
      const { id } = req.params; // request id
      const reqDoc = await AdminRequest.findById(id);
      if (!reqDoc) return res.status(404).json({ success: false, error: 'Request not found' });
      if (reqDoc.status !== 'pending') return res.status(400).json({ success: false, error: 'Request already processed' });

      const user = await User.findById(reqDoc.user);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const oldRole = user.role;
      user.role = 'editor';
      await user.save();

      reqDoc.status = 'approved';
      await reqDoc.save();

      const log = new ConversionLog({ user: user._id, keyUsed: 'admin-approval', changedBy: req.user.userId, fromRole: oldRole, toRole: 'editor' });
      await log.save();

      res.json({ success: true, user: user.toJSON(), request: reqDoc, log });
    } catch (error) {
      console.error('Approve request error:', error);
      res.status(500).json({ success: false, error: 'Failed to approve request' });
    }
  },


  // Admin: reject a request (mark rejected)
  async rejectRequest(req, res) {
    try {
      const { id } = req.params; // request id
      const reqDoc = await AdminRequest.findById(id);
      if (!reqDoc) return res.status(404).json({ success: false, error: 'Request not found' });
      if (reqDoc.status !== 'pending') return res.status(400).json({ success: false, error: 'Request already processed' });

      reqDoc.status = 'rejected';
      await reqDoc.save();

      res.json({ success: true, request: reqDoc });
    } catch (error) {
      console.error('Reject request error:', error);
      res.status(500).json({ success: false, error: 'Failed to reject request' });
    }
  }
};

export default AdminRequestController;
