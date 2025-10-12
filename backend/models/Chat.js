import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  // createdAt is set server-side; keep default for safety
  createdAt: { type: Date, default: Date.now },
  // verification fields: backend will mark messages as verified and attach who/when
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const ChatSchema = new mongoose.Schema({
  subject: { type: String, default: '' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // per-user last read timestamps to compute unread counts
  lastReads: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, lastReadAt: { type: Date } }],
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ChatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index participants for faster membership queries
ChatSchema.index({ participants: 1 });

export default mongoose.model('Chat', ChatSchema);
