import mongoose from 'mongoose'
import Profile from '../models/Profile.js'
import dotenv from 'dotenv'

dotenv.config()

async function checkProfileRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Check current profile records
    console.log('\n=== CURRENT PROFILE RECORDS ===')
    const allProfiles = await Profile.find({})
    console.log(`📊 Number of profile records: ${allProfiles.length}`)
    
    if (allProfiles.length > 0) {
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`)
        console.log(`  👤 Name: ${profile.name}`)
        console.log(`  💼 Title: ${profile.title}`) 
        console.log(`  📧 Email: ${profile.email}`)
        console.log(`  🆔 ID: ${profile._id}`)
        console.log(`  📅 Created: ${profile.createdAt}`)
        console.log('')
      })
    } else {
      console.log('No profile records found')
    }
    
    if (allProfiles.length > 1) {
      console.log('❌ WARNING: Multiple profile records exist!')
      console.log('🔧 This should be cleaned up to maintain only one profile')
    } else if (allProfiles.length === 1) {
      console.log('✅ GOOD: Only one profile record exists')
    }
    
  } catch (error) {
    console.error('Error checking profile records:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

checkProfileRecords()