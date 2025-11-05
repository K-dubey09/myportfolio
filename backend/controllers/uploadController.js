import firebaseConfig from '../config/firebase.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = firebaseConfig.getStorage();

/**
 * Upload Controller
 * Handles file uploads to Firebase Storage
 */

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Infinity // No file size limit - Firebase Storage handles large files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, documents, and other multimedia formats
    const allowedMimes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mpeg',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-matroska', // .mkv
      'video/x-flv', // .flv
      'video/3gpp',
      'video/3gpp2',
      // Audio
      'audio/mpeg', // .mp3
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
      'audio/flac',
      'audio/x-m4a',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      // Other
      'application/json',
      'application/xml',
      'text/csv'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload single file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileUpload = bucket.file(filePath);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: req.user?.userId || 'anonymous',
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Store file metadata in Firestore
    const db = firebaseConfig.getFirestore();
    const fileDoc = await db.collection('uploads').add({
      fileName,
      originalName: file.originalname,
      filePath,
      publicUrl,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user?.userId || 'anonymous',
      uploadedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        id: fileDoc.id,
        url: publicUrl,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `uploads/${fileName}`;

      const bucket = storage.bucket();
      const fileUpload = bucket.file(filePath);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.user?.userId || 'anonymous',
            uploadedAt: new Date().toISOString()
          }
        }
      });

      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      const db = firebaseConfig.getFirestore();
      const fileDoc = await db.collection('uploads').add({
        fileName,
        originalName: file.originalname,
        filePath,
        publicUrl,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: req.user?.userId || 'anonymous',
        uploadedAt: new Date().toISOString()
      });

      return {
        id: fileDoc.id,
        url: publicUrl,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
      message: error.message
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const db = firebaseConfig.getFirestore();
    const fileDoc = await db.collection('uploads').doc(id).get();

    if (!fileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const fileData = fileDoc.data();

    // Delete from Firebase Storage
    const bucket = storage.bucket();
    await bucket.file(fileData.filePath).delete();

    // Delete metadata from Firestore
    await db.collection('uploads').doc(id).delete();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message
    });
  }
};

// Get file metadata
export const getFile = async (req, res) => {
  try {
    const { id } = req.params;

    const db = firebaseConfig.getFirestore();
    const fileDoc = await db.collection('uploads').doc(id).get();

    if (!fileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: fileDoc.id,
        ...fileDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file',
      message: error.message
    });
  }
};

// List all uploads
export const listUploads = async (req, res) => {
  try {
    const db = firebaseConfig.getFirestore();
    const uploadsRef = db.collection('uploads');
    const snapshot = await uploadsRef.orderBy('uploadedAt', 'desc').limit(100).get();

    const uploads = [];
    snapshot.forEach(doc => {
      uploads.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    console.error('Error listing uploads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list uploads',
      message: error.message
    });
  }
};

export const UploadController = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFile,
  listUploads
};

export { upload };

export default UploadController;
