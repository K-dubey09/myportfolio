import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';
import CodeProject from '../models/CodeProject.js';
import User from '../models/User.js';

/**
 * Migration Script: MongoDB to Appwrite
 * 
 * This script migrates code projects from MongoDB to Appwrite
 * Run with: node scripts/migrateToAppwrite.js
 */

dotenv.config();

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ef61ed0005c49591cf';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Add this to your .env
const APPWRITE_DATABASE_ID = '68ef6b3a0006bc5e1dfb';
const APPWRITE_COLLECTION_ID = 'code_projects';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Transform MongoDB document to Appwrite format
 */
function transformToAppwrite(mongoDoc) {
  // Handle owner - could be ObjectId or populated User object
  let ownerId;
  let ownerEmail = '';
  
  if (mongoDoc.owner) {
    if (typeof mongoDoc.owner === 'object' && mongoDoc.owner._id) {
      // Owner is populated
      ownerId = mongoDoc.owner._id.toString();
      ownerEmail = mongoDoc.owner.email || '';
    } else {
      // Owner is just an ObjectId
      ownerId = mongoDoc.owner.toString();
    }
  } else {
    ownerId = 'unknown';
  }

  return {
    name: mongoDoc.name,
    description: mongoDoc.description || '',
    ownerId: ownerId,
    ownerEmail: ownerEmail,
    primaryLanguage: mongoDoc.primaryLanguage || 'javascript',
    isPublic: mongoDoc.isPublic || false,
    allowCollaboration: mongoDoc.allowCollaboration || false,
    secretCode: mongoDoc.secretCode || null,
    totalFiles: mongoDoc.totalFiles || 0,
    totalLines: mongoDoc.totalLines || 0,
    files: JSON.stringify(mongoDoc.files || []),
    githubEnabled: mongoDoc.github?.enabled || false,
    githubRepoUrl: mongoDoc.github?.repoUrl || '',
    githubBranch: mongoDoc.github?.branch || 'main',
    githubLastSync: mongoDoc.github?.lastSyncAt?.toISOString() || null,
    buildLanguage: mongoDoc.buildConfig?.language || '',
    buildCommand: mongoDoc.buildConfig?.buildCommand || '',
    runCommand: mongoDoc.buildConfig?.runCommand || '',
    tags: JSON.stringify(mongoDoc.tags || []),
    createdAt: mongoDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: mongoDoc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: mongoDoc._id.toString() // Keep reference to original ID
  };
}

/**
 * Migrate a single project
 */
async function migrateProject(mongoProject) {
  try {
    const appwriteData = transformToAppwrite(mongoProject);
    
    const result = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      ID.unique(),
      appwriteData
    );
    
    console.log(`✅ Migrated: ${mongoProject.name} (${result.$id})`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to migrate ${mongoProject.name}:`, error.message);
    return null;
  }
}

/**
 * Migrate collaborators
 */
async function migrateCollaborators(mongoProject, appwriteProjectId) {
  if (!mongoProject.collaborators || mongoProject.collaborators.length === 0) {
    return;
  }

  const COLLABORATORS_COLLECTION = 'collaborators';

  for (const collab of mongoProject.collaborators) {
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLABORATORS_COLLECTION,
        ID.unique(),
        {
          projectId: appwriteProjectId,
          userId: collab.userId?.toString() || '',
          email: collab.email || '',
          role: collab.role || 'viewer',
          joinedAt: collab.joinedAt?.toISOString() || new Date().toISOString()
        }
      );
      console.log(`  ✅ Migrated collaborator: ${collab.email}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate collaborator:`, error.message);
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration from MongoDB to Appwrite...\n');

  if (!APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY not found in environment variables');
    console.log('Please add APPWRITE_API_KEY to your .env file');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Fetch all code projects
    const projects = await CodeProject.find({}).populate('owner');
    console.log(`📦 Found ${projects.length} projects to migrate\n`);

    if (projects.length === 0) {
      console.log('No projects found to migrate.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Migrate each project
    for (const project of projects) {
      console.log(`\n📝 Migrating: ${project.name}`);
      
      const result = await migrateProject(project);
      
      if (result) {
        successCount++;
        
        // Migrate collaborators
        await migrateCollaborators(project, result.$id);
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📦 Total: ${projects.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

/**
 * Rollback function (delete all migrated data)
 */
async function rollback() {
  console.log('🔄 Starting rollback...\n');

  try {
    const documents = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID
    );

    console.log(`Found ${documents.total} documents to delete`);

    for (const doc of documents.documents) {
      try {
        await databases.deleteDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ID,
          doc.$id
        );
        console.log(`✅ Deleted: ${doc.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${doc.name}:`, error.message);
      }
    }

    console.log('\n✅ Rollback complete');
  } catch (error) {
    console.error('❌ Rollback error:', error);
  }
}

// Run migration or rollback based on command line argument
const command = process.argv[2];

if (command === 'rollback') {
  rollback().then(() => process.exit(0));
} else {
  migrate().then(() => process.exit(0));
}
