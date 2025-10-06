import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  author: { type: String, default: 'Portfolio Owner' },
  tags: [{ type: String }],
  category: { type: String },
  coverImage: { type: String }, // GridFS file ID or URL - OPTIONAL
  featuredImage: { type: String }, // GridFS file ID or URL - OPTIONAL
  images: [{ type: String }], // Array of GridFS file IDs or URLs - OPTIONAL
  published: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishDate: { type: Date, default: Date.now },
  readTime: { type: Number }, // in minutes
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  comments: [{
    name: { type: String },
    email: { type: String },
    comment: { type: String },
    date: { type: Date, default: Date.now },
    approved: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Generate slug from title
blogSchema.pre('save', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

export default mongoose.model('Blog', blogSchema);