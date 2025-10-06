import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true }, // GridFS file ID or URL
  category: { type: String },
  tags: [{ type: String }],
  alt: { type: String }, // Alt text for accessibility
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }, // For custom ordering
  metadata: {
    camera: { type: String },
    lens: { type: String },
    settings: { type: String },
    location: { type: String },
    dateTaken: { type: Date }
  }
}, {
  timestamps: true
});

export default mongoose.model('Gallery', gallerySchema);