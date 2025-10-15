import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

/**
 * Appwrite Setup Script
 * 
 * Creates collections and buckets for code projects
 * Run with: node scripts/setupAppwrite.js
 */

dotenv.config();

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ef61ed0005c49591cf';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = '68ef6b3a0006bc5e1dfb';

// Initialize client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

/**
 * Create Code Projects Collection
 */
async function createCodeProjectsCollection() {
  try {
    console.log('📦 Creating code_projects collection...');
    
    const collection = await databases.createCollection(
      APPWRITE_DATABASE_ID,
      'code_projects',
      'Code Projects',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.$id);

    // Create attributes
    const attributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'ownerEmail', type: 'string', size: 255, required: false },
      { key: 'primaryLanguage', type: 'string', size: 50, required: false },
      { key: 'isPublic', type: 'boolean', required: false },
      { key: 'allowCollaboration', type: 'boolean', required: false },
      { key: 'secretCode', type: 'string', size: 8, required: false },
      { key: 'totalFiles', type: 'integer', required: false },
      { key: 'totalLines', type: 'integer', required: false },
      { key: 'files', type: 'string', size: 1000000, required: false }, // Large text for JSON
      { key: 'githubEnabled', type: 'boolean', required: false },
      { key: 'githubRepoUrl', type: 'string', size: 500, required: false },
      { key: 'githubBranch', type: 'string', size: 100, required: false },
      { key: 'githubLastSync', type: 'datetime', required: false },
      { key: 'buildLanguage', type: 'string', size: 50, required: false },
      { key: 'buildCommand', type: 'string', size: 500, required: false },
      { key: 'runCommand', type: 'string', size: 500, required: false },
      { key: 'tags', type: 'string', size: 5000, required: false },
      { key: 'createdAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false },
      { key: 'mongoId', type: 'string', size: 255, required: false } // Reference to MongoDB ID
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            APPWRITE_DATABASE_ID,
            'code_projects',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            APPWRITE_DATABASE_ID,
            'code_projects',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            APPWRITE_DATABASE_ID,
            'code_projects',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            APPWRITE_DATABASE_ID,
            'code_projects',
            attr.key,
            attr.required
          );
        }
        console.log(`  ✅ Created attribute: ${attr.key}`);
      } catch (error) {
        console.error(`  ❌ Failed to create ${attr.key}:`, error.message);
      }
    }

    // Create indexes
    try {
      await databases.createIndex(
        APPWRITE_DATABASE_ID,
        'code_projects',
        'owner_index',
        'key',
        ['ownerId'],
        ['ASC']
      );
      console.log('  ✅ Created index: owner_index');
    } catch (error) {
      console.error('  ❌ Failed to create index:', error.message);
    }

    console.log('✅ Code Projects collection setup complete\n');
  } catch (error) {
    console.error('❌ Error creating collection:', error.message);
  }
}

/**
 * Create Collaborators Collection
 */
async function createCollaboratorsCollection() {
  try {
    console.log('👥 Creating collaborators collection...');
    
    const collection = await databases.createCollection(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'Collaborators',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.$id);

    // Create attributes
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'projectId',
      255,
      true
    );
    console.log('  ✅ Created attribute: projectId');

    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'userId',
      255,
      false
    );
    console.log('  ✅ Created attribute: userId');

    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'email',
      255,
      false
    );
    console.log('  ✅ Created attribute: email');

    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'role',
      50,
      true
    );
    console.log('  ✅ Created attribute: role');

    await databases.createDatetimeAttribute(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'joinedAt',
      false
    );
    console.log('  ✅ Created attribute: joinedAt');

    // Create index
    await databases.createIndex(
      APPWRITE_DATABASE_ID,
      'collaborators',
      'project_index',
      'key',
      ['projectId'],
      ['ASC']
    );
    console.log('  ✅ Created index: project_index');

    console.log('✅ Collaborators collection setup complete\n');
  } catch (error) {
    console.error('❌ Error creating collaborators collection:', error.message);
  }
}

/**
 * Create Storage Bucket for Project Files
 */
async function createStorageBucket() {
  try {
    console.log('🗂️ Creating project-files-bucket...');
    
    const bucket = await storage.createBucket(
      'project-files-bucket',
      'Project Files',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false, // fileSecurity
      true,  // enabled
      100000000, // maxFileSize (100MB)
      ['*'], // allowedFileExtensions (all)
      'gzip', // compression
      false, // encryption
      true   // antivirus
    );

    console.log('✅ Bucket created:', bucket.$id);
    console.log('✅ Storage bucket setup complete\n');
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🚀 Setting up Appwrite for Code Projects\n');
  console.log('='.repeat(50));

  if (!APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY not found in environment variables');
    console.log('Please add APPWRITE_API_KEY to your .env file');
    console.log('\nTo get an API key:');
    console.log('1. Go to https://cloud.appwrite.io/');
    console.log('2. Navigate to your project');
    console.log('3. Go to Settings → API Keys');
    console.log('4. Create a new API key with all permissions');
    console.log('5. Add it to .env as APPWRITE_API_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // Create collections
    await createCodeProjectsCollection();
    await createCollaboratorsCollection();
    
    // Create storage bucket
    await createStorageBucket();

    console.log('='.repeat(50));
    console.log('✅ Appwrite setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run migration: node scripts/migrateToAppwrite.js');
    console.log('2. Update frontend to use Appwrite service');
    console.log('3. Test the integration');
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

// Run setup
setup().then(() => process.exit(0));
