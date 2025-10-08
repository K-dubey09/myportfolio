import mongoose from 'mongoose';

const accessKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  notes: { type: String },
}, {
  timestamps: true
});

export default mongoose.model('AccessKey', accessKeySchema);
