import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';

// Import all models
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Blog from '../models/Blog.js';
import Project from '../models/Project.js';
import Chat from '../models/Chat.js';
import Contact from '../models/Contact.js';
import ContactInfo from '../models/ContactInfo.js';
import CodeProject from '../models/CodeProject.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import Skill from '../models/Skill.js';
import Service from '../models/Service.js';
import Testimonial from '../models/Testimonial.js';
import Achievement from '../models/Achievement.js';
import Gallery from '../models/Gallery.js';
import Vlog from '../models/Vlog.js';
import AccessKey from '../models/AccessKey.js';
import AdminRequest from '../models/AdminRequest.js';
import Counter from '../models/Counter.js';
import ConversionLog from '../models/ConversionLog.js';

/**
 * Complete MongoDB to Appwrite Migration Script
 * 
 * Migrates ALL data from MongoDB to Appwrite Cloud
 * Run with: node scripts/migrateAllToAppwrite.js
 */

dotenv.config();

// Appwrite Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68ef61ed0005c49591cf';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = '68ef6b3a0006bc5e1dfb';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Migration statistics
const stats = {
  users: { success: 0, failed: 0 },
  profiles: { success: 0, failed: 0 },
  blogs: { success: 0, failed: 0 },
  projects: { success: 0, failed: 0 },
  chats: { success: 0, failed: 0 },
  contacts: { success: 0, failed: 0 },
  contactInfo: { success: 0, failed: 0 },
  codeProjects: { success: 0, failed: 0 },
  education: { success: 0, failed: 0 },
  experience: { success: 0, failed: 0 },
  skills: { success: 0, failed: 0 },
  services: { success: 0, failed: 0 },
  testimonials: { success: 0, failed: 0 },
  achievements: { success: 0, failed: 0 },
  gallery: { success: 0, failed: 0 },
  vlogs: { success: 0, failed: 0 },
  accessKeys: { success: 0, failed: 0 },
  adminRequests: { success: 0, failed: 0 },
  counters: { success: 0, failed: 0 },
  conversionLogs: { success: 0, failed: 0 }
};

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
 * Generic function to migrate a collection
 */
async function migrateCollection(Model, collectionId, transformFn, collectionName) {
  try {
    console.log(`\n📦 Migrating ${collectionName}...`);
    
    const documents = await Model.find({});
    console.log(`   Found ${documents.length} documents`);
    
    if (documents.length === 0) {
      console.log(`   ⚠️  No documents to migrate`);
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    for (const doc of documents) {
      try {
        const transformedData = transformFn(doc);
        
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          collectionId,
          ID.unique(),
          transformedData
        );
        
        successCount++;
        if (successCount % 10 === 0) {
          process.stdout.write(`   ✅ Migrated ${successCount}/${documents.length}\r`);
        }
      } catch (error) {
        failCount++;
        console.error(`   ❌ Failed to migrate: ${doc._id}`, error.message);
      }
    }

    console.log(`   ✅ Complete: ${successCount} success, ${failCount} failed`);
    return { success: successCount, failed: failCount };
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error.message);
    return { success: 0, failed: 0 };
  }
}

/**
 * Transformation functions for each model
 */

// Users
function transformUser(doc) {
  // Generate username if missing
  const username = doc.username || doc.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  return {
    email: doc.email,
    emailVerified: doc.emailVerified || false,
    username: username,
    name: doc.name,
    role: doc.role || 'viewer',
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    avatar: doc.avatar || '',
    bio: doc.bio || '',
    phoneNumber: doc.phoneNumber || '',
    timezone: doc.timezone || '',
    language: doc.language || 'en',
    notifications: JSON.stringify(doc.notifications || {}),
    preferences: JSON.stringify(doc.preferences || {}),
    metadata: JSON.stringify(doc.metadata || {}),
    lastLogin: doc.lastLogin?.toISOString() || null,
    resetPasswordOTP: doc.resetPasswordOTP || '',
    resetPasswordExpires: doc.resetPasswordExpires?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Profile
function transformProfile(doc) {
  // Combine socialLinks and professionalContacts into one field
  const allLinks = {
    ...doc.socialLinks,
    ...doc.professionalContacts
  };
  
  return {
    name: doc.name,
    title: doc.title,
    email: doc.email,
    phone: doc.phone || '',
    location: doc.location || '',
    bio: doc.bio || '',
    profilePicture: doc.profilePicture || '',
    socialLinks: JSON.stringify(allLinks || {}),
    professionalContacts: JSON.stringify(doc.professionalContacts || {}),
    resume: doc.resume || '',
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Blog
function transformBlog(doc) {
  return {
    title: doc.title,
    slug: doc.slug || '',
    excerpt: doc.excerpt || '',
    content: doc.content,
    author: doc.author || 'Portfolio Owner',
    tags: JSON.stringify(doc.tags || []),
    category: doc.category || '',
    coverImage: doc.coverImage || '',
    featuredImage: doc.featuredImage || '',
    images: JSON.stringify(doc.images || []),
    published: doc.published || false,
    status: doc.status || 'draft',
    publishDate: doc.publishDate?.toISOString() || new Date().toISOString(),
    readTime: doc.readTime || 0,
    views: doc.views || 0,
    likes: doc.likes || 0,
    featured: doc.featured || false,
    comments: JSON.stringify(doc.comments || []),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Project
function transformProject(doc) {
  return {
    title: doc.title,
    description: doc.description,
    technologies: JSON.stringify(doc.technologies || []),
    githubUrl: doc.githubUrl || '',
    liveUrl: doc.liveUrl || '',
    imageUrl: doc.imageUrl || '',
    images: JSON.stringify(doc.images || []),
    featured: doc.featured || false,
    status: doc.status || 'Completed',
    startDate: doc.startDate?.toISOString() || null,
    endDate: doc.endDate?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Chat (complex with nested messages)
function transformChat(doc) {
  return {
    subject: doc.subject || '',
    participants: JSON.stringify(doc.participants?.map(p => p.toString()) || []),
    lastReads: JSON.stringify(doc.lastReads || []),
    messages: JSON.stringify(doc.messages || []),
    messagesCount: doc.messages?.length || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Contact
function transformContact(doc) {
  return {
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    status: doc.status || 'unread',
    priority: doc.priority || 'normal',
    phone: doc.phone || '',
    company: doc.company || '',
    tags: JSON.stringify(doc.tags || []),
    // Notes field - removed if collection doesn't have it
    // notes: doc.notes || '',
    assignedTo: doc.assignedTo?.toString() || '',
    repliedAt: doc.repliedAt?.toISOString() || null,
    archivedAt: doc.archivedAt?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// ContactInfo
function transformContactInfo(doc) {
  // Truncate address if too long (max 500 chars)
  const address = (doc.address || '').substring(0, 500);
  
  return {
    email: doc.email || '',
    phone: doc.phone || '',
    address: address,
    city: doc.city || '',
    state: doc.state || '',
    country: doc.country || '',
    zipCode: doc.zipCode || '',
    socialLinks: JSON.stringify(doc.socialLinks || {}),
    availability: doc.availability || '',
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// CodeProject (already migrated, but included for completeness)
function transformCodeProject(doc) {
  let ownerId, ownerEmail = '';
  if (doc.owner) {
    if (typeof doc.owner === 'object' && doc.owner._id) {
      ownerId = doc.owner._id.toString();
      ownerEmail = doc.owner.email || '';
    } else {
      ownerId = doc.owner.toString();
    }
  } else {
    ownerId = 'unknown';
  }

  return {
    name: doc.name,
    description: doc.description || '',
    ownerId: ownerId,
    ownerEmail: ownerEmail,
    primaryLanguage: doc.primaryLanguage || 'javascript',
    isPublic: doc.isPublic || false,
    allowCollaboration: doc.allowCollaboration || false,
    secretCode: doc.secretCode || null,
    totalFiles: doc.totalFiles || 0,
    totalLines: doc.totalLines || 0,
    files: JSON.stringify(doc.files || []),
    githubEnabled: doc.github?.enabled || false,
    githubRepoUrl: doc.github?.repoUrl || '',
    githubBranch: doc.github?.branch || 'main',
    githubLastSync: doc.github?.lastSyncAt?.toISOString() || null,
    buildLanguage: doc.buildConfig?.language || '',
    buildCommand: doc.buildConfig?.buildCommand || '',
    runCommand: doc.buildConfig?.runCommand || '',
    tags: JSON.stringify(doc.tags || []),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Education
function transformEducation(doc) {
  return {
    institution: doc.institution || '',
    degree: doc.degree || '',
    field: doc.field || '',
    startDate: doc.startDate?.toISOString() || null,
    endDate: doc.endDate?.toISOString() || null,
    current: doc.current || false,
    description: doc.description || '',
    grade: doc.grade || '',
    achievements: JSON.stringify(doc.achievements || []),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Experience
function transformExperience(doc) {
  return {
    company: doc.company || '',
    position: doc.position || '',
    location: doc.location || '',
    startDate: doc.startDate?.toISOString() || null,
    endDate: doc.endDate?.toISOString() || null,
    current: doc.current || false,
    description: doc.description || '',
    responsibilities: JSON.stringify(doc.responsibilities || []),
    achievements: JSON.stringify(doc.achievements || []),
    technologies: JSON.stringify(doc.technologies || []),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Skill
function transformSkill(doc) {
  return {
    name: doc.name || '',
    category: doc.category || '',
    level: doc.level || 0,
    proficiency: doc.proficiency || '',
    yearsOfExperience: doc.yearsOfExperience || 0,
    icon: doc.icon || '',
    description: doc.description || '',
    featured: doc.featured || false,
    order: doc.order || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Service
function transformService(doc) {
  return {
    title: doc.title || '',
    description: doc.description || '',
    icon: doc.icon || '',
    features: JSON.stringify(doc.features || []),
    pricing: doc.pricing || '',
    duration: doc.duration || '',
    category: doc.category || '',
    active: doc.active !== undefined ? doc.active : true,
    order: doc.order || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Testimonial
function transformTestimonial(doc) {
  return {
    name: doc.name || '',
    position: doc.position || '',
    company: doc.company || '',
    testimonial: doc.testimonial || '',
    rating: doc.rating || 5,
    avatar: doc.avatar || '',
    featured: doc.featured || false,
    approved: doc.approved || false,
    order: doc.order || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Achievement
function transformAchievement(doc) {
  return {
    title: doc.title || '',
    description: doc.description || '',
    date: doc.date?.toISOString() || null,
    organization: doc.organization || '',
    category: doc.category || '',
    icon: doc.icon || '',
    url: doc.url || '',
    featured: doc.featured || false,
    order: doc.order || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Gallery
function transformGallery(doc) {
  return {
    title: doc.title || '',
    description: doc.description || '',
    imageUrl: doc.imageUrl || '',
    category: doc.category || '',
    tags: JSON.stringify(doc.tags || []),
    featured: doc.featured || false,
    order: doc.order || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Vlog
function transformVlog(doc) {
  return {
    title: doc.title || '',
    description: doc.description || '',
    videoUrl: doc.videoUrl || '',
    thumbnailUrl: doc.thumbnailUrl || '',
    duration: doc.duration || '',
    category: doc.category || '',
    tags: JSON.stringify(doc.tags || []),
    views: doc.views || 0,
    likes: doc.likes || 0,
    featured: doc.featured || false,
    published: doc.published || false,
    publishDate: doc.publishDate?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// AccessKey
function transformAccessKey(doc) {
  return {
    key: doc.key || '',
    userId: doc.user?.toString() || '',
    name: doc.name || '',
    permissions: JSON.stringify(doc.permissions || []),
    active: doc.active !== undefined ? doc.active : true,
    expiresAt: doc.expiresAt?.toISOString() || null,
    lastUsedAt: doc.lastUsedAt?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// AdminRequest
function transformAdminRequest(doc) {
  return {
    userId: doc.user?.toString() || '',
    requestType: doc.requestType || '',
    reason: doc.reason || '',
    status: doc.status || 'pending',
    reviewedBy: doc.reviewedBy?.toString() || '',
    reviewedAt: doc.reviewedAt?.toISOString() || null,
    notes: doc.notes || '',
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

// Counter
function transformCounter(doc) {
  return {
    name: doc.name || '',
    value: doc.value || 0,
    description: doc.description || '',
    category: doc.category || '',
    mongoId: doc._id.toString()
  };
}

// ConversionLog
function transformConversionLog(doc) {
  return {
    entityType: doc.entityType || '',
    entityId: doc.entityId?.toString() || '',
    conversionType: doc.conversionType || '',
    fromValue: doc.fromValue || '',
    toValue: doc.toValue || '',
    status: doc.status || '',
    errorMessage: doc.errorMessage || '',
    metadata: JSON.stringify(doc.metadata || {}),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    mongoId: doc._id.toString()
  };
}

/**
 * Main migration function
 */
async function migrateAll() {
  console.log('🚀 Starting COMPLETE migration from MongoDB to Appwrite...\n');
  console.log('==================================================');

  if (!APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY not found in environment variables');
    console.log('Please add APPWRITE_API_KEY to your .env file');
    process.exit(1);
  }

  try {
    await connectMongoDB();

    // Migrate all collections
    const migrations = [
      { Model: User, collectionId: 'users', transformFn: transformUser, name: 'Users' },
      { Model: Profile, collectionId: 'profiles', transformFn: transformProfile, name: 'Profiles' },
      { Model: Blog, collectionId: 'blogs', transformFn: transformBlog, name: 'Blogs' },
      { Model: Project, collectionId: 'projects', transformFn: transformProject, name: 'Projects' },
      { Model: Chat, collectionId: 'chats', transformFn: transformChat, name: 'Chats' },
      { Model: Contact, collectionId: 'contacts', transformFn: transformContact, name: 'Contacts' },
      { Model: ContactInfo, collectionId: 'contact_info', transformFn: transformContactInfo, name: 'Contact Info' },
      { Model: CodeProject, collectionId: 'code_projects', transformFn: transformCodeProject, name: 'Code Projects' },
      { Model: Education, collectionId: 'education', transformFn: transformEducation, name: 'Education' },
      { Model: Experience, collectionId: 'experience', transformFn: transformExperience, name: 'Experience' },
      { Model: Skill, collectionId: 'skills', transformFn: transformSkill, name: 'Skills' },
      { Model: Service, collectionId: 'services', transformFn: transformService, name: 'Services' },
      { Model: Testimonial, collectionId: 'testimonials', transformFn: transformTestimonial, name: 'Testimonials' },
      { Model: Achievement, collectionId: 'achievements', transformFn: transformAchievement, name: 'Achievements' },
      { Model: Gallery, collectionId: 'gallery', transformFn: transformGallery, name: 'Gallery' },
      { Model: Vlog, collectionId: 'vlogs', transformFn: transformVlog, name: 'Vlogs' },
      { Model: AccessKey, collectionId: 'access_keys', transformFn: transformAccessKey, name: 'Access Keys' },
      { Model: AdminRequest, collectionId: 'admin_requests', transformFn: transformAdminRequest, name: 'Admin Requests' },
      { Model: Counter, collectionId: 'counters', transformFn: transformCounter, name: 'Counters' },
      { Model: ConversionLog, collectionId: 'conversion_logs', transformFn: transformConversionLog, name: 'Conversion Logs' }
    ];

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const migration of migrations) {
      const result = await migrateCollection(
        migration.Model,
        migration.collectionId,
        migration.transformFn,
        migration.name
      );
      
      totalSuccess += result.success;
      totalFailed += result.failed;
      
      // Update stats
      const statKey = migration.collectionId.replace(/_/g, '').replace(/s$/, '');
      if (stats[statKey]) {
        stats[statKey] = result;
      }
    }

    // Print summary
    console.log('\n==================================================');
    console.log('📊 MIGRATION COMPLETE - Summary:');
    console.log('==================================================\n');
    
    for (const migration of migrations) {
      const statKey = migration.collectionId.replace(/_/g, '').replace(/s$/, '');
      const stat = stats[statKey] || { success: 0, failed: 0 };
      if (stat.success > 0 || stat.failed > 0) {
        console.log(`${migration.name.padEnd(20)} ✅ ${stat.success}  ❌ ${stat.failed}`);
      }
    }
    
    console.log('\n==================================================');
    console.log(`TOTAL:               ✅ ${totalSuccess}  ❌ ${totalFailed}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
}

/**
 * Rollback function - deletes all migrated data
 */
async function rollback() {
  console.log('🔄 Starting rollback - deleting all Appwrite data...\n');
  
  const collections = [
    'users', 'profiles', 'blogs', 'projects', 'chats', 'contacts',
    'contact_info', 'code_projects', 'education', 'experience',
    'skills', 'services', 'testimonials', 'achievements', 'gallery',
    'vlogs', 'access_keys', 'admin_requests', 'counters', 'conversion_logs'
  ];

  for (const collectionId of collections) {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, collectionId);
      
      for (const doc of response.documents) {
        await databases.deleteDocument(APPWRITE_DATABASE_ID, collectionId, doc.$id);
      }
      
      console.log(`✅ Deleted ${response.documents.length} documents from ${collectionId}`);
    } catch (error) {
      console.log(`⚠️  Collection ${collectionId} not found or empty`);
    }
  }
  
  console.log('\n✅ Rollback complete');
}

// Run migration or rollback
const command = process.argv[2];

if (command === 'rollback') {
  rollback();
} else {
  migrateAll();
}
