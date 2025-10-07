import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String, // GridFS filename or URL
    default: ''
  },
  images: [{
    type: String // Array of GridFS filenames or URLs
  }],
  price: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

serviceSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Service', serviceSchema);