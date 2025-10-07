// Specialized controller for ContactInfo - ensures only one record exists
import ContactInfo from '../models/ContactInfo.js';
import { GridFSUtils } from '../utils/fileUpload.js';

export const contactInfoController = {
  // Get all items (will always return array with single item or empty)
  async getAll(req, res) {
    try {
      const contactInfo = await ContactInfo.findOne();
      res.json(contactInfo ? [contactInfo] : []);
    } catch (error) {
      console.error('Error fetching ContactInfo:', error);
      res.status(500).json({ error: 'Failed to fetch ContactInfo' });
    }
  },

  // Get single item (returns the one and only contact info)
  async getById(req, res) {
    try {
      const contactInfo = await ContactInfo.findOne();
      if (!contactInfo) {
        return res.status(404).json({ error: 'ContactInfo not found' });
      }
      res.json(contactInfo);
    } catch (error) {
      console.error('Error fetching ContactInfo:', error);
      res.status(500).json({ error: 'Failed to fetch ContactInfo' });
    }
  },

  // Create or update contact info (ensures only one record exists)
  async create(req, res) {
    try {
      // Check if contact info already exists
      const existingContactInfo = await ContactInfo.findOne();
      
      if (existingContactInfo) {
        // Update existing record instead of creating new one
        const updatedContactInfo = await ContactInfo.findByIdAndUpdate(
          existingContactInfo._id,
          req.body,
          { new: true, runValidators: true }
        );
        
        res.status(200).json({ 
          message: 'ContactInfo updated successfully (only one record allowed)', 
          item: updatedContactInfo 
        });
      } else {
        // Create new record
        const contactInfo = new ContactInfo(req.body);
        await contactInfo.save();
        res.status(201).json({ 
          message: 'ContactInfo created successfully', 
          item: contactInfo 
        });
      }
    } catch (error) {
      console.error('Error creating/updating ContactInfo:', error);
      res.status(500).json({ error: 'Failed to create/update ContactInfo' });
    }
  },

  // Update item (updates the single contact info record)
  async update(req, res) {
    try {
      // Always update the single existing record, ignore the ID in params
      const contactInfo = await ContactInfo.findOne();
      
      if (!contactInfo) {
        // If no record exists, create one
        const newContactInfo = new ContactInfo(req.body);
        await newContactInfo.save();
        res.status(201).json({ 
          message: 'ContactInfo created successfully', 
          item: newContactInfo 
        });
      } else {
        // Update the existing record
        const updatedContactInfo = await ContactInfo.findByIdAndUpdate(
          contactInfo._id,
          req.body,
          { new: true, runValidators: true }
        );
        
        res.json({ 
          message: 'ContactInfo updated successfully', 
          item: updatedContactInfo 
        });
      }
    } catch (error) {
      console.error('Error updating ContactInfo:', error);
      res.status(500).json({ error: 'Failed to update ContactInfo' });
    }
  },

  // Delete item (clears the contact info but doesn't delete the record)
  async delete(req, res) {
    try {
      const contactInfo = await ContactInfo.findOne();
      if (!contactInfo) {
        return res.status(404).json({ error: 'ContactInfo not found' });
      }

      // Delete associated files if they exist
      const fileFields = ['imageUrl', 'featuredImage', 'avatar', 'profilePicture', 'companyLogo', 'logo', 'thumbnail'];
      
      for (const field of fileFields) {
        if (contactInfo[field] && contactInfo[field].includes('/api/files/')) {
          const filename = contactInfo[field].split('/').pop();
          try {
            await GridFSUtils.deleteFile(filename);
          } catch (err) {
            console.log(`File ${filename} not found or already deleted`);
          }
        }
      }

      // Reset to default values instead of deleting
      const defaultContactInfo = {
        email: '',
        phone: '',
        alternateEmail: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        businessHours: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          youtube: ''
        },
        website: '',
        availability: 'available',
        responseTime: '',
        timezone: '',
        callToAction: {
          title: '',
          subtitle: '',
          buttonText: ''
        },
        displaySettings: {
          showEmail: true,
          showAddress: true,
          showPhone: true,
          showBusinessHours: true,
          showSocialLinks: true,
          showAvailability: true
        }
      };

      const updatedContactInfo = await ContactInfo.findByIdAndUpdate(
        contactInfo._id,
        defaultContactInfo,
        { new: true, runValidators: true }
      );

      res.json({ 
        message: 'ContactInfo reset to defaults successfully', 
        item: updatedContactInfo 
      });
    } catch (error) {
      console.error('Error resetting ContactInfo:', error);
      res.status(500).json({ error: 'Failed to reset ContactInfo' });
    }
  },

  // Upload file for contact info
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
        category: req.body.category || 'contactinfo',
        modelType: 'ContactInfo'
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
  },

  // Helper method to get or create single contact info
  async getOrCreate(req, res) {
    try {
      let contactInfo = await ContactInfo.findOne();
      
      if (!contactInfo) {
        // Create default contact info if none exists
        const defaultData = {
          email: '',
          phone: '',
          alternateEmail: '',
          alternatePhone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          businessHours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: ''
          },
          socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            instagram: '',
            youtube: ''
          },
          website: '',
          availability: 'available',
          responseTime: '',
          timezone: '',
          callToAction: {
            title: '',
            subtitle: '',
            buttonText: ''
          },
          displaySettings: {
            showEmail: true,
            showAddress: true,
            showPhone: true,
            showBusinessHours: true,
            showSocialLinks: true,
            showAvailability: true
          }
        };
        
        contactInfo = new ContactInfo(defaultData);
        await contactInfo.save();
      }
      
      res.json(contactInfo);
    } catch (error) {
      console.error('Error getting/creating ContactInfo:', error);
      res.status(500).json({ error: 'Failed to get/create ContactInfo' });
    }
  }
};

export default contactInfoController;