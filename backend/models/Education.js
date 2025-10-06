import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  location: { type: String },
  gpa: { type: String },
  honors: [{ type: String }],
  logo: { type: String } // GridFS file ID or URL
}, {
  timestamps: true
});

export default mongoose.model('Education', educationSchema);