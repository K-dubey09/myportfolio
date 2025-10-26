import { Client, Databases, Storage, Users } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

class AppwriteService {
  constructor() {
    this.client = null;
    this.databases = null;
    this.storage = null;
    this.users = null;
    this.initialized = false;
  }

  /**
   * Initialize Appwrite client and services
   */
  initialize() {
    try {
      // Only initialize if environment variables are set
      if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
        console.log('⚠️  Appwrite configuration not found in environment variables');
        console.log('   Appwrite services will not be available');
        return false;
      }

      this.client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      this.databases = new Databases(this.client);
      this.storage = new Storage(this.client);
      this.users = new Users(this.client);

      this.initialized = true;
      console.log('✅ Appwrite client initialized successfully');
      console.log(`   Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
      console.log(`   Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Appwrite client:', error.message);
      return false;
    }
  }

  /**
   * Check if Appwrite is initialized and ready to use
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get Databases service
   */
  getDatabases() {
    if (!this.initialized) {
      throw new Error('Appwrite client not initialized. Call initialize() first.');
    }
    return this.databases;
  }

  /**
   * Get Storage service
   */
  getStorage() {
    if (!this.initialized) {
      throw new Error('Appwrite client not initialized. Call initialize() first.');
    }
    return this.storage;
  }

  /**
   * Get Users service
   */
  getUsers() {
    if (!this.initialized) {
      throw new Error('Appwrite client not initialized. Call initialize() first.');
    }
    return this.users;
  }

  /**
   * Get the raw Appwrite client
   */
  getClient() {
    if (!this.initialized) {
      throw new Error('Appwrite client not initialized. Call initialize() first.');
    }
    return this.client;
  }
}

// Export singleton instance
const appwriteService = new AppwriteService();

export default appwriteService;
