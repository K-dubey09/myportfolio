import path from 'path';

/**
 * Storage folder structure helpers for Firebase Storage
 * Organizes files into: images/, videos/, songs/, documents/
 */

export const StorageFolders = {
  IMAGES: 'images',
  VIDEOS: 'videos',
  SONGS: 'songs',
  DOCUMENTS: 'documents',
  THUMBNAILS: 'thumbnails',
  TEMP: 'temp'
};

/**
 * Get storage folder based on file type
 * @param {string} mimetype - File MIME type
 * @param {string} originalname - Original filename
 * @returns {string} Folder name
 */
export function getStorageFolder(mimetype, originalname = '') {
  const ext = path.extname(originalname).toLowerCase();
  
  // Image files
  if (mimetype.startsWith('image/')) {
    return StorageFolders.IMAGES;
  }
  
  // Video files
  if (mimetype.startsWith('video/')) {
    return StorageFolders.VIDEOS;
  }
  
  // Audio files
  if (mimetype.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
    return StorageFolders.SONGS;
  }
  
  // Document files
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('document') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('presentation') ||
    ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'].includes(ext)
  ) {
    return StorageFolders.DOCUMENTS;
  }
  
  // Default to documents folder
  return StorageFolders.DOCUMENTS;
}

/**
 * Generate storage path for file
 * @param {string} folder - Folder name
 * @param {string} filename - File name
 * @returns {string} Full storage path
 */
export function getStoragePath(folder, filename) {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${folder}/${timestamp}_${sanitized}`;
}

/**
 * Check if file type is allowed for documents
 * @param {string} mimetype - File MIME type
 * @param {string} originalname - Original filename
 * @returns {boolean} True if allowed
 */
export function isDocumentAllowed(mimetype, originalname) {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'];
  const ext = path.extname(originalname).toLowerCase();
  
  return allowedMimeTypes.includes(mimetype) || allowedExtensions.includes(ext);
}

/**
 * Check if file type is allowed for images
 * @param {string} mimetype - File MIME type
 * @returns {boolean} True if allowed
 */
export function isImageAllowed(mimetype) {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  return allowedMimeTypes.includes(mimetype);
}

/**
 * Check if file type is allowed for videos
 * @param {string} mimetype - File MIME type
 * @returns {boolean} True if allowed
 */
export function isVideoAllowed(mimetype) {
  const allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];
  
  return allowedMimeTypes.includes(mimetype);
}

/**
 * Get file extension from mimetype
 * @param {string} mimetype - File MIME type
 * @returns {string} File extension
 */
export function getExtensionFromMimetype(mimetype) {
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };
  
  return mimeMap[mimetype] || '';
}

/**
 * Parse storage URL to get file path
 * @param {string} url - Storage URL
 * @returns {string} File path
 */
export function getPathFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove leading /v0/b/bucket-name/o/
    const match = pathname.match(/\/o\/(.*?)(?:\?|$)/);
    return match ? decodeURIComponent(match[1]) : pathname;
  } catch (error) {
    return url;
  }
}

export default {
  StorageFolders,
  getStorageFolder,
  getStoragePath,
  isDocumentAllowed,
  isImageAllowed,
  isVideoAllowed,
  getExtensionFromMimetype,
  getPathFromUrl
};
