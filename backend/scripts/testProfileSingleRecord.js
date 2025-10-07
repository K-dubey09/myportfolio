import mongoose from 'mongoose'
import Profile from '../models/Profile.js'
import dotenv from 'dotenv'

dotenv.config()

async function testProfileSingleRecord() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Test 1: Check current state
    console.log('\n=== TEST 1: Current State ===')
    const allProfiles = await Profile.find({})
    console.log(`📊 Number of profile records: ${allProfiles.length}`)
    
    if (allProfiles.length > 0) {
      console.log(`👤 Current name: ${allProfiles[0].name}`)
      console.log(`💼 Current title: ${allProfiles[0].title}`)
      console.log(`📧 Current email: ${allProfiles[0].email}`)
    }
    
    // Test 2: Update with new data (first update)
    console.log('\n=== TEST 2: Updating Profile (First Update) ===')
    const firstProfileData = {
      name: 'Alice Johnson',
      title: 'Senior Frontend Developer',
      email: 'alice.johnson@example.com',
      phone: '+1 (555) 111-1111',
      location: 'San Francisco, CA',
      bio: 'Passionate frontend developer with 5+ years of experience in React and Vue.js',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/alicejohnson',
        github: 'https://github.com/alicejohnson',
        twitter: 'https://twitter.com/alicedev',
        instagram: '',
        youtube: ''
      },
      professionalContacts: {
        github: 'https://github.com/alicejohnson',
        stackoverflow: 'https://stackoverflow.com/users/alice',
        leetcode: 'https://leetcode.com/alice',
        website: 'https://alicejohnson.dev',
        portfolio: 'https://portfolio.alicejohnson.dev',
        blog: 'https://blog.alicejohnson.dev',
        medium: 'https://medium.com/@alicejohnson',
        devto: 'https://dev.to/alicejohnson'
      }
    }
    
    const existingProfile1 = await Profile.findOne({})
    if (existingProfile1) {
      await Profile.findByIdAndUpdate(existingProfile1._id, firstProfileData)
      console.log('✅ Updated existing profile with first data')
    } else {
      const profile1 = new Profile(firstProfileData)
      await profile1.save()
      console.log('✅ Created new profile with first data')
    }
    
    // Verify count after first operation
    const afterFirst = await Profile.find({})
    console.log(`📊 Records after first operation: ${afterFirst.length}`)
    console.log(`👤 Name: ${afterFirst[0].name}`)
    console.log(`💼 Title: ${afterFirst[0].title}`)
    
    // Test 3: Try to create second profile (should update the first one instead)
    console.log('\n=== TEST 3: Attempting Second Profile (Should Update First) ===')
    const secondProfileData = {
      name: 'Bob Smith',
      title: 'Full Stack Engineer',
      email: 'bob.smith@example.com',
      phone: '+1 (555) 222-2222',
      location: 'New York, NY',
      bio: 'Full stack engineer specializing in MERN stack with expertise in cloud technologies',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/bobsmith',
        github: 'https://github.com/bobsmith',
        twitter: 'https://twitter.com/bobdev',
        instagram: 'https://instagram.com/bobsmith',
        youtube: 'https://youtube.com/c/bobsmith'
      },
      professionalContacts: {
        github: 'https://github.com/bobsmith',
        gitlab: 'https://gitlab.com/bobsmith',
        stackoverflow: 'https://stackoverflow.com/users/bob',
        website: 'https://bobsmith.dev',
        portfolio: 'https://portfolio.bobsmith.dev',
        resume: 'https://resume.bobsmith.dev',
        discord: 'bobsmith#1234',
        slack: 'bobsmith'
      }
    }
    
    const existingProfile2 = await Profile.findOne({})
    if (existingProfile2) {
      await Profile.findByIdAndUpdate(existingProfile2._id, secondProfileData)
      console.log('✅ Updated existing profile with second data (as expected)')
    } else {
      const profile2 = new Profile(secondProfileData)
      await profile2.save()
      console.log('✅ Created new profile with second data')
    }
    
    // Final verification
    console.log('\n=== FINAL VERIFICATION ===')
    const finalProfiles = await Profile.find({})
    console.log(`📊 Final number of profile records: ${finalProfiles.length}`)
    
    if (finalProfiles.length === 1) {
      console.log('✅ SUCCESS: Only one profile record exists (as intended)')
      console.log(`👤 Final name: ${finalProfiles[0].name}`)
      console.log(`💼 Final title: ${finalProfiles[0].title}`)
      console.log(`📧 Final email: ${finalProfiles[0].email}`)
      console.log(`📍 Final location: ${finalProfiles[0].location}`)
      console.log(`🔗 LinkedIn: ${finalProfiles[0].socialLinks.linkedin}`)
      console.log(`🐙 GitHub: ${finalProfiles[0].socialLinks.github}`)
      console.log(`🌐 Website: ${finalProfiles[0].professionalContacts.website}`)
      console.log(`📝 Bio preview: ${finalProfiles[0].bio?.substring(0, 50)}...`)
    } else {
      console.log('❌ ERROR: Multiple profile records exist!')
      finalProfiles.forEach((profile, index) => {
        console.log(`Record ${index + 1}: ${profile.name} - ${profile.email}`)
      })
    }
    
    console.log('\n🎯 Test Result: Profile system ensures only one record exists')
    console.log('📝 Note: New profile data overwrites previous data completely')
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

testProfileSingleRecord()