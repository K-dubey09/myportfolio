import Chat from '../models/Chat.js';
import User from '../models/User.js';

const ChatController = {
  // Create a new chat (user initiated)
  createChat: async (req, res) => {
    try {
      const { subject, participantIds } = req.body;
      // Normalize participants: ensure requester is included and entries are unique
      let participants = Array.isArray(participantIds) ? participantIds.filter(Boolean).map(String) : [];
      const reqId = String(req.user._id || req.user.userId || req.user.id);
      if (!participants.includes(reqId)) participants.push(reqId);
      participants = Array.from(new Set(participants));

      // If this is a 1:1 chat (exactly two participants), try to find an existing chat with the same two participants
      if (participants.length === 2) {
        try {
          const existing = await Chat.findOne({ participants: { $all: participants } })
            .populate('participants', 'name email role');
          if (existing && Array.isArray(existing.participants) && existing.participants.length === 2) {
            return res.json({ success: true, data: existing });
          }
        } catch (e) {
          // fall through to create new chat if lookup fails
          console.debug('createChat: existing chat lookup failed', e);
        }
      }

      const chat = new Chat({ subject: subject || '', participants });
      await chat.save();
      const populated = await Chat.findById(chat._id).populate('participants', 'name email role');
      res.status(201).json({ success: true, data: populated });
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
        .populate('participants', 'name email avatar role')
        .lean();

      // Compute lastMessage and unreadCount per chat; ensure lastMessage.author contains name/avatar
      const enriched = await Promise.all(chats.map(async (chat) => {
        const lastMessage = (Array.isArray(chat.messages) && chat.messages.length) ? chat.messages[chat.messages.length - 1] : null;
        // find lastRead timestamp for this user
        const lr = Array.isArray(chat.lastReads) ? chat.lastReads.find(l => String(l.user) === String(userId)) : null;
        const lastReadAt = lr && lr.lastReadAt ? new Date(lr.lastReadAt) : null;
        let unreadCount = 0;
        if (lastMessage && !lastReadAt) {
          unreadCount = chat.messages.length;
        } else if (lastMessage && lastReadAt) {
          unreadCount = chat.messages.filter(m => new Date(m.createdAt) > lastReadAt).length;
        }

        // Populate lastMessage.author details (name, avatar) if author is object id or embedded
        let lastMessagePop = null;
        if (lastMessage) {
          if (lastMessage.author && typeof lastMessage.author === 'object' && (lastMessage.author.name || lastMessage.author.avatar)) {
            lastMessagePop = { 
              text: lastMessage.text, 
              createdAt: lastMessage.createdAt, 
              verifiedAt: lastMessage.verifiedAt,
              verified: lastMessage.verified,
              verifiedBy: lastMessage.verifiedBy,
              author: { _id: lastMessage.author._id || lastMessage.author.id, name: lastMessage.author.name, avatar: lastMessage.author.avatar } 
            };
          } else if (lastMessage.author) {
            try {
              const u = await User.findById(lastMessage.author, 'name avatar');
              lastMessagePop = { 
                text: lastMessage.text, 
                createdAt: lastMessage.createdAt, 
                verifiedAt: lastMessage.verifiedAt,
                verified: lastMessage.verified,
                verifiedBy: lastMessage.verifiedBy,
                author: u ? { _id: u._id, name: u.name, avatar: u.avatar } : null 
              };
            } catch (e) {
              lastMessagePop = { 
                text: lastMessage.text, 
                createdAt: lastMessage.createdAt, 
                verifiedAt: lastMessage.verifiedAt,
                verified: lastMessage.verified,
                verifiedBy: lastMessage.verifiedBy,
                author: null 
              };
            }
          }
        }

        return { ...chat, lastMessage: lastMessagePop, unreadCount };
      }));

      // Sort chats by most recent message time (prefer verifiedAt, fall back to createdAt, then updatedAt)
      enriched.sort((a, b) => {
        const getTime = (chat) => {
          if (chat.lastMessage?.verifiedAt) return new Date(chat.lastMessage.verifiedAt).getTime();
          if (chat.lastMessage?.createdAt) return new Date(chat.lastMessage.createdAt).getTime();
          if (chat.updatedAt) return new Date(chat.updatedAt).getTime();
          if (chat.createdAt) return new Date(chat.createdAt).getTime();
          return 0;
        };
        return getTime(b) - getTime(a); // descending order (most recent first)
      });

      res.json({ success: true, data: enriched });
    } catch (error) {
      console.error('listUserChats error', error);
      res.status(500).json({ error: 'Failed to list chats' });
    }
  },

  // Mark chat as read for current user
  markRead: async (req, res) => {
    try {
      const chatId = req.params.id;
      const userId = req.user._id;
      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      if (!chat.participants.some(p => String(p) === String(userId))) return res.status(403).json({ error: 'Forbidden' });

      const now = new Date();
      chat.lastReads = chat.lastReads || [];
      const existing = chat.lastReads.find(l => String(l.user) === String(userId));
      if (existing) existing.lastReadAt = now; else chat.lastReads.push({ user: userId, lastReadAt: now });
      await chat.save();
      res.json({ success: true, message: 'Marked read' });
    } catch (error) {
      console.error('markRead error', error);
      res.status(500).json({ error: 'Failed to mark read' });
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

  // Create message with server-side verified metadata
  const now = new Date();
  const message = { author: req.user._id, text, createdAt: now, verified: true, verifiedAt: now, verifiedBy: req.user._id };
  chat.messages.push(message);
  await chat.save();

      // populate the newly added message's author
      const added = chat.messages[chat.messages.length - 1];
      // populate the added message's author and verifier details
      const populated = await Chat.findById(chat._id)
        .select('messages')
        .populate({ path: 'messages.author', select: 'name email avatar' })
        .populate({ path: 'messages.verifiedBy', select: 'name email' });
      const latest = populated.messages[populated.messages.length - 1];
      res.status(201).json({ success: true, data: latest });
    } catch (error) {
      console.error('postMessage error', error);
      res.status(500).json({ error: 'Failed to post message' });
    }
  }

  // Add a participant to a chat
  ,addParticipant: async (req, res) => {
    try {
      const chatId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      // Only participants or admins may add others
      const isParticipant = chat.participants.some(p => String(p) === String(req.user._id));
      if (!(isParticipant || req.user.role === 'admin')) return res.status(403).json({ error: 'Forbidden' });

      // Prevent duplicates
      if (chat.participants.some(p => String(p) === String(userId))) {
        return res.status(409).json({ error: 'User already in chat' });
      }

      // Ensure the user exists
      const u = await User.findById(userId);
      if (!u) return res.status(404).json({ error: 'User to add not found' });

      chat.participants.push(u._id);
      await chat.save();

      // Return updated chat with populated participants
      const updated = await Chat.findById(chat._id).populate('participants', 'name email avatar role');
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('addParticipant error', error);
      res.status(500).json({ error: 'Failed to add participant' });
    }
  }
};

export default ChatController;
