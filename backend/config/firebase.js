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

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'my-portfolio-7ceb6.appspot.com'
      });

      this.db = admin.firestore();
      this.auth = admin.auth();
      this.storage = admin.storage();
      this.initialized = true;

      console.log('Firebase Admin SDK initialized');
      console.log('Project ID: my-portfolio-7ceb6');
      return this;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  getFirestore() { return this.db; }
  getAuth() { return this.auth; }
  getStorage() { return this.storage; }

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
      conversionLogs: db.collection('conversionLogs')
    };
  }
}

const firebaseConfig = new FirebaseConfig();
export default firebaseConfig;
export { admin };
