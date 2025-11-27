import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FirebaseConfig {
  constructor() {
    this.db = null;
    this.auth = null;
    this.storage = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return this;
    
    try {
      let serviceAccount;
      const defaultPath = join(__dirname, '..', 'firebase-service-account.json');
      serviceAccount = JSON.parse(readFileSync(defaultPath, 'utf8'));

      const envBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET;
      const bucketToUse = envBucket || `${serviceAccount.project_id}.appspot.com`;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: bucketToUse
      });

      this.db = admin.firestore();
      this.auth = admin.auth();
      this.storage = admin.storage();
      this.projectId = serviceAccount.project_id;
      this.storageBucketName = bucketToUse;
      this.initialized = true;

      console.log('✅ Firebase Admin SDK initialized');
      console.log('✅ Project ID:', this.projectId);
      console.log('✅ Storage Bucket:', this.storageBucketName);
      console.log('✅ Firestore available:', !!this.db);
      return this;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error;
    }
  }

  getFirestore() { 
    if (!this.initialized || !this.db) {
      console.error('⚠️  Firestore not initialized. Call initialize() first.');
      throw new Error('Firestore not initialized. Please ensure Firebase is initialized before use.');
    }
    return this.db; 
  }
  getAuth() { 
    if (!this.initialized || !this.auth) {
      throw new Error('Auth not initialized. Please ensure Firebase is initialized before use.');
    }
    return this.auth; 
  }
  getStorage() { 
    if (!this.initialized || !this.storage) {
      throw new Error('Storage not initialized. Please ensure Firebase is initialized before use.');
    }
    return this.storage; 
  }

  getProjectId() { return this.projectId; }
  getStorageBucketName() { return this.storageBucketName; }

  get collections() {
    const db = this.getFirestore();
    return {
      users: db.collection('users'),
      profiles: db.collection('profiles'),
      skills: db.collection('skills'),
      projects: db.collection('projects'),
      experiences: db.collection('experiences'),
      education: db.collection('education'),
      blogs: db.collection('blogs'),
      vlogs: db.collection('vlogs'),
      gallery: db.collection('gallery'),
      testimonials: db.collection('testimonials'),
      services: db.collection('services'),
      contacts: db.collection('contacts'),
      contactInfo: db.collection('contactInfo'),
      achievements: db.collection('achievements'),
      accessKeys: db.collection('accessKeys'),
      adminRequests: db.collection('adminRequests'),
      conversionLogs: db.collection('conversionLogs'),
      userActivityLogs: db.collection('userActivityLogs')
    };
  }
}

const firebaseConfig = new FirebaseConfig();
export default firebaseConfig;
export { admin };
