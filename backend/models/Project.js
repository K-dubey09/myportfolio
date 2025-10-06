import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  imageUrl: { type: String }, // GridFS file ID or URL
  images: [{ type: String }], // Array of GridFS file IDs or URLs
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['In Progress', 'Completed', 'On Hold'], default: 'Completed' },
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);