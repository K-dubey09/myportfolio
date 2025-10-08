import mongoose from 'mongoose';

const conversionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyUsed: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who approved if applicable
  fromRole: { type: String, enum: ['viewer','editor','admin'], required: true },
  toRole: { type: String, enum: ['viewer','editor','admin'], required: true },
  usedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('ConversionLog', conversionLogSchema);
