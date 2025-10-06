import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String },
  company: { type: String },
  content: { type: String, required: true }, // Changed from 'testimonial' to 'content' for consistency
  testimonial: { type: String }, // Keep old field for backwards compatibility
  rating: { type: Number, min: 1, max: 5, default: 5 },
  imageUrl: { type: String }, // GridFS file ID or URL - OPTIONAL
  avatar: { type: String }, // GridFS file ID or URL - OPTIONAL (backwards compatibility)
  email: { type: String },
  linkedinUrl: { type: String },
  approved: { type: Boolean, default: true }, // Default to true for admin-added testimonials
  featured: { type: Boolean, default: false },
  projectRelated: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
}, {
  timestamps: true
});

// Ensure content field is populated from testimonial field if content is empty
testimonialSchema.pre('save', function(next) {
  if (!this.content && this.testimonial) {
    this.content = this.testimonial;
  }
  if (!this.imageUrl && this.avatar) {
    this.imageUrl = this.avatar;
  }
  next();
});

export default mongoose.model('Testimonial', testimonialSchema);