// Generic controller factory for CRUD operations
import { GridFSUtils } from '../utils/fileUpload.js';

export default function createCRUDController(Model, modelName) {
  return {
    // Get all items
    async getAll(req, res) {
      try {
        const items = await Model.find().sort({ createdAt: -1 });
        res.json(items);
      } catch (error) {
        console.error(`Error fetching ${modelName}:`, error);
        res.status(500).json({ error: `Failed to fetch ${modelName}` });
      }
    },

    // Get single item
    async getById(req, res) {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }
        res.json(item);
      } catch (error) {
        console.error(`Error fetching ${modelName}:`, error);
        res.status(500).json({ error: `Failed to fetch ${modelName}` });
      }
    },

    // Create new item
    async create(req, res) {
      try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json({ message: `${modelName} created successfully`, item });
      } catch (error) {
        console.error(`Error creating ${modelName}:`, error);
        res.status(500).json({ error: `Failed to create ${modelName}` });
      }
    },

    // Update item
    async update(req, res) {
      try {
        const item = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
        
        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }
        
        res.json({ message: `${modelName} updated successfully`, item });
      } catch (error) {
        console.error(`Error updating ${modelName}:`, error);
        res.status(500).json({ error: `Failed to update ${modelName}` });
      }
    },

    // Delete item
    async delete(req, res) {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }

        // Delete associated files if they exist
        const fileFields = ['imageUrl', 'featuredImage', 'avatar', 'profilePicture', 'companyLogo', 'logo', 'thumbnail', 'videoUrl'];
        
        for (const field of fileFields) {
          if (item[field] && item[field].includes('/api/files/')) {
            const filename = item[field].split('/').pop();
            try {
              await GridFSUtils.deleteFile(filename);
            } catch (err) {
              console.log(`File ${filename} not found or already deleted`);
            }
          }
        }

        // Handle arrays of files (like images array)
        if (item.images && Array.isArray(item.images)) {
          for (const imageUrl of item.images) {
            if (imageUrl.includes('/api/files/')) {
              const filename = imageUrl.split('/').pop();
              try {
                await GridFSUtils.deleteFile(filename);
              } catch (err) {
                console.log(`File ${filename} not found or already deleted`);
              }
            }
          }
        }

        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: `${modelName} deleted successfully` });
      } catch (error) {
        console.error(`Error deleting ${modelName}:`, error);
        res.status(500).json({ error: `Failed to delete ${modelName}` });
      }
    },

    // Upload file for item
    async uploadFile(req, res) {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const { buffer, originalname, mimetype } = req.file;
        
        // Add metadata for better organization
        const metadata = {
          uploadedBy: req.user?.userId,
          uploadedByName: req.user?.name || 'Anonymous',
          userRole: req.user?.role || 'unknown',
          category: req.body.category || modelName.toLowerCase(),
          modelType: modelName
        };

        const result = await GridFSUtils.uploadFile(buffer, originalname, mimetype, metadata);
        const fileUrl = GridFSUtils.generateFileUrl(result.filename, req);
        
        res.json({ 
          message: 'File uploaded successfully', 
          fileUrl,
          filename: result.filename,
          fileId: result.fileId,
          originalName: originalname,
          mimetype: mimetype,
          size: result.size
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    }
  };
}