import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

/**
 * Complete Appwrite Setup Script
 * 
 * Creates ALL collections and storage buckets for the portfolio application
 * Run with: node scripts/setupAllAppwrite.js
 */

dotenv.config();

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68ef61ed0005c49591cf';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = '68ef6b3a0006bc5e1dfb';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

console.log('🚀 Setting up Appwrite Collections and Storage\n');
console.log('==================================================\n');

if (!APPWRITE_API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY not found');
  process.exit(1);
}

/**
 * Helper function to create collection with attributes
 */
async function createCollection(collectionId, name, attributes, indexes = []) {
  try {
    console.log(`\n📦 Creating ${name} collection...`);
    
    // Create collection
    await databases.createCollection(
      APPWRITE_DATABASE_ID,
      collectionId,
      name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    console.log(`✅ Collection created: ${collectionId}`);

    // Create attributes
    for (const attr of attributes) {
      try {
        const { key, type, size, required, default: defaultValue, array } = attr;
        
        if (type === 'string') {
          await databases.createStringAttribute(
            APPWRITE_DATABASE_ID,
            collectionId,
            key,
            size || 255,
            required !== undefined ? required : false,
            defaultValue,
            array || false
          );
        } else if (type === 'integer') {
          await databases.createIntegerAttribute(
            APPWRITE_DATABASE_ID,
            collectionId,
            key,
            required !== undefined ? required : false,
            undefined,
            undefined,
            defaultValue
          );
        } else if (type === 'boolean') {
          await databases.createBooleanAttribute(
            APPWRITE_DATABASE_ID,
            collectionId,
            key,
            required !== undefined ? required : false,
            defaultValue
          );
        } else if (type === 'datetime') {
          await databases.createDatetimeAttribute(
            APPWRITE_DATABASE_ID,
            collectionId,
            key,
            required !== undefined ? required : false,
            defaultValue
          );
        }
        
        console.log(`  ✅ Created attribute: ${key}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for attribute to be ready
      } catch (error) {
        console.error(`  ⚠️  Attribute ${attr.key} might already exist:`, error.message);
      }
    }

    // Create indexes
    for (const index of indexes) {
      try {
        await databases.createIndex(
          APPWRITE_DATABASE_ID,
          collectionId,
          index.key,
          index.type,
          index.attributes,
          index.orders || []
        );
        console.log(`  ✅ Created index: ${index.key}`);
      } catch (error) {
        console.error(`  ⚠️  Index ${index.key} might already exist`);
      }
    }

    console.log(`✅ ${name} collection setup complete`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection ${collectionId} already exists`);
    } else {
      console.error(`❌ Error creating ${name}:`, error.message);
    }
  }
}

/**
 * Collection definitions
 */

async function setupCollections() {
  // 1. USERS
  await createCollection('users', 'Users', [
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'emailVerified', type: 'boolean', default: false },
    { key: 'username', type: 'string', size: 100, required: true },
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'role', type: 'string', size: 50, default: 'viewer' },
    { key: 'isActive', type: 'boolean', default: true },
    { key: 'avatar', type: 'string', size: 500 },
    { key: 'bio', type: 'string', size: 1000 },
    { key: 'phoneNumber', type: 'string', size: 50 },
    { key: 'timezone', type: 'string', size: 100 },
    { key: 'language', type: 'string', size: 10, default: 'en' },
    { key: 'notifications', type: 'string', size: 10000 },
    { key: 'preferences', type: 'string', size: 10000 },
    { key: 'metadata', type: 'string', size: 10000 },
    { key: 'lastLogin', type: 'datetime' },
    { key: 'resetPasswordOTP', type: 'string', size: 100 },
    { key: 'resetPasswordExpires', type: 'datetime' },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ], [
    { key: 'email_index', type: 'key', attributes: ['email'] },
    { key: 'username_index', type: 'key', attributes: ['username'] }
  ]);

  // 2. PROFILES
  await createCollection('profiles', 'Profiles', [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'title', type: 'string', size: 255, required: true },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'phone', type: 'string', size: 50 },
    { key: 'location', type: 'string', size: 255 },
    { key: 'bio', type: 'string', size: 5000 },
    { key: 'profilePicture', type: 'string', size: 500 },
    { key: 'socialLinks', type: 'string', size: 5000 },
    { key: 'professionalContacts', type: 'string', size: 5000 },
    { key: 'resume', type: 'string', size: 500 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 3. BLOGS
  await createCollection('blogs', 'Blogs', [
    { key: 'title', type: 'string', size: 500, required: true },
    { key: 'slug', type: 'string', size: 500 },
    { key: 'excerpt', type: 'string', size: 1000 },
    { key: 'content', type: 'string', size: 100000, required: true },
    { key: 'author', type: 'string', size: 255 },
    { key: 'tags', type: 'string', size: 2000 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'coverImage', type: 'string', size: 500 },
    { key: 'featuredImage', type: 'string', size: 500 },
    { key: 'images', type: 'string', size: 5000 },
    { key: 'published', type: 'boolean', default: false },
    { key: 'status', type: 'string', size: 50, default: 'draft' },
    { key: 'publishDate', type: 'datetime' },
    { key: 'readTime', type: 'integer', default: 0 },
    { key: 'views', type: 'integer', default: 0 },
    { key: 'likes', type: 'integer', default: 0 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'comments', type: 'string', size: 50000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ], [
    { key: 'slug_index', type: 'key', attributes: ['slug'] },
    { key: 'status_index', type: 'key', attributes: ['status'] }
  ]);

  // 4. PROJECTS
  await createCollection('projects', 'Projects', [
    { key: 'title', type: 'string', size: 500, required: true },
    { key: 'description', type: 'string', size: 5000, required: true },
    { key: 'technologies', type: 'string', size: 2000 },
    { key: 'githubUrl', type: 'string', size: 500 },
    { key: 'liveUrl', type: 'string', size: 500 },
    { key: 'imageUrl', type: 'string', size: 500 },
    { key: 'images', type: 'string', size: 5000 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'status', type: 'string', size: 50, default: 'Completed' },
    { key: 'startDate', type: 'datetime' },
    { key: 'endDate', type: 'datetime' },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 5. CHATS
  await createCollection('chats', 'Chats', [
    { key: 'subject', type: 'string', size: 500 },
    { key: 'participants', type: 'string', size: 5000 },
    { key: 'lastReads', type: 'string', size: 10000 },
    { key: 'messages', type: 'string', size: 500000 },
    { key: 'messagesCount', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 6. CONTACTS
  await createCollection('contacts', 'Contacts', [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'subject', type: 'string', size: 500, required: true },
    { key: 'message', type: 'string', size: 10000, required: true },
    { key: 'status', type: 'string', size: 50, default: 'unread' },
    { key: 'priority', type: 'string', size: 50, default: 'normal' },
    { key: 'phone', type: 'string', size: 50 },
    { key: 'company', type: 'string', size: 255 },
    { key: 'tags', type: 'string', size: 1000 },
    { key: 'notes', type: 'string', size: 5000 },
    { key: 'assignedTo', type: 'string', size: 100 },
    { key: 'repliedAt', type: 'datetime' },
    { key: 'archivedAt', type: 'datetime' },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ], [
    { key: 'status_index', type: 'key', attributes: ['status'] }
  ]);

  // 7. CONTACT_INFO
  await createCollection('contact_info', 'Contact Info', [
    { key: 'email', type: 'string', size: 255 },
    { key: 'phone', type: 'string', size: 50 },
    { key: 'address', type: 'string', size: 500 },
    { key: 'city', type: 'string', size: 100 },
    { key: 'state', type: 'string', size: 100 },
    { key: 'country', type: 'string', size: 100 },
    { key: 'zipCode', type: 'string', size: 20 },
    { key: 'socialLinks', type: 'string', size: 5000 },
    { key: 'availability', type: 'string', size: 500 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 8. CODE_PROJECTS (already exists, but included for completeness)
  await createCollection('code_projects', 'Code Projects', [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'description', type: 'string', size: 2000 },
    { key: 'ownerId', type: 'string', size: 100, required: true },
    { key: 'ownerEmail', type: 'string', size: 255 },
    { key: 'primaryLanguage', type: 'string', size: 50 },
    { key: 'isPublic', type: 'boolean', default: false },
    { key: 'allowCollaboration', type: 'boolean', default: false },
    { key: 'secretCode', type: 'string', size: 20 },
    { key: 'totalFiles', type: 'integer', default: 0 },
    { key: 'totalLines', type: 'integer', default: 0 },
    { key: 'files', type: 'string', size: 500000 },
    { key: 'githubEnabled', type: 'boolean', default: false },
    { key: 'githubRepoUrl', type: 'string', size: 500 },
    { key: 'githubBranch', type: 'string', size: 100 },
    { key: 'githubLastSync', type: 'datetime' },
    { key: 'buildLanguage', type: 'string', size: 50 },
    { key: 'buildCommand', type: 'string', size: 500 },
    { key: 'runCommand', type: 'string', size: 500 },
    { key: 'tags', type: 'string', size: 2000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ], [
    { key: 'owner_index', type: 'key', attributes: ['ownerId'] }
  ]);

  // 9. EDUCATION
  await createCollection('education', 'Education', [
    { key: 'institution', type: 'string', size: 255 },
    { key: 'degree', type: 'string', size: 255 },
    { key: 'field', type: 'string', size: 255 },
    { key: 'startDate', type: 'datetime' },
    { key: 'endDate', type: 'datetime' },
    { key: 'current', type: 'boolean', default: false },
    { key: 'description', type: 'string', size: 5000 },
    { key: 'grade', type: 'string', size: 50 },
    { key: 'achievements', type: 'string', size: 5000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 10. EXPERIENCE
  await createCollection('experience', 'Experience', [
    { key: 'company', type: 'string', size: 255 },
    { key: 'position', type: 'string', size: 255 },
    { key: 'location', type: 'string', size: 255 },
    { key: 'startDate', type: 'datetime' },
    { key: 'endDate', type: 'datetime' },
    { key: 'current', type: 'boolean', default: false },
    { key: 'description', type: 'string', size: 5000 },
    { key: 'responsibilities', type: 'string', size: 10000 },
    { key: 'achievements', type: 'string', size: 10000 },
    { key: 'technologies', type: 'string', size: 2000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 11. SKILLS
  await createCollection('skills', 'Skills', [
    { key: 'name', type: 'string', size: 255 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'level', type: 'integer', default: 0 },
    { key: 'proficiency', type: 'string', size: 50 },
    { key: 'yearsOfExperience', type: 'integer', default: 0 },
    { key: 'icon', type: 'string', size: 500 },
    { key: 'description', type: 'string', size: 1000 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'order', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 12. SERVICES
  await createCollection('services', 'Services', [
    { key: 'title', type: 'string', size: 255 },
    { key: 'description', type: 'string', size: 5000 },
    { key: 'icon', type: 'string', size: 500 },
    { key: 'features', type: 'string', size: 5000 },
    { key: 'pricing', type: 'string', size: 255 },
    { key: 'duration', type: 'string', size: 100 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'active', type: 'boolean', default: true },
    { key: 'order', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 13. TESTIMONIALS
  await createCollection('testimonials', 'Testimonials', [
    { key: 'name', type: 'string', size: 255 },
    { key: 'position', type: 'string', size: 255 },
    { key: 'company', type: 'string', size: 255 },
    { key: 'testimonial', type: 'string', size: 5000 },
    { key: 'rating', type: 'integer', default: 5 },
    { key: 'avatar', type: 'string', size: 500 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'approved', type: 'boolean', default: false },
    { key: 'order', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 14. ACHIEVEMENTS
  await createCollection('achievements', 'Achievements', [
    { key: 'title', type: 'string', size: 255 },
    { key: 'description', type: 'string', size: 2000 },
    { key: 'date', type: 'datetime' },
    { key: 'organization', type: 'string', size: 255 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'icon', type: 'string', size: 500 },
    { key: 'url', type: 'string', size: 500 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'order', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 15. GALLERY
  await createCollection('gallery', 'Gallery', [
    { key: 'title', type: 'string', size: 255 },
    { key: 'description', type: 'string', size: 2000 },
    { key: 'imageUrl', type: 'string', size: 500 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'tags', type: 'string', size: 2000 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'order', type: 'integer', default: 0 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 16. VLOGS
  await createCollection('vlogs', 'Vlogs', [
    { key: 'title', type: 'string', size: 255 },
    { key: 'description', type: 'string', size: 5000 },
    { key: 'videoUrl', type: 'string', size: 500 },
    { key: 'thumbnailUrl', type: 'string', size: 500 },
    { key: 'duration', type: 'string', size: 50 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'tags', type: 'string', size: 2000 },
    { key: 'views', type: 'integer', default: 0 },
    { key: 'likes', type: 'integer', default: 0 },
    { key: 'featured', type: 'boolean', default: false },
    { key: 'published', type: 'boolean', default: false },
    { key: 'publishDate', type: 'datetime' },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 17. ACCESS_KEYS
  await createCollection('access_keys', 'Access Keys', [
    { key: 'key', type: 'string', size: 500 },
    { key: 'userId', type: 'string', size: 100 },
    { key: 'name', type: 'string', size: 255 },
    { key: 'permissions', type: 'string', size: 5000 },
    { key: 'active', type: 'boolean', default: true },
    { key: 'expiresAt', type: 'datetime' },
    { key: 'lastUsedAt', type: 'datetime' },
    { key: 'createdAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 18. ADMIN_REQUESTS
  await createCollection('admin_requests', 'Admin Requests', [
    { key: 'userId', type: 'string', size: 100 },
    { key: 'requestType', type: 'string', size: 100 },
    { key: 'reason', type: 'string', size: 2000 },
    { key: 'status', type: 'string', size: 50, default: 'pending' },
    { key: 'reviewedBy', type: 'string', size: 100 },
    { key: 'reviewedAt', type: 'datetime' },
    { key: 'notes', type: 'string', size: 5000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'updatedAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 19. COUNTERS
  await createCollection('counters', 'Counters', [
    { key: 'name', type: 'string', size: 255 },
    { key: 'value', type: 'integer', default: 0 },
    { key: 'description', type: 'string', size: 1000 },
    { key: 'category', type: 'string', size: 100 },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // 20. CONVERSION_LOGS
  await createCollection('conversion_logs', 'Conversion Logs', [
    { key: 'entityType', type: 'string', size: 100 },
    { key: 'entityId', type: 'string', size: 100 },
    { key: 'conversionType', type: 'string', size: 100 },
    { key: 'fromValue', type: 'string', size: 1000 },
    { key: 'toValue', type: 'string', size: 1000 },
    { key: 'status', type: 'string', size: 50 },
    { key: 'errorMessage', type: 'string', size: 2000 },
    { key: 'metadata', type: 'string', size: 10000 },
    { key: 'createdAt', type: 'datetime' },
    { key: 'mongoId', type: 'string', size: 100 }
  ]);

  // Create storage buckets
  console.log('\n🗂️  Creating storage buckets...');
  
  try {
    await storage.createBucket(
      'portfolio-files',
      'Portfolio Files',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false, // fileSecurity
      true, // enabled
      100 * 1024 * 1024, // maxFileSize (100MB)
      ['image/*', 'video/*', 'application/pdf', 'application/zip'], // allowedFileExtensions
      undefined, // compression
      true, // encryption
      true // antivirus
    );
    console.log('✅ Bucket created: portfolio-files');
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Bucket portfolio-files already exists');
    } else {
      console.error('❌ Error creating bucket:', error.message);
    }
  }
}

// Run setup
setupCollections()
  .then(() => {
    console.log('\n==================================================');
    console.log('✅ Appwrite setup complete!');
    console.log('==================================================\n');
    console.log('Next step: Run the migration script');
    console.log('  node scripts/migrateAllToAppwrite.js\n');
  })
  .catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
