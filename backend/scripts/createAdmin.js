import dotenv from 'dotenv';
import database from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await database.connect();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Administrator',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Default password: admin123 (change this!)');
    console.log('👑 Role:', adminUser.role);
    console.log('🛡️  Permissions:', adminUser.permissions);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

createAdminUser();