import firebaseConfig from '../config/firebase.js';

async function cleanupProfiles() {
  try {
    // Initialize Firebase if not already initialized
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    console.log('🔍 Checking for existing profiles...');
    
    // Get all profiles
    const profilesSnapshot = await db.collection('profiles').get();
    
    if (profilesSnapshot.empty) {
      console.log('✅ No profiles found. Collection is clean.');
      return;
    }
    
    console.log(`📊 Found ${profilesSnapshot.size} profile(s) in collection`);
    
    // List all profiles
    const profiles = [];
    profilesSnapshot.forEach(doc => {
      profiles.push({
        id: doc.id,
        data: doc.data()
      });
      console.log(`   - Profile ID: ${doc.id}`);
      console.log(`     Name: ${doc.data().name || 'N/A'}`);
      console.log(`     Email: ${doc.data().email || 'N/A'}`);
      console.log('');
    });
    
    // Delete all existing profiles
    console.log('🗑️  Deleting all existing profiles...');
    
    const batch = db.batch();
    profilesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${profilesSnapshot.size} profile(s)`);
    console.log('✅ Profile collection is now empty and ready for admin to add new profile');
    console.log('');
    console.log('ℹ️  Next steps:');
    console.log('   1. Start your backend server: npm start');
    console.log('   2. Login to admin panel');
    console.log('   3. Go to Profile tab');
    console.log('   4. Fill in your profile information');
    console.log('   5. Click "Save Profile"');
    console.log('   6. Only ONE profile will be created');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up profiles:', error);
    process.exit(1);
  }
}

// Run cleanup
console.log('🚀 Starting Profile Cleanup Script...');
console.log('');
cleanupProfiles();
