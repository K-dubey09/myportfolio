import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  date: { type: Date },
  organization: { type: String },
  number: { type: Number },
  unit: { type: String },
  verificationUrl: { type: String },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', AchievementSchema);

export default Achievement;
