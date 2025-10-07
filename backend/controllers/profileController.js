import Profile from '../models/Profile.js';
import { GridFSUtils } from '../utils/fileUpload.js';

export const ProfileController = {
  // Get profile (always returns single profile or creates default)
  async getProfile(req, res) {
    try {
      let profile = await Profile.findOne();
      
      if (!profile) {
        // Create default profile if none exists
        const defaultProfile = {
          name: 'Your Name',
          title: 'Your Professional Title',
          email: 'your.email@example.com',
          phone: '',
          location: '',
          bio: 'Tell us about yourself...',
          profilePicture: '',
          socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            instagram: '',
            youtube: ''
          },
          professionalContacts: {
            github: '',
            gitlab: '',
            bitbucket: '',
            stackoverflow: '',
            leetcode: '',
            codepen: '',
            behance: '',
            dribbble: '',
            medium: '',
            devto: '',
            hashnode: '',
            website: '',
            portfolio: '',
            blog: '',
            resume: '',
            discord: '',
            slack: ''
          },
          resume: ''
        };
        
        profile = new Profile(defaultProfile);
        await profile.save();
        console.log('✅ Created default profile record');
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update profile (ensures only one profile record exists)
  async updateProfile(req, res) {
    try {
      // Always find the single existing profile or create one
      let profile = await Profile.findOne();
      
      if (!profile) {
        // If no profile exists, create new one with provided data
        profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ 
          message: 'Profile created successfully', 
          profile 
        });
      } else {
        // Update existing profile (overwrite with new data)
        const updatedProfile = await Profile.findByIdAndUpdate(
          profile._id,
          req.body,
          { new: true, runValidators: true }
        );
        
        res.json({ 
          message: 'Profile updated successfully', 
          profile: updatedProfile 
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Create or update profile (handles both POST and PUT functionality)
  async createOrUpdateProfile(req, res) {
    try {
      // Check if profile already exists
      const existingProfile = await Profile.findOne();
      
      if (existingProfile) {
        // Update existing profile instead of creating new one
        const updatedProfile = await Profile.findByIdAndUpdate(
          existingProfile._id,
          req.body,
          { new: true, runValidators: true }
        );
        
        res.status(200).json({ 
          message: 'Profile updated successfully (only one profile allowed)', 
          profile: updatedProfile 
        });
      } else {
        // Create new profile
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ 
          message: 'Profile created successfully', 
          profile 
        });
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      res.status(500).json({ error: 'Failed to create/update profile' });
    }
  },

  // Upload profile picture
  async uploadProfilePicture(req, res) {
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
        category: 'profile-picture',
        modelType: 'Profile'
      };

      const result = await GridFSUtils.uploadFile(buffer, originalname, mimetype, metadata);
      const fileUrl = GridFSUtils.generateFileUrl(result.filename, req);
      
      // Get or create profile
      let profile = await Profile.findOne();
      if (!profile) {
        profile = new Profile({
          name: 'Your Name',
          title: 'Your Professional Title',
          email: 'your.email@example.com'
        });
      }

      // Delete old profile picture if it exists
      if (profile.profilePicture && profile.profilePicture.includes('/api/files/')) {
        const oldFilename = profile.profilePicture.split('/').pop();
        try {
          await GridFSUtils.deleteFile(oldFilename);
          console.log(`🗑️ Deleted old profile picture: ${oldFilename}`);
        } catch (err) {
          console.log(`Old profile picture ${oldFilename} not found or already deleted`);
        }
      }

      profile.profilePicture = fileUrl;
      await profile.save();

      res.json({ 
        message: 'Profile picture uploaded successfully', 
        fileUrl,
        filename: result.filename,
        fileId: result.fileId,
        originalName: originalname
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  },

  // Reset profile to defaults (similar to delete but keeps the record)
  async resetProfile(req, res) {
    try {
      const profile = await Profile.findOne();
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Delete profile picture if it exists
      if (profile.profilePicture && profile.profilePicture.includes('/api/files/')) {
        const filename = profile.profilePicture.split('/').pop();
        try {
          await GridFSUtils.deleteFile(filename);
        } catch (err) {
          console.log(`Profile picture ${filename} not found or already deleted`);
        }
      }

      // Reset to default values
      const defaultProfile = {
        name: 'Your Name',
        title: 'Your Professional Title',
        email: 'your.email@example.com',
        phone: '',
        location: '',
        bio: 'Tell us about yourself...',
        profilePicture: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          youtube: ''
        },
        professionalContacts: {
          github: '',
          gitlab: '',
          bitbucket: '',
          stackoverflow: '',
          leetcode: '',
          codepen: '',
          behance: '',
          dribbble: '',
          medium: '',
          devto: '',
          hashnode: '',
          website: '',
          portfolio: '',
          blog: '',
          resume: '',
          discord: '',
          slack: ''
        },
        resume: ''
      };

      const updatedProfile = await Profile.findByIdAndUpdate(
        profile._id,
        defaultProfile,
        { new: true, runValidators: true }
      );

      res.json({ 
        message: 'Profile reset to defaults successfully', 
        profile: updatedProfile 
      });
    } catch (error) {
      console.error('Error resetting profile:', error);
      res.status(500).json({ error: 'Failed to reset profile' });
    }
  },

  // Get or create single profile (helper method)
  async getOrCreateProfile(req, res) {
    try {
      let profile = await Profile.findOne();
      
      if (!profile) {
        // Create default profile if none exists
        const defaultData = {
          name: 'Your Name',
          title: 'Your Professional Title',
          email: 'your.email@example.com',
          phone: '',
          location: '',
          bio: 'Tell us about yourself...',
          profilePicture: '',
          socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            instagram: '',
            youtube: ''
          },
          professionalContacts: {
            github: '',
            gitlab: '',
            bitbucket: '',
            stackoverflow: '',
            leetcode: '',
            codepen: '',
            behance: '',
            dribbble: '',
            medium: '',
            devto: '',
            hashnode: '',
            website: '',
            portfolio: '',
            blog: '',
            resume: '',
            discord: '',
            slack: ''
          },
          resume: ''
        };
        
        profile = new Profile(defaultData);
        await profile.save();
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error getting/creating profile:', error);
      res.status(500).json({ error: 'Failed to get/create profile' });
    }
  }
};