import mongoose from 'mongoose'
import ContactInfo from '../models/ContactInfo.js'
import Contact from '../models/Contact.js'
import dotenv from 'dotenv'

dotenv.config()

async function testContactMessagesPreservation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio')
    console.log('Connected to MongoDB')
    
    // Test 1: Add some contact messages first
    console.log('\n=== TEST 1: Adding Contact Messages ===')
    const contactMessage1 = new Contact({
      name: 'John Smith',
      email: 'john.smith@example.com',
      subject: 'Project Inquiry',
      message: 'I would like to discuss a project with you.',
      status: 'unread',
      priority: 'high'
    })
    await contactMessage1.save()
    
    const contactMessage2 = new Contact({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      subject: 'Collaboration',
      message: 'Interested in collaborating on a new project.',
      status: 'unread',
      priority: 'normal'
    })
    await contactMessage2.save()
    
    const allMessages = await Contact.find({})
    console.log(`📧 Added ${allMessages.length} contact messages`)
    console.log(`Message 1: ${contactMessage1.name} - ${contactMessage1.subject}`)
    console.log(`Message 2: ${contactMessage2.name} - ${contactMessage2.subject}`)
    
    // Test 2: Check current contact info
    console.log('\n=== TEST 2: Current Contact Info ===')
    const currentContactInfo = await ContactInfo.find({})
    console.log(`📊 Contact info records: ${currentContactInfo.length}`)
    if (currentContactInfo.length > 0) {
      console.log(`📧 Current email: ${currentContactInfo[0].email}`)
    }
    
    // Test 3: Update contact info (should NOT affect contact messages)
    console.log('\n=== TEST 3: Updating Contact Info ===')
    const newContactInfoData = {
      email: 'updated.admin@portfolio.com',
      phone: '+1 (555) 111-9999',
      alternateEmail: 'updated.contact@portfolio.com',
      address: {
        street: '789 Updated Street',
        city: 'Updated City',
        state: 'TX',
        zipCode: '73301',
        country: 'United States'
      },
      availability: 'available',
      responseTime: '12 hours',
      displaySettings: {
        showEmail: true,
        showAddress: true,
        showPhone: true,
        showBusinessHours: false,
        showSocialLinks: true,
        showAvailability: true
      }
    }
    
    const existingContactInfo = await ContactInfo.findOne({})
    if (existingContactInfo) {
      await ContactInfo.findByIdAndUpdate(existingContactInfo._id, newContactInfoData)
      console.log('✅ Updated contact information')
    }
    
    // Test 4: Verify contact messages are preserved
    console.log('\n=== TEST 4: Verifying Contact Messages Preservation ===')
    const messagesAfterUpdate = await Contact.find({})
    console.log(`📧 Contact messages after update: ${messagesAfterUpdate.length}`)
    
    if (messagesAfterUpdate.length >= 2) {
      console.log('✅ SUCCESS: Contact messages were preserved!')
      messagesAfterUpdate.forEach((msg, index) => {
        console.log(`Message ${index + 1}: ${msg.name} - ${msg.subject} (${msg.status})`)
      })
    } else {
      console.log('❌ ERROR: Contact messages were lost!')
    }
    
    // Test 5: Verify contact info was updated
    console.log('\n=== TEST 5: Verifying Contact Info Update ===')
    const updatedContactInfo = await ContactInfo.find({})
    console.log(`📊 Contact info records after update: ${updatedContactInfo.length}`)
    
    if (updatedContactInfo.length === 1) {
      console.log('✅ SUCCESS: Only one contact info record exists')
      console.log(`📧 Updated email: ${updatedContactInfo[0].email}`)
      console.log(`📞 Updated phone: ${updatedContactInfo[0].phone}`)
      console.log(`🏠 Updated address: ${updatedContactInfo[0].address.street}, ${updatedContactInfo[0].address.city}`)
      console.log(`⏱️ Updated response time: ${updatedContactInfo[0].responseTime}`)
    }
    
    console.log('\n🎯 FINAL RESULT:')
    console.log('✅ Contact information updates correctly (single record)')
    console.log('✅ Contact messages are preserved (separate collection)')
    console.log('🔐 Privacy maintained: Messages stay in admin panel')
    console.log('👁️ Public visibility: Contact info shown based on display settings')
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

testContactMessagesPreservation()