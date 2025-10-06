import Profile from '../models/Profile.js';
import { FileUtils } from '../utils/fileUpload.js';

export const ProfileController = {
  // Get profile
  async getProfile(req, res) {
    try {
      let profile = await Profile.findOne();
      
      if (!profile) {
        // Create default profile if none exists
        profile = new Profile({
          name: 'Your Name',
          title: 'Your Title',
          email: 'your.email@example.com',
          bio: 'Your bio here...',
          socialLinks: {}
        });
        await profile.save();
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update profile
  async updateProfile(req, res) {
    try {
      let profile = await Profile.findOne();
      
      if (!profile) {
        profile = new Profile(req.body);
      } else {
        Object.assign(profile, req.body);
      }

      await profile.save();
      res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = FileUtils.generateFileUrl(req.file.filename, req);
      
      let profile = await Profile.findOne();
      if (!profile) {
        profile = new Profile({
          name: 'Your Name',
          title: 'Your Title',
          email: 'your.email@example.com'
        });
      }

      // Store the filename for reference
      const oldFilename = profile.profilePicture ? profile.profilePicture.split('/').pop() : null;

      profile.profilePicture = fileUrl;
      await profile.save();

      res.json({ 
        message: 'Profile picture uploaded successfully', 
        fileUrl,
        filename: req.file.filename 
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  }
};