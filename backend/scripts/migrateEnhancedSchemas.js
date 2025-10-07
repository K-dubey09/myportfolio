// Database migration script for enhanced profile and contact info schemas
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import ContactInfo from '../models/ContactInfo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for migration');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Migrate Profile data
const migrateProfile = async () => {
  try {
    console.log('🔄 Migrating Profile data...');
    
    const profile = await Profile.findOne();
    if (!profile) {
      console.log('ℹ️  No existing profile found, creating default profile...');
      
      const defaultProfile = new Profile({
        name: 'Your Name',
        title: 'Your Professional Title',
        email: 'your.email@example.com',
        phone: '',
        location: '',
        bio: 'Tell us about yourself...',
        profilePicture: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          youtube: ''
        },
        professionalContacts: {
          github: '',
          gitlab: '',
          bitbucket: '',
          stackoverflow: '',
          leetcode: '',
          codepen: '',
          behance: '',
          dribbble: '',
          medium: '',
          devto: '',
          hashnode: '',
          website: '',
          portfolio: '',
          blog: '',
          resume: '',
          discord: '',
          slack: ''
        },
        resume: ''
      });
      
      await defaultProfile.save();
      console.log('✅ Default profile created');
    } else {
      console.log('ℹ️  Existing profile found, checking for missing fields...');
      
      let needsUpdate = false;
      
      // Ensure professionalContacts object exists
      if (!profile.professionalContacts) {
        profile.professionalContacts = {
          github: '',
          gitlab: '',
          bitbucket: '',
          stackoverflow: '',
          leetcode: '',
          codepen: '',
          behance: '',
          dribbble: '',
          medium: '',
          devto: '',
          hashnode: '',
          website: '',
          portfolio: '',
          blog: '',
          resume: '',
          discord: '',
          slack: ''
        };
        needsUpdate = true;
      }
      
      // Ensure all professionalContacts fields exist
      const professionalFields = [
        'github', 'gitlab', 'bitbucket', 'stackoverflow', 'leetcode', 
        'codepen', 'behance', 'dribbble', 'medium', 'devto', 'hashnode',
        'website', 'portfolio', 'blog', 'resume', 'discord', 'slack'
      ];
      
      for (const field of professionalFields) {
        if (!(field in profile.professionalContacts)) {
          profile.professionalContacts[field] = '';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await profile.save();
        console.log('✅ Profile updated with new fields');
      } else {
        console.log('✅ Profile already up to date');
      }
    }
  } catch (error) {
    console.error('❌ Error migrating Profile:', error);
  }
};

// Migrate ContactInfo data
const migrateContactInfo = async () => {
  try {
    console.log('🔄 Migrating ContactInfo data...');
    
    const contactInfo = await ContactInfo.findOne();
    if (!contactInfo) {
      console.log('ℹ️  No existing contact info found, creating default contact info...');
      
      const defaultContactInfo = new ContactInfo({
        email: '',
        phone: '',
        alternateEmail: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        businessHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          facebook: '',
          youtube: '',
          behance: '',
          dribbble: '',
          medium: '',
          devto: '',
          stackoverflow: '',
          discord: ''
        },
        website: '',
        resume: '',
        portfolio: '',
        preferredContactMethod: 'email',
        availability: 'available',
        responseTime: '24-48 hours',
        timezone: 'UTC',
        languages: [],
        callToAction: {
          title: 'Let\'s Work Together!',
          subtitle: 'Ready to bring your ideas to life? Get in touch!',
          buttonText: 'Contact Me'
        },
        displaySettings: {
          showEmail: true,
          showAddress: true,
          showPhone: true,
          showBusinessHours: true,
          showSocialLinks: true,
          showAvailability: true
        }
      });
      
      await defaultContactInfo.save();
      console.log('✅ Default contact info created');
    } else {
      console.log('ℹ️  Existing contact info found, checking for missing fields...');
      
      let needsUpdate = false;
      
      // Check and update availability enum values
      if (contactInfo.availability === 'not-available') {
        contactInfo.availability = 'unavailable';
        needsUpdate = true;
      }
      
      // Ensure all required nested objects exist
      if (!contactInfo.businessHours) {
        contactInfo.businessHours = {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: 'Closed',
          sunday: 'Closed'
        };
        needsUpdate = true;
      }
      
      if (!contactInfo.socialLinks) {
        contactInfo.socialLinks = {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          facebook: '',
          youtube: '',
          behance: '',
          dribbble: '',
          medium: '',
          devto: '',
          stackoverflow: '',
          discord: ''
        };
        needsUpdate = true;
      }
      
      // Add missing social links
      const socialFields = [
        'linkedin', 'github', 'twitter', 'instagram', 'facebook', 
        'youtube', 'behance', 'dribbble', 'medium', 'devto', 
        'stackoverflow', 'discord'
      ];
      
      for (const field of socialFields) {
        if (!(field in contactInfo.socialLinks)) {
          contactInfo.socialLinks[field] = '';
          needsUpdate = true;
        }
      }
      
      if (!contactInfo.callToAction) {
        contactInfo.callToAction = {
          title: 'Let\'s Work Together!',
          subtitle: 'Ready to bring your ideas to life? Get in touch!',
          buttonText: 'Contact Me'
        };
        needsUpdate = true;
      }
      
      if (!contactInfo.displaySettings) {
        contactInfo.displaySettings = {
          showEmail: true,
          showAddress: true,
          showPhone: true,
          showBusinessHours: true,
          showSocialLinks: true,
          showAvailability: true
        };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await contactInfo.save();
        console.log('✅ Contact info updated with new fields');
      } else {
        console.log('✅ Contact info already up to date');
      }
    }
  } catch (error) {
    console.error('❌ Error migrating ContactInfo:', error);
  }
};

// Run migration
const runMigration = async () => {
  console.log('🚀 Starting database migration for enhanced schemas...');
  
  try {
    await connectDB();
    await migrateProfile();
    await migrateContactInfo();
    
    console.log('✅ Database migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

console.log('📋 Migration script loaded');
runMigration();

export { runMigration };