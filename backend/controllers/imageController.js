import { GridFSUtils } from '../utils/fileUpload.js';
import sharp from 'sharp';
import path from 'path';

// Image processing and upload controller
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { category = 'general', resize = false, quality = 80 } = req.body;

    // Validate image type
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    let processedBuffer = buffer;
    let processedMimetype = mimetype;

    // Image processing with sharp if resize is requested
    if (resize) {
      const { width, height } = JSON.parse(resize);
      
      processedBuffer = await sharp(buffer)
        .resize(width, height, { 
          fit: 'cover',
          withoutEnlargement: true 
        })
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();
      
      processedMimetype = 'image/jpeg';
    }

    // Generate metadata
    const metadata = {
      category,
      originalName: originalname,
      processedAt: resize ? new Date() : null,
      uploadedBy: req.user?.id || 'system',
      size: processedBuffer.length,
      originalSize: buffer.length
    };

    // Upload to GridFS
    const uploadResult = await GridFSUtils.uploadFile(
      processedBuffer,
      originalname,
      processedMimetype,
      metadata
    );

    // Generate URL
    const imageUrl = GridFSUtils.generateFileUrl(uploadResult.filename, req);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        fileId: uploadResult.fileId,
        filename: uploadResult.filename,
        originalname: uploadResult.originalname,
        url: imageUrl,
        size: uploadResult.size,
        mimetype: processedMimetype,
        category,
        uploadDate: uploadResult.uploadDate
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const { category = 'general', resize = false, quality = 80 } = req.body;
    const uploadPromises = [];

    for (const file of req.files) {
      if (!file.mimetype.startsWith('image/')) {
        continue; // Skip non-image files
      }

      let processedBuffer = file.buffer;
      let processedMimetype = file.mimetype;

      // Image processing if requested
      if (resize) {
        const { width, height } = JSON.parse(resize);
        
        processedBuffer = await sharp(file.buffer)
          .resize(width, height, { 
            fit: 'cover',
            withoutEnlargement: true 
          })
          .jpeg({ quality: parseInt(quality) })
          .toBuffer();
        
        processedMimetype = 'image/jpeg';
      }

      const metadata = {
        category,
        originalName: file.originalname,
        processedAt: resize ? new Date() : null,
        uploadedBy: req.user?.id || 'system',
        size: processedBuffer.length,
        originalSize: file.buffer.length
      };

      uploadPromises.push(
        GridFSUtils.uploadFile(
          processedBuffer,
          file.originalname,
          processedMimetype,
          metadata
        )
      );
    }

    const uploadResults = await Promise.all(uploadPromises);
    const imageData = uploadResults.map(result => ({
      fileId: result.fileId,
      filename: result.filename,
      originalname: result.originalname,
      url: GridFSUtils.generateFileUrl(result.filename, req),
      size: result.size,
      mimetype: result.mimetype,
      category,
      uploadDate: result.uploadDate
    }));

    res.status(201).json({
      success: true,
      message: `${uploadResults.length} images uploaded successfully`,
      data: imageData
    });

  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
};

// Get image by filename
export const getImage = async (req, res) => {
  try {
    const { filename } = req.params;

    // Get file info
    const fileInfo = await GridFSUtils.getFileInfo(filename);
    if (!fileInfo) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set cache headers for images
    res.set({
      'Content-Type': fileInfo.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'ETag': fileInfo._id.toString(),
      'Last-Modified': fileInfo.uploadDate.toUTCString()
    });

    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === fileInfo._id.toString()) {
      return res.status(304).send();
    }

    // Stream the image
    const imageBuffer = await GridFSUtils.downloadFile(filename);
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
};

// Get optimized image with dynamic resizing
export const getOptimizedImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const { w: width, h: height, q: quality = 80, f: format } = req.query;

    // Get original image
    const fileInfo = await GridFSUtils.getFileInfo(filename);
    if (!fileInfo) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageBuffer = await GridFSUtils.downloadFile(filename);
    let processedImage = sharp(imageBuffer);

    // Apply transformations
    if (width || height) {
      processedImage = processedImage.resize(
        width ? parseInt(width) : null,
        height ? parseInt(height) : null,
        { 
          fit: 'cover',
          withoutEnlargement: true 
        }
      );
    }

    // Convert format if requested
    if (format) {
      switch (format.toLowerCase()) {
        case 'webp':
          processedImage = processedImage.webp({ quality: parseInt(quality) });
          break;
        case 'jpeg':
        case 'jpg':
          processedImage = processedImage.jpeg({ quality: parseInt(quality) });
          break;
        case 'png':
          processedImage = processedImage.png({ quality: parseInt(quality) });
          break;
      }
    }

    const optimizedBuffer = await processedImage.toBuffer();

    // Set headers
    res.set({
      'Content-Type': format ? `image/${format}` : fileInfo.contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Content-Length': optimizedBuffer.length
    });

    res.send(optimizedBuffer);

  } catch (error) {
    console.error('Error serving optimized image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

// List images with filtering and pagination
export const listImages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category) {
      filter['metadata.category'] = category;
    }
    if (search) {
      filter.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { 'metadata.originalName': { $regex: search, $options: 'i' } }
      ];
    }

    // Get images from GridFS
    const result = await GridFSUtils.listFiles(
      parseInt(page),
      parseInt(limit),
      filter
    );

    // Format response
    const images = result.files.map(file => ({
      fileId: file._id,
      filename: file.filename,
      originalname: file.metadata?.originalName || file.filename,
      url: GridFSUtils.generateFileUrl(file.filename, req),
      size: file.length,
      mimetype: file.contentType,
      category: file.metadata?.category || 'uncategorized',
      uploadDate: file.uploadDate,
      metadata: file.metadata
    }));

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
};

// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    // Check if file exists
    const fileExists = await GridFSUtils.fileExists(filename);
    if (!fileExists) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete the file
    const deleted = await GridFSUtils.deleteFile(filename);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to delete image' });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

// Get image categories
export const getImageCategories = async (req, res) => {
  try {
    const categories = await GridFSUtils.listFiles(1, 1000, {});
    const categorySet = new Set();
    
    categories.files.forEach(file => {
      if (file.metadata?.category) {
        categorySet.add(file.metadata.category);
      }
    });

    res.json({
      success: true,
      data: Array.from(categorySet).sort()
    });

  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};