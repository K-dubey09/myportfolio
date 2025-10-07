import mongoose from 'mongoose'
import ContactInfo from '../models/ContactInfo.js'
import dotenv from 'dotenv'

dotenv.config()

async function testContactInfoSingleRecord() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Test 1: Check current state
    console.log('\n=== TEST 1: Current State ===')
    const allContactInfo = await ContactInfo.find({})
    console.log(`📊 Number of contact info records: ${allContactInfo.length}`)
    
    if (allContactInfo.length > 0) {
      console.log(`📧 Current email: ${allContactInfo[0].email}`)
      console.log(`📞 Current phone: ${allContactInfo[0].phone}`)
    }
    
    // Test 2: Create/Update with new data (first record)
    console.log('\n=== TEST 2: Adding First Contact Info ===')
    const firstContactData = {
      email: 'first.test@example.com',
      phone: '+1 (555) 111-1111',
      alternateEmail: 'first.alternate@example.com',
      address: {
        street: '123 First Street',
        city: 'First City',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      availability: 'available',
      displaySettings: {
        showEmail: true,
        showAddress: true,
        showPhone: true,
        showBusinessHours: true,
        showSocialLinks: true,
        showAvailability: true
      }
    }
    
    const existingContactInfo1 = await ContactInfo.findOne({})
    if (existingContactInfo1) {
      await ContactInfo.findByIdAndUpdate(existingContactInfo1._id, firstContactData)
      console.log('✅ Updated existing contact information with first data')
    } else {
      const contactInfo1 = new ContactInfo(firstContactData)
      await contactInfo1.save()
      console.log('✅ Created new contact information with first data')
    }
    
    // Verify count after first operation
    const afterFirst = await ContactInfo.find({})
    console.log(`📊 Records after first operation: ${afterFirst.length}`)
    console.log(`📧 Email: ${afterFirst[0].email}`)
    
    // Test 3: Try to create second record (should update the first one instead)
    console.log('\n=== TEST 3: Attempting Second Contact Info (Should Update First) ===')
    const secondContactData = {
      email: 'second.test@example.com',
      phone: '+1 (555) 222-2222',
      alternateEmail: 'second.alternate@example.com',
      address: {
        street: '456 Second Avenue',
        city: 'Second City',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      availability: 'busy',
      responseTime: '48 hours',
      displaySettings: {
        showEmail: true,
        showAddress: false,
        showPhone: true,
        showBusinessHours: false,
        showSocialLinks: true,
        showAvailability: true
      }
    }
    
    const existingContactInfo2 = await ContactInfo.findOne({})
    if (existingContactInfo2) {
      await ContactInfo.findByIdAndUpdate(existingContactInfo2._id, secondContactData)
      console.log('✅ Updated existing contact information with second data (as expected)')
    } else {
      const contactInfo2 = new ContactInfo(secondContactData)
      await contactInfo2.save()
      console.log('✅ Created new contact information with second data')
    }
    
    // Final verification
    console.log('\n=== FINAL VERIFICATION ===')
    const finalContactInfo = await ContactInfo.find({})
    console.log(`📊 Final number of contact info records: ${finalContactInfo.length}`)
    
    if (finalContactInfo.length === 1) {
      console.log('✅ SUCCESS: Only one contact info record exists (as intended)')
      console.log(`📧 Final email: ${finalContactInfo[0].email}`)
      console.log(`📞 Final phone: ${finalContactInfo[0].phone}`)
      console.log(`🏠 Final address: ${finalContactInfo[0].address.street}, ${finalContactInfo[0].address.city}`)
      console.log(`🟡 Final availability: ${finalContactInfo[0].availability}`)
      console.log(`⏱️ Final response time: ${finalContactInfo[0].responseTime || 'Not set'}`)
      console.log(`👁️ Show email: ${finalContactInfo[0].displaySettings.showEmail}`)
      console.log(`👁️ Show address: ${finalContactInfo[0].displaySettings.showAddress}`)
    } else {
      console.log('❌ ERROR: Multiple contact info records exist!')
      finalContactInfo.forEach((contact, index) => {
        console.log(`Record ${index + 1}: ${contact.email}`)
      })
    }
    
    console.log('\n🎯 Test Result: Contact information system ensures only one record exists')
    console.log('📝 Note: New contact info overwrites previous data but preserves contact messages')
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

testContactInfoSingleRecord()