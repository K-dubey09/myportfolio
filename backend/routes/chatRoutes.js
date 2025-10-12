import express from 'express';
import ChatController from '../controllers/chatController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes (authenticated)
router.post('/', authenticateToken, ChatController.createChat); // create chat
router.get('/', authenticateToken, ChatController.listUserChats); // list user's chats
router.get('/:id', authenticateToken, ChatController.getChat); // get specific chat
router.post('/:id/messages', authenticateToken, ChatController.postMessage); // post message
// Add participant to chat
router.post('/:id/participants', authenticateToken, ChatController.addParticipant);
// Mark chat as read for current user
router.post('/:id/read', authenticateToken, ChatController.markRead);

// Admin routes (mounted separately under /api/admin/chats in server)
router.get('/admin/all', authenticateToken, requireAdmin, ChatController.listAllChats);

export default router;
