import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  percentage: { type: Number, min: 0, max: 100 },
  icon: { type: String }, // Icon name or URL
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Skill', skillSchema);