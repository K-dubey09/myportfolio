import mongoose from 'mongoose';
import { FileUtils } from '../utils/fileUpload.js';

// File serving route
export const serveFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Check if file exists
    const file = await FileUtils.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Content-Disposition': `inline; filename="${file.metadata?.originalName || file.filename}"`
    });

    // Stream the file
    const readStream = FileUtils.getFileStream(fileId);
    
    readStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });

    readStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
};

// Get file info
export const getFileInfo = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileUtils.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      id: file._id,
      filename: file.filename,
      originalName: file.metadata?.originalName,
      contentType: file.contentType,
      length: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata
    });
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    const file = await FileUtils.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await FileUtils.deleteFileById(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};