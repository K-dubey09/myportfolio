import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload utility for Firebase Storage
 * Supports unlimited file sizes with resumable uploads and progress tracking
 */

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @param {string} folder - Optional folder path (default: 'uploads')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFileToStorage = async (file, onProgress = null, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Create upload task for resumable uploads
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size.toString()
        }
      });

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          if (onProgress && typeof onProgress === 'function') {
            onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
          }

          // Log upload state
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload paused');
              break;
            case 'running':
              console.log(`Upload progress: ${progress.toFixed(2)}%`);
              break;
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {Function} onFileProgress - Callback for individual file progress
 * @param {Function} onTotalProgress - Callback for total upload progress
 * @param {string} folder - Optional folder path
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleFilesToStorage = async (
  files,
  onFileProgress = null,
  onTotalProgress = null,
  folder = 'uploads'
) => {
  const uploadPromises = files.map((file, index) => {
    return uploadFileToStorage(
      file,
      (progress, transferred, total) => {
        if (onFileProgress) {
          onFileProgress(index, progress, transferred, total, file.name);
        }

        // Calculate total progress across all files
        if (onTotalProgress) {
          const totalSize = files.reduce((sum, f) => sum + f.size, 0);
          const currentFileProgress = (transferred / totalSize) * 100;
          onTotalProgress(currentFileProgress);
        }
      },
      folder
    );
  });

  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The download URL or path of the file
 * @returns {Promise<void>}
 */
export const deleteFileFromStorage = async (fileUrl) => {
  try {
    // Extract file path from URL
    let filePath = fileUrl;
    
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      const urlParts = fileUrl.split('/o/');
      if (urlParts.length > 1) {
        filePath = decodeURIComponent(urlParts[1].split('?')[0]);
      }
    }

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file metadata from URL
 * @param {string} fileUrl - The download URL of the file
 * @returns {Object} - File metadata
 */
export const getFileMetadata = (fileUrl) => {
  try {
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    const extension = fileName.split('.').pop();

    return {
      fileName,
      extension,
      url: fileUrl
    };
  } catch (error) {
    console.error('Error parsing file metadata:', error);
    return null;
  }
};

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = Infinity, // No limit by default
    allowedTypes = [], // Empty array means all types allowed
    allowedExtensions = [] // Empty array means all extensions allowed
  } = options;

  // Check file size
  if (maxSize !== Infinity && file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`
      };
    }
  }

  return { valid: true, error: null };
};

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default {
  uploadFileToStorage,
  uploadMultipleFilesToStorage,
  deleteFileFromStorage,
  getFileMetadata,
  validateFile,
  formatFileSize
};
