import mongoose from 'mongoose'
import Profile from '../models/Profile.js'
import dotenv from 'dotenv'

dotenv.config()

async function cleanupAndResetProfile() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Check current state
    console.log('\n=== BEFORE CLEANUP ===')
    const allProfiles = await Profile.find({})
    console.log(`📊 Number of profile records: ${allProfiles.length}`)
    
    if (allProfiles.length > 0) {
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}: ${profile.name} - ${profile.title} (${profile.email})`)
      })
    }
    
    // Reset the single profile to clean default values
    console.log('\n=== RESETTING PROFILE ===')
    const cleanProfileData = {
      name: 'Your Name',
      title: 'Your Professional Title',
      email: 'your.email@example.com',
      phone: '',
      location: '',
      bio: 'Tell us about yourself and your professional journey...',
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
    }
    
    const existingProfile = await Profile.findOne({})
    if (existingProfile) {
      const updatedProfile = await Profile.findByIdAndUpdate(
        existingProfile._id,
        cleanProfileData,
        { new: true, runValidators: true }
      )
      console.log('✅ Reset existing profile to clean defaults')
      console.log(`👤 Name: ${updatedProfile.name}`)
      console.log(`💼 Title: ${updatedProfile.title}`)
      console.log(`🆔 ID: ${updatedProfile._id}`)
    } else {
      const newProfile = new Profile(cleanProfileData)
      await newProfile.save()
      console.log('✅ Created new clean profile')
      console.log(`👤 Name: ${newProfile.name}`)
      console.log(`💼 Title: ${newProfile.title}`)
      console.log(`🆔 ID: ${newProfile._id}`)
    }
    
    // Final verification
    console.log('\n=== AFTER CLEANUP ===')
    const finalProfiles = await Profile.find({})
    console.log(`📊 Final number of profile records: ${finalProfiles.length}`)
    
    if (finalProfiles.length === 1) {
      console.log('✅ SUCCESS: Profile is now reset to clean defaults')
      console.log('🔧 The admin panel is ready for profile management')
      console.log('📝 Users can now enter their own profile information')
    } else {
      console.log('❌ ERROR: Multiple profiles still exist')
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

cleanupAndResetProfile()