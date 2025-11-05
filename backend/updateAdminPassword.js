import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import firebaseConfig from './config/firebase.js';

async function updateAdminCredentials() {
  try {
    // Initialize Firebase
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();
    
    console.log('🔄 Updating admin credentials...');
    
    const newEmail = 'kushagradubey5002@gmail.com';
    const newPassword = 'Dubey@5002';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', newEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ User not found. Creating new admin user...');
      
      // Create new admin user
      const newUser = {
        email: newEmail,
        password: hashedPassword,
        username: 'admin',
        role: 'admin',
        permissions: {
          canCreatePosts: true,
          canEditPosts: true,
          canDeletePosts: true,
          canManageUsers: true,
          canEditProfile: true,
          canUploadFiles: true,
          canViewAnalytics: true
        },
        isVerified: true,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').add(newUser);
      console.log('✅ New admin user created successfully!');
    } else {
      // Update existing user
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        password: hashedPassword,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Admin password updated successfully!');
    }
    
    console.log('\n🔑 Admin Credentials:');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
    process.exit(1);
  }
}

updateAdminCredentials();
