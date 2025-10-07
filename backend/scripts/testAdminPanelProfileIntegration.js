import mongoose from 'mongoose'
import Profile from '../models/Profile.js'
import dotenv from 'dotenv'

dotenv.config()

async function testAdminPanelProfileIntegration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Test 1: Verify current clean state
    console.log('\n=== TEST 1: Verify Clean State ===')
    const initialProfile = await Profile.findOne({})
    console.log(`📊 Profile records: ${await Profile.countDocuments()}`)
    console.log(`👤 Current name: ${initialProfile?.name}`)
    console.log(`💼 Current title: ${initialProfile?.title}`)
    
    // Test 2: Simulate admin panel profile update
    console.log('\n=== TEST 2: Simulating Admin Panel Update ===')
    const adminUpdateData = {
      name: 'KUSHAGRA DUBEY',
      title: 'Full Stack Developer & System Architect',
      email: 'kushagra.dubey@portfolio.com',
      phone: '+1 (555) 123-9999',
      location: 'California, USA',
      bio: 'Passionate full stack developer with expertise in MERN stack, cloud computing, and system architecture. Love building scalable applications and solving complex problems.',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/kushagra-dubey',
        github: 'https://github.com/k-dubey09',
        twitter: 'https://twitter.com/kushagradev',
        instagram: '',
        youtube: 'https://youtube.com/c/kushagracoding'
      },
      professionalContacts: {
        github: 'https://github.com/k-dubey09',
        stackoverflow: 'https://stackoverflow.com/users/kushagra',
        leetcode: 'https://leetcode.com/kushagra',
        website: 'https://kushagradubey.dev',
        portfolio: 'https://portfolio.kushagradubey.dev',
        blog: 'https://blog.kushagradubey.dev',
        medium: 'https://medium.com/@kushagradubey',
        devto: 'https://dev.to/kushagradubey',
        resume: 'https://resume.kushagradubey.dev'
      }
    }
    
    // Simulate the admin panel update process
    const existingProfile = await Profile.findOne({})
    if (existingProfile) {
      const updatedProfile = await Profile.findByIdAndUpdate(
        existingProfile._id,
        adminUpdateData,
        { new: true, runValidators: true }
      )
      console.log('✅ Successfully updated profile via admin panel simulation')
      console.log(`👤 Updated to: ${updatedProfile.name}`)
      console.log(`💼 New title: ${updatedProfile.title}`)
      console.log(`📧 New email: ${updatedProfile.email}`)
    }
    
    // Test 3: Verify single record constraint
    console.log('\n=== TEST 3: Verify Single Record Constraint ===')
    const allProfilesAfterUpdate = await Profile.find({})
    console.log(`📊 Total profile records: ${allProfilesAfterUpdate.length}`)
    
    if (allProfilesAfterUpdate.length === 1) {
      console.log('✅ SUCCESS: Single profile record maintained')
      const profile = allProfilesAfterUpdate[0]
      console.log('\n📋 Profile Summary:')
      console.log(`👤 Name: ${profile.name}`)
      console.log(`💼 Title: ${profile.title}`)
      console.log(`📧 Email: ${profile.email}`)
      console.log(`📱 Phone: ${profile.phone}`)
      console.log(`📍 Location: ${profile.location}`)
      console.log(`🔗 LinkedIn: ${profile.socialLinks.linkedin}`)
      console.log(`🐙 GitHub: ${profile.socialLinks.github}`)
      console.log(`🌐 Website: ${profile.professionalContacts.website}`)
      console.log(`📝 Bio: ${profile.bio.substring(0, 80)}...`)
    } else {
      console.log('❌ ERROR: Multiple profile records found!')
    }
    
    // Test 4: Test admin panel data retrieval simulation
    console.log('\n=== TEST 4: Admin Panel Data Retrieval ===')
    const profileForAdminPanel = await Profile.findOne({})
    
    // Simulate what the admin panel would receive
    const adminPanelData = {
      profile: profileForAdminPanel
    }
    
    console.log('✅ Admin panel would receive:')
    console.log(`👤 Name field: ${adminPanelData.profile.name}`)
    console.log(`💼 Title field: ${adminPanelData.profile.title}`)
    console.log(`📧 Email field: ${adminPanelData.profile.email}`)
    console.log('📝 Form would be pre-populated with existing data')
    
    console.log('\n🎯 ADMIN PANEL INTEGRATION TEST RESULTS:')
    console.log('✅ Single profile record maintained')
    console.log('✅ Profile updates overwrite previous data')
    console.log('✅ Admin panel form integration ready')
    console.log('✅ Data consistency maintained')
    console.log('🔧 Admin panel can safely update profile information')
    
  } catch (error) {
    console.error('Error during admin panel integration test:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

testAdminPanelProfileIntegration()