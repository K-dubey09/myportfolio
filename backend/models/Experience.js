import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  description: { type: String },
  responsibilities: [{ type: String }],
  achievements: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  location: { type: String },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    default: 'Full-time'
  },
  companyLogo: { type: String } // GridFS file ID or URL
}, {
  timestamps: true
});

export default mongoose.model('Experience', experienceSchema);