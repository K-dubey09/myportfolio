import firebaseConfig from '../config/firebase.js';

async function verifyProfiles() {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    console.log('🔍 Verifying profile collection...');
    console.log('');
    
    const profilesSnapshot = await db.collection('profiles').get();
    
    if (profilesSnapshot.empty) {
      console.log('✅ SUCCESS: Profile collection is empty!');
      console.log('✅ Ready for you to add your profile through the admin panel');
      console.log('');
      console.log('📝 What to do next:');
      console.log('   1. Make sure your backend is running (npm start in backend folder)');
      console.log('   2. Open admin panel and login');
      console.log('   3. Go to Profile tab');
      console.log('   4. Fill in your information');
      console.log('   5. Upload profile picture (optional)');
      console.log('   6. Add social links (optional)');
      console.log('   7. Click "Save Profile"');
      console.log('');
      console.log('✨ Only ONE profile will be created and saved!');
    } else {
      console.log(`⚠️  Found ${profilesSnapshot.size} profile(s) still in collection:`);
      profilesSnapshot.forEach(doc => {
        console.log(`   - ID: ${doc.id}`);
        console.log(`     Data:`, doc.data());
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

console.log('🚀 Profile Collection Verification');
console.log('');
verifyProfiles();
