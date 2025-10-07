import mongoose from 'mongoose'
import ContactInfo from '../models/ContactInfo.js'
import dotenv from 'dotenv'

dotenv.config()

async function addTestContactInfo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Check if contact info already exists
    const existingContactInfo = await ContactInfo.findOne({})
    
    const contactInfoData = {
      email: 'john.developer@portfolio.com',
      phone: '+1 (555) 123-4567',
      alternateEmail: 'contact@johndeveloper.dev',
      alternatePhone: '+1 (555) 987-6543',
      address: {
        street: '123 Developer Street',
        city: 'Tech City',
        state: 'California',
        zipCode: '90210',
        country: 'United States'
      },
      businessHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',Z5
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '10:00 AM - 2:00 PM',
        sunday: 'Closed'
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johndeveloper',
        github: 'https://github.com/johndeveloper',
        twitter: 'https://twitter.com/johndev',
        instagram: 'https://instagram.com/johndev',
        youtube: 'https://youtube.com/c/johndev'
      },
      website: 'https://johndeveloper.dev',
      availability: 'available',
      responseTime: '24 hours',
      timezone: 'PST',
      callToAction: {
        title: 'Let\'s Build Something Amazing!',
        subtitle: 'Ready to bring your ideas to life? Let\'s discuss your project!',
        buttonText: 'Get In Touch'
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
    
    if (existingContactInfo) {
      await ContactInfo.findByIdAndUpdate(existingContactInfo._id, contactInfoData)
      console.log('✅ Contact information updated successfully')
    } else {
      const contactInfo = new ContactInfo(contactInfoData)
      await contactInfo.save()
      console.log('✅ Contact information created successfully')
    }
    
    console.log('\\n📋 Contact Information Summary:')
    console.log(`📧 Email: ${contactInfoData.email}`)
    console.log(`📞 Phone: ${contactInfoData.phone}`)
    console.log(`📍 Address: ${contactInfoData.address.street}, ${contactInfoData.address.city}`)
    console.log(`🟢 Status: ${contactInfoData.availability}`)
    console.log(`⏱️ Response time: ${contactInfoData.responseTime}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

addTestContactInfo()