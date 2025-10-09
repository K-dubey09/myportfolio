import Chat from '../models/Chat.js';
import User from '../models/User.js';

const ChatController = {
  // Create a new chat (user initiated)
  createChat: async (req, res) => {
    try {
      const { subject, participantIds } = req.body;
      const participants = Array.isArray(participantIds) && participantIds.length ? participantIds : [req.user._id];

      const chat = new Chat({ subject: subject || '', participants });
      await chat.save();

      res.status(201).json({ success: true, data: chat });
    } catch (error) {
      console.error('createChat error', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  },

  // List chats for authenticated user
  listUserChats: async (req, res) => {
    try {
      const userId = req.user._id;
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name email role')
        .sort({ updatedAt: -1 })
        .lean();

      res.json({ success: true, data: chats });
    } catch (error) {
      console.error('listUserChats error', error);
      res.status(500).json({ error: 'Failed to list chats' });
    }
  },

  // Admin: list all chats
  listAllChats: async (req, res) => {
    try {
      const chats = await Chat.find()
        .populate('participants', 'name email role')
        .sort({ updatedAt: -1 })
        .lean();
      res.json({ success: true, data: chats });
    } catch (error) {
      console.error('listAllChats error', error);
      res.status(500).json({ error: 'Failed to list chats' });
    }
  },

  // Get single chat (user must be participant or admin)
  getChat: async (req, res) => {
    try {
      const chatId = req.params.id;
      // populate participants and messages.author
      const chat = await Chat.findById(chatId)
        .populate('participants', 'name email role')
        .populate({ path: 'messages.author', select: 'name email avatar' });
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      // If user is not a participant and not admin, forbid
      if (!req.user || !(req.user.role === 'admin' || chat.participants.some(p => String(p._id) === String(req.user._id)))) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({ success: true, data: chat });
    } catch (error) {
      console.error('getChat error', error);
      res.status(500).json({ error: 'Failed to get chat' });
    }
  },

  // Post a message to a chat (participant or admin)
  postMessage: async (req, res) => {
    try {
      const chatId = req.params.id;
      const { text } = req.body;
      if (!text || !text.trim()) return res.status(400).json({ error: 'Message text required' });

      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      // Authorization: allow if participant or admin
      const isParticipant = chat.participants.some(p => String(p) === String(req.user._id));
      if (!(isParticipant || req.user.role === 'admin')) return res.status(403).json({ error: 'Forbidden' });

      const message = { author: req.user._id, text };
      chat.messages.push(message);
      await chat.save();

      // populate the newly added message's author
      const added = chat.messages[chat.messages.length - 1];
      const populated = await Chat.findById(chat._id).select('messages').populate({ path: 'messages.author', select: 'name email avatar' });
      const latest = populated.messages[populated.messages.length - 1];
      res.status(201).json({ success: true, data: latest });
    } catch (error) {
      console.error('postMessage error', error);
      res.status(500).json({ error: 'Failed to post message' });
    }
  }
};

export default ChatController;
