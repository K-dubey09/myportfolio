import firebaseConfig, { admin } from '../config/firebase.js';

/**
 * Firestore CRUD Utilities with duplicate prevention and validation
 */
export class FirestoreCRUD {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    return firebaseConfig.getFirestore().collection(this.collectionName);
  }

  /**
   * Check if document with specific field value exists
   */
  async exists(field, value, excludeId = null) {
    try {
      let query = this.getCollection().where(field, '==', value);
      const snapshot = await query.get();
      
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId);
      }
      return !snapshot.empty;
    } catch (error) {
      console.error(`Error checking existence in ${this.collectionName}:`, error);
      return false;
    }
  }

  /**
   * Create a new document with duplicate checking
   */
  async create(data, uniqueFields = []) {
    try {
      // Check for duplicates
      for (const field of uniqueFields) {
        if (data[field]) {
          const exists = await this.exists(field, data[field]);
          if (exists) {
            throw new Error(`${field} already exists: ${data[field]}`);
          }
        }
      }

      const docRef = this.getCollection().doc();
      const docData = {
        ...data,
        id: docRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await docRef.set(docData);
      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get single document by ID
   */
  async getById(id) {
    try {
      const doc = await this.getCollection().doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents with optional filters and sorting
   */
  async getAll(options = {}) {
    try {
      let query = this.getCollection();

      // Apply filters
      if (options.where) {
        for (const [field, operator, value] of options.where) {
          query = query.where(field, operator, value);
        }
      }

      // Apply sorting
      if (options.orderBy) {
        const { field, direction = 'asc' } = options.orderBy;
        query = query.orderBy(field, direction);
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update document with duplicate checking
   */
  async update(id, data, uniqueFields = []) {
    try {
      // Check if document exists
      const doc = await this.getById(id);
      if (!doc) {
        throw new Error('Document not found');
      }

      // Check for duplicates (excluding current document)
      for (const field of uniqueFields) {
        if (data[field]) {
          const exists = await this.exists(field, data[field], id);
          if (exists) {
            throw new Error(`${field} already exists: ${data[field]}`);
          }
        }
      }

      const updateData = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.getCollection().doc(id).update(updateData);
      return await this.getById(id);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id) {
    try {
      const doc = await this.getById(id);
      if (!doc) {
        throw new Error('Document not found');
      }

      await this.getCollection().doc(id).delete();
      return { id, deleted: true };
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Count documents with optional filters
   */
  async count(filters = {}) {
    try {
      let query = this.getCollection();

      if (filters.where) {
        for (const [field, operator, value] of filters.where) {
          query = query.where(field, operator, value);
        }
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error counting documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Search documents by text field (case-insensitive)
   */
  async search(field, searchTerm) {
    try {
      const allDocs = await this.getAll();
      const lowerSearch = searchTerm.toLowerCase();
      
      return allDocs.filter(doc => {
        const fieldValue = doc[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(lowerSearch);
        }
        return false;
      });
    } catch (error) {
      console.error(`Error searching in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch create multiple documents
   */
  async batchCreate(items, uniqueFields = []) {
    try {
      const batch = firebaseConfig.getFirestore().batch();
      const results = [];

      for (const item of items) {
        // Check duplicates
        for (const field of uniqueFields) {
          if (item[field]) {
            const exists = await this.exists(field, item[field]);
            if (exists) {
              throw new Error(`Duplicate ${field}: ${item[field]}`);
            }
          }
        }

        const docRef = this.getCollection().doc();
        const docData = {
          ...item,
          id: docRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.set(docRef, docData);
        results.push({ id: docRef.id, ...docData });
      }

      await batch.commit();
      return results;
    } catch (error) {
      console.error(`Error batch creating in ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Create instances for each collection
export const profileCRUD = new FirestoreCRUD('profiles');
export const skillsCRUD = new FirestoreCRUD('skills');
export const projectsCRUD = new FirestoreCRUD('projects');
export const experiencesCRUD = new FirestoreCRUD('experiences');
export const educationCRUD = new FirestoreCRUD('education');
export const blogsCRUD = new FirestoreCRUD('blogs');
export const vlogsCRUD = new FirestoreCRUD('vlogs');
export const galleryCRUD = new FirestoreCRUD('gallery');
export const testimonialsCRUD = new FirestoreCRUD('testimonials');
export const servicesCRUD = new FirestoreCRUD('services');
export const contactsCRUD = new FirestoreCRUD('contacts');
export const contactInfoCRUD = new FirestoreCRUD('contactInfo');
export const achievementsCRUD = new FirestoreCRUD('achievements');
// History/audit trail for contact info changes
export const contactInfoHistoryCRUD = new FirestoreCRUD('contactInfoHistory');
export const accessKeysCRUD = new FirestoreCRUD('accessKeys');
export const adminRequestsCRUD = new FirestoreCRUD('adminRequests');
