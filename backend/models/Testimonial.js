import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String },
  company: { type: String },
  testimonial: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  avatar: { type: String }, // GridFS file ID or URL
  email: { type: String },
  linkedinUrl: { type: String },
  approved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  projectRelated: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
}, {
  timestamps: true
});

export default mongoose.model('Testimonial', testimonialSchema);