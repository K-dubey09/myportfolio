import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema({
  // Basic Contact Information
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  alternateEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  
  // Address Information
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  
  // Business Information
  businessHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  
  // Social Media Links
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    behance: { type: String, default: '' },
    dribbble: { type: String, default: '' },
    medium: { type: String, default: '' },
    devto: { type: String, default: '' },
    stackoverflow: { type: String, default: '' },
    discord: { type: String, default: '' }
  },
  
  // Professional Information
  website: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  portfolio: {
    type: String,
    default: ''
  },
  
  // Contact Preferences
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'linkedin', 'other'],
    default: 'email'
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable', 'open'],
    default: 'available'
  },
  responseTime: {
    type: String,
    default: '24-48 hours'
  },
  
  // Additional Information
  timezone: {
    type: String,
    default: 'UTC'
  },
  languages: [{
    language: String,
    proficiency: String // native, fluent, intermediate, basic
  }],
  
  // Call to Action
  callToAction: {
    title: { type: String, default: 'Let\'s Work Together!' },
    subtitle: { type: String, default: 'Ready to bring your ideas to life? Get in touch!' },
    buttonText: { type: String, default: 'Contact Me' }
  },
  
  // Display Settings
  displaySettings: {
    showEmail: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
    showBusinessHours: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: true },
    showAvailability: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export default mongoose.model('ContactInfo', contactInfoSchema);