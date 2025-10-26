import { ID, InputFile } from 'node-appwrite';
import appwriteService from '../config/appwrite.js';
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';

/**
 * Appwrite Storage utility for file uploads
 * Provides an alternative to GridFS for file storage
 */
class AppwriteStorage {
  constructor() {
    this.bucketId = process.env.APPWRITE_BUCKET_ID;
  }

  /**
   * Check if Appwrite Storage is available
   */
  isAvailable() {
    return appwriteService.isInitialized() && this.bucketId;
  }

  /**
   * Upload a file to Appwrite Storage
   * @param {Object} file - Multer file object
   * @param {string} fileId - Optional custom file ID
   * @returns {Promise<Object>} Upload result with file ID and URL
   */
  async uploadFile(file, fileId = null) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured. Set APPWRITE_BUCKET_ID in .env');
    }

    try {
      const storage = appwriteService.getStorage();
      const id = fileId || ID.unique();

      // Read file as buffer
      const fileBuffer = await fs.readFile(file.path);
      
      // Create InputFile from buffer
      const inputFile = InputFile.fromBuffer(
        fileBuffer,
        file.originalname
      );

      // Upload to Appwrite Storage
      const result = await storage.createFile(
        this.bucketId,
        id,
        inputFile
      );

      // Generate file URL
      const fileUrl = this.getFileUrl(result.$id);

      return {
        id: result.$id,
        name: result.name,
        size: result.sizeOriginal,
        mimeType: result.mimeType,
        url: fileUrl,
        createdAt: result.$createdAt
      };
    } catch (error) {
      console.error('Error uploading file to Appwrite:', error);
      throw new Error(`Appwrite upload failed: ${error.message}`);
    }
  }

  /**
   * Get file URL from Appwrite Storage
   * @param {string} fileId - The file ID
   * @returns {string} Public file URL
   */
  getFileUrl(fileId) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured');
    }

    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;
    
    return `${endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${projectId}`;
  }

  /**
   * Get file download URL from Appwrite Storage
   * @param {string} fileId - The file ID
   * @returns {string} Download URL
   */
  getDownloadUrl(fileId) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured');
    }

    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;
    
    return `${endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/download?project=${projectId}`;
  }

  /**
   * Delete a file from Appwrite Storage
   * @param {string} fileId - The file ID to delete
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured');
    }

    try {
      const storage = appwriteService.getStorage();
      await storage.deleteFile(this.bucketId, fileId);
      console.log(`✅ File deleted from Appwrite: ${fileId}`);
    } catch (error) {
      console.error('Error deleting file from Appwrite:', error);
      throw new Error(`Appwrite delete failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata from Appwrite Storage
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileInfo(fileId) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured');
    }

    try {
      const storage = appwriteService.getStorage();
      const file = await storage.getFile(this.bucketId, fileId);
      
      return {
        id: file.$id,
        name: file.name,
        size: file.sizeOriginal,
        mimeType: file.mimeType,
        url: this.getFileUrl(file.$id),
        downloadUrl: this.getDownloadUrl(file.$id),
        createdAt: file.$createdAt,
        updatedAt: file.$updatedAt
      };
    } catch (error) {
      console.error('Error getting file info from Appwrite:', error);
      throw new Error(`Appwrite getFile failed: ${error.message}`);
    }
  }

  /**
   * List files in the bucket
   * @param {number} limit - Maximum number of files to return
   * @param {string} offset - Offset for pagination
   * @returns {Promise<Object>} List of files
   */
  async listFiles(limit = 25, offset = 0) {
    if (!this.isAvailable()) {
      throw new Error('Appwrite Storage not configured');
    }

    try {
      const storage = appwriteService.getStorage();
      const result = await storage.listFiles(
        this.bucketId,
        [],
        limit,
        offset
      );

      return {
        total: result.total,
        files: result.files.map(file => ({
          id: file.$id,
          name: file.name,
          size: file.sizeOriginal,
          mimeType: file.mimeType,
          url: this.getFileUrl(file.$id),
          createdAt: file.$createdAt
        }))
      };
    } catch (error) {
      console.error('Error listing files from Appwrite:', error);
      throw new Error(`Appwrite listFiles failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const appwriteStorage = new AppwriteStorage();

export default appwriteStorage;
