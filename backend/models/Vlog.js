import mongoose from 'mongoose';

const vlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String }, // GridFS file ID for uploaded videos or YouTube URL
  thumbnail: { type: String }, // GridFS file ID or URL
  duration: { type: String }, // e.g., "10:30"
  category: { type: String },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  publishDate: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  platform: { 
    type: String, 
    enum: ['YouTube', 'Vimeo', 'Self-hosted'],
    default: 'Self-hosted'
  },
  embedCode: { type: String } // For external platforms
}, {
  timestamps: true
});

export default mongoose.model('Vlog', vlogSchema);