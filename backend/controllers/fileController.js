import { GridFSUtils } from '../utils/fileUpload.js';

export const FileController = {
  // Serve file from GridFS
  async serveFile(req, res) {
    try {
      const { filename } = req.params;
      
      // Get file info first
      const fileInfo = await GridFSUtils.getFileInfo(filename);
      if (!fileInfo) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      res.set({
        'Content-Type': fileInfo.metadata.mimetype || 'application/octet-stream',
        'Content-Length': fileInfo.length,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'ETag': `"${fileInfo._id}"`,
        'Last-Modified': fileInfo.uploadDate.toUTCString()
      });

      // Check if client has cached version
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === `"${fileInfo._id}"`) {
        return res.status(304).end();
      }

      // Download and stream file
      const fileBuffer = await GridFSUtils.downloadFile(filename);
      res.send(fileBuffer);
      
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  },

  // Upload file to GridFS
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Add user info to metadata
      const metadata = {
        uploadedBy: req.user?.userId,
        uploadedByName: req.user?.name || 'Anonymous',
        userRole: req.user?.role || 'unknown',
        category: req.body.category || 'general'
      };

      const result = await GridFSUtils.uploadFile(buffer, originalname, mimetype, metadata);
      
      // Generate public URL
      const fileUrl = GridFSUtils.generateFileUrl(result.filename, req);
      
      res.json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl, // Add this for frontend compatibility
        url: fileUrl, // Keep this for backwards compatibility
        file: {
          ...result,
          url: fileUrl
        }
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  // List files with admin access
  async listFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const category = req.query.category;
      
      let filter = {};
      if (category) {
        filter['metadata.category'] = category;
      }

      // Non-admin users can only see their own uploads
      if (req.user?.role !== 'admin') {
        filter['metadata.uploadedBy'] = req.user?.userId;
      }

      const result = await GridFSUtils.listFiles(page, limit, filter);
      
      // Add URLs to files
      result.files = result.files.map(file => ({
        ...file,
        url: GridFSUtils.generateFileUrl(file.filename, req)
      }));

      res.json(result);
      
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  },

  // Delete file (admin only or file owner)
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      
      // Check file ownership for non-admin users
      if (req.user?.role !== 'admin') {
        const fileInfo = await GridFSUtils.getFileInfo(filename);
        if (!fileInfo || fileInfo.metadata.uploadedBy !== req.user?.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }
      }

      const deleted = await GridFSUtils.deleteFile(filename);
      
      if (deleted) {
        res.json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
      
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  },

  // Get file info
  async getFileInfo(req, res) {
    try {
      const { filename } = req.params;
      
      const fileInfo = await GridFSUtils.getFileInfo(filename);
      if (!fileInfo) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check access permissions for non-admin users
      if (req.user?.role !== 'admin' && fileInfo.metadata.uploadedBy !== req.user?.userId) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const fileData = {
        ...fileInfo,
        url: GridFSUtils.generateFileUrl(fileInfo.filename, req)
      };

      res.json(fileData);
      
    } catch (error) {
      console.error('Error getting file info:', error);
      res.status(500).json({ error: 'Failed to get file info' });
    }
  }
};