import firebaseConfig from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';

const exampleUsers = [
  {
    email: 'admin@portfolio.com',
    password: 'admin123!',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'editor@portfolio.com',
    password: 'editor123!',
    name: 'Editor User',
    role: 'editor'
  },
  {
    email: 'viewer@portfolio.com',
    password: 'viewer123!',
    name: 'Viewer User',
    role: 'viewer'
  }
];

async function initializeFirebase() {
  try {
    console.log('Initializing Firebase Admin SDK...');
    await firebaseConfig.initialize();
    console.log('Firebase initialized successfully!\n');

    console.log('Creating example users...');
    
    for (const userData of exampleUsers) {
      try {
        const existingUser = await UserHelpers.getUserByEmail(userData.email);
        if (existingUser) {
          console.log(`User ${userData.email} already exists (uid: ${existingUser.uid})`);
          continue;
        }

        const newUser = await UserHelpers.createUser(userData);
        console.log(` Created ${userData.role}: ${userData.email} (uid: ${newUser.uid})`);
        console.log(`  Password: ${userData.password}`);
        console.log(`  Permissions:`, newUser.permissions);
      } catch (error) {
        console.error(` Failed to create ${userData.email}:`, error.message);
      }
    }

    console.log('\n=== Firebase Setup Complete ===');
    console.log('You can now login with any of the following accounts:');
    exampleUsers.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

initializeFirebase()
  .then(() => {
    console.log('\nExiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
