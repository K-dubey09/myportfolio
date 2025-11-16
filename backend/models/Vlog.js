import mongoose from 'mongoose';

const vlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true }, // GridFS file ID for uploaded videos or YouTube URL
  thumbnailUrl: { type: String }, // GridFS file ID or URL - OPTIONAL
  thumbnail: { type: String }, // GridFS file ID or URL - OPTIONAL (backwards compatibility)
  duration: { type: String }, // e.g., "10:30"
  category: { type: String },
  tags: [{ type: String }],
  published: { type: Boolean, default: true },
  publishDate: { type: Date, default: Date.now },
  publishedDate: { type: Date, default: Date.now }, // For consistency with frontend
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  platform: { 
    type: String, 
    enum: ['YouTube', 'Vimeo', 'Instagram', 'TikTok', 'Self-hosted'],
    default: 'YouTube'
  },
  embedCode: { type: String }, // For external platforms
  // Language-specific content
  language: { type: String, default: 'en', enum: ['en', 'hi', 'es'] },
  translations: {
    en: {
      title: { type: String },
      description: { type: String }
    },
    hi: {
      title: { type: String },
      description: { type: String }
    },
    es: {
      title: { type: String },
      description: { type: String }
    }
  },
  // Language-specific video/thumbnail URLs
  languageMedia: {
    en: { 
      videoUrl: { type: String },
      thumbnailUrl: { type: String }
    },
    hi: { 
      videoUrl: { type: String },
      thumbnailUrl: { type: String }
    },
    es: { 
      videoUrl: { type: String },
      thumbnailUrl: { type: String }
    }
  }
}, {
  timestamps: true
});

// Ensure compatibility between thumbnail fields
vlogSchema.pre('save', function(next) {
  if (!this.thumbnailUrl && this.thumbnail) {
    this.thumbnailUrl = this.thumbnail;
  }
  if (!this.publishedDate && this.publishDate) {
    this.publishedDate = this.publishDate;
  }
  next();
});

export default mongoose.model('Vlog', vlogSchema);