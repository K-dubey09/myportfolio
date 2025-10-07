import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// GridFS bucket for file storage
let bucket;

// Initialize GridFS bucket
export const initializeGridFS = () => {
  if (mongoose.connection.readyState === 1) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('✅ GridFS initialized successfully');
  } else {
    console.error('❌ Database not connected, cannot initialize GridFS');
  }
};

// Re-initialize when database connects
mongoose.connection.on('connected', () => {
  initializeGridFS();
});

// Memory storage for multer (we'll stream to GridFS)
const storage = multer.memoryStorage();

// File filter for security
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'image/svg+xml': true,
    'video/mp4': true,
    'video/mpeg': true,
    'video/quicktime': true,
    'video/x-msvideo': true, // .avi
    'video/webm': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'text/plain': true,
    'text/csv': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${Object.keys(allowedTypes).join(', ')}`), false);
  }
};

// Multer configuration with memory storage
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// GridFS File Operations
export const GridFSUtils = {
  // Upload file to GridFS
  async uploadFile(fileBuffer, originalname, mimetype, metadata = {}) {
    return new Promise((resolve, reject) => {
      if (!bucket) {
        return reject(new Error('GridFS not initialized'));
      }

      const filename = `${Date.now()}-${uuidv4()}-${originalname}`;
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          originalName: originalname,
          mimetype: mimetype,
          uploadDate: new Date(),
          ...metadata
        }
      });

      uploadStream.on('error', (error) => {
        console.error('GridFS upload error:', error);
        reject(error);
      });

      uploadStream.on('finish', (result) => {
        console.log('✅ File uploaded to GridFS:', filename);
        // The result object from GridFS finish event doesn't contain all file details
        // We need to construct the response manually
        resolve({
          fileId: uploadStream.id,
          filename: filename,
          originalname: originalname,
          mimetype: mimetype,
          size: fileBuffer.length,
          uploadDate: new Date()
        });
      });

      uploadStream.end(fileBuffer);
    });
  },

  // Download file from GridFS
  async downloadFile(filename) {
    return new Promise((resolve, reject) => {
      if (!bucket) {
        return reject(new Error('GridFS not initialized'));
      }

      const downloadStream = bucket.openDownloadStreamByName(filename);
      const chunks = [];

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('error', (error) => {
        console.error('GridFS download error:', error);
        reject(error);
      });

      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
  },

  // Get file info from GridFS
  async getFileInfo(filename) {
    if (!bucket) {
      throw new Error('GridFS not initialized');
    }

    try {
      const files = await bucket.find({ filename }).toArray();
      return files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  },

  // Delete file from GridFS
  async deleteFile(filename) {
    if (!bucket) {
      throw new Error('GridFS not initialized');
    }

    try {
      const file = await this.getFileInfo(filename);
      if (file) {
        await bucket.delete(file._id);
        console.log('✅ File deleted from GridFS:', filename);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  // Generate secure file URL
  generateFileUrl(filename, req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/api/files/${filename}`;
  },

  // Check if file exists
  async fileExists(filename) {
    try {
      const fileInfo = await this.getFileInfo(filename);
      return !!fileInfo;
    } catch (error) {
      return false;
    }
  },

  // Generate file hash for duplicate detection
  generateFileHash(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  },

  // List all files with pagination
  async listFiles(page = 1, limit = 20, filter = {}) {
    if (!bucket) {
      throw new Error('GridFS not initialized');
    }

    try {
      const skip = (page - 1) * limit;
      const files = await bucket.find(filter).skip(skip).limit(limit).toArray();
      const total = await bucket.find(filter).count();
      
      return {
        files,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error listing files:', error);
      return { files: [], total: 0, page: 1, pages: 0 };
    }
  }
};

// Legacy FileUtils for backward compatibility
export const FileUtils = {
  generateFileUrl: GridFSUtils.generateFileUrl,
  deleteFile: GridFSUtils.deleteFile,
  fileExists: GridFSUtils.fileExists
};