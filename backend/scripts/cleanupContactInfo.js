import mongoose from 'mongoose'
import ContactInfo from '../models/ContactInfo.js'
import dotenv from 'dotenv'

dotenv.config()

async function cleanupContactInfo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Check current state
    console.log('\n=== BEFORE CLEANUP ===')
    const allContactInfo = await ContactInfo.find({})
    console.log(`📊 Number of contact info records: ${allContactInfo.length}`)
    
    if (allContactInfo.length > 0) {
      allContactInfo.forEach((contact, index) => {
        console.log(`Record ${index + 1}: ${contact.email} (ID: ${contact._id})`)
      })
    }
    
    // Delete all existing contact info records
    console.log('\n=== CLEANUP ===')
    const deleteResult = await ContactInfo.deleteMany({})
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} contact info records`)
    
    // Verify cleanup
    console.log('\n=== AFTER CLEANUP ===')
    const remainingContactInfo = await ContactInfo.find({})
    console.log(`📊 Remaining contact info records: ${remainingContactInfo.length}`)
    
    // Create one clean record
    console.log('\n=== CREATING SINGLE RECORD ===')
    const cleanContactData = {
      email: 'admin@portfolio.com',
      phone: '+1 (555) 999-0000',
      alternateEmail: 'contact@portfolio.com',
      alternatePhone: '+1 (555) 888-0000',
      address: {
        street: '123 Portfolio Street',
        city: 'Admin City',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      businessHours: {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/portfolio',
        github: 'https://github.com/portfolio',
        twitter: 'https://twitter.com/portfolio',
        instagram: '',
        youtube: ''
      },
      website: 'https://portfolio.com',
      availability: 'available',
      responseTime: '24 hours',
      timezone: 'PST',
      callToAction: {
        title: 'Let\'s Work Together!',
        subtitle: 'Ready to bring your ideas to life?',
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
    }
    
    const newContactInfo = new ContactInfo(cleanContactData)
    await newContactInfo.save()
    console.log('✅ Created single clean contact info record')
    console.log(`📧 Email: ${newContactInfo.email}`)
    console.log(`📞 Phone: ${newContactInfo.phone}`)
    console.log(`🆔 ID: ${newContactInfo._id}`)
    
    // Final verification
    console.log('\n=== FINAL VERIFICATION ===')
    const finalContactInfo = await ContactInfo.find({})
    console.log(`📊 Final number of contact info records: ${finalContactInfo.length}`)
    
    if (finalContactInfo.length === 1) {
      console.log('✅ SUCCESS: Database now has exactly one contact info record')
      console.log('🔧 The system is now ready to properly handle contact info updates')
    } else {
      console.log('❌ ERROR: Cleanup failed - multiple records still exist')
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

cleanupContactInfo()