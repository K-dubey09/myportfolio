import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
  profilePicture: { type: String }, // GridFS file ID or URL
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    youtube: { type: String }
  },

  // Professional contacts and platforms
  professionalContacts: {
    github: { type: String, trim: true },
    gitlab: { type: String, trim: true },
    bitbucket: { type: String, trim: true },
    stackoverflow: { type: String, trim: true },
    leetcode: { type: String, trim: true },
    codepen: { type: String, trim: true },
    behance: { type: String, trim: true },
    dribbble: { type: String, trim: true },
    medium: { type: String, trim: true },
    devto: { type: String, trim: true },
    hashnode: { type: String, trim: true },
    website: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    blog: { type: String, trim: true },
    resume: { type: String, trim: true },
    discord: { type: String, trim: true },
    slack: { type: String, trim: true }
  },
  resume: { type: String } // GridFS file ID or URL
}, {
  timestamps: true
});

export default mongoose.model('Profile', profileSchema);