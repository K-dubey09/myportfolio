import { createFirestoreController } from './firestoreControllerFactory.js';
import {
  profileCRUD,
  skillsCRUD,
  projectsCRUD,
  experiencesCRUD,
  educationCRUD,
  blogsCRUD,
  vlogsCRUD,
  galleryCRUD,
  testimonialsCRUD,
  servicesCRUD,
  contactsCRUD,
  contactInfoCRUD,
  achievementsCRUD,
  contactInfoHistoryCRUD
} from '../utils/firestoreCRUD.js';
import {
  validateProfile,
  validateSkill,
  validateProject,
  validateExperience,
  validateEducation,
  validateBlog,
  validateVlog,
  validateGallery,
  validateTestimonial,
  validateService,
  validateContact,
  validateContactInfo,
  validateAchievement
} from '../utils/validation.js';

// Profile Controller (only one profile allowed - SINGLETON pattern)
export const ProfileController = {
  ...createFirestoreController(profileCRUD, validateProfile, []),
  
  // Override getAll to return single profile
  getAll: async (req, res) => {
    try {
      const profiles = await profileCRUD.getAll({ limit: 1 });
      res.json({
        success: true,
        data: profiles[0] || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        message: error.message
      });
    }
  },
  
  // Override create to ensure only one profile exists
  create: async (req, res) => {
    try {
      // Check if profile already exists
      const existingProfiles = await profileCRUD.getAll({ limit: 1 });
      
      if (existingProfiles.length > 0) {
        // Profile already exists, update it instead
        const profileId = existingProfiles[0].id;
        const validation = validateProfile(req.body);
        
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: validation.errors
          });
        }
        
        const updated = await profileCRUD.update(profileId, req.body);
        return res.json({
          success: true,
          message: 'Profile updated (only one profile allowed)',
          data: updated
        });
      }
      
      // No profile exists, create first one
      const validation = validateProfile(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        });
      }
      
      const profile = await profileCRUD.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: profile
      });
    } catch (error) {
      console.error('Profile create error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create profile',
        message: error.message
      });
    }
  }
};

// Skills Controller - prevent duplicate skill names in same category
export const SkillsController = createFirestoreController(
  skillsCRUD,
  validateSkill,
  [] // We handle duplicates with custom logic below
);

// Custom create for skills to check name+category combination
SkillsController.create = async (req, res) => {
  try {
    const validation = validateSkill(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      });
    }
    
    // Check for duplicate name in same category
    const existing = await skillsCRUD.getAll({
      where: [
        ['name', '==', req.body.name],
        ['category', '==', req.body.category]
      ]
    });
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Skill already exists in this category'
      });
    }
    
    const item = await skillsCRUD.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create skill',
      message: error.message
    });
  }
};

// Projects Controller
export const ProjectsController = createFirestoreController(
  projectsCRUD,
  validateProject,
  ['title']
);

// Experiences Controller
export const ExperiencesController = createFirestoreController(
  experiencesCRUD,
  validateExperience,
  []
);

// Education Controller
export const EducationController = createFirestoreController(
  educationCRUD,
  validateEducation,
  []
);

// Blogs Controller
export const BlogsController = createFirestoreController(
  blogsCRUD,
  validateBlog,
  ['title']
);

// Vlogs Controller
export const VlogsController = createFirestoreController(
  vlogsCRUD,
  validateVlog,
  ['title']
);

// Gallery Controller
export const GalleryController = createFirestoreController(
  galleryCRUD,
  validateGallery,
  []
);

// Testimonials Controller
export const TestimonialsController = createFirestoreController(
  testimonialsCRUD,
  validateTestimonial,
  []
);

// Services Controller
export const ServicesController = createFirestoreController(
  servicesCRUD,
  validateService,
  ['title']
);

// Contacts Controller
export const ContactsController = createFirestoreController(
  contactsCRUD,
  validateContact,
  []
);

// Add custom method to mark contact as read
ContactsController.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await contactsCRUD.update(id, { status: 'read' });
    res.json({
      success: true,
      message: 'Contact marked as read',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
      message: error.message
    });
  }
};

// Contact Info Controller (singleton - only one contact info with fixed ID 'primary')
export const ContactInfoController = {
  ...createFirestoreController(contactInfoCRUD, validateContactInfo, []),
  
  getAll: async (req, res) => {
    try {
      const primaryDoc = await contactInfoCRUD.getById('primary');
      res.json({
        success: true,
        data: primaryDoc || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact info',
        message: error.message
      });
    }
  },
  
  // Get the single contact info (for public API)
  getById: async (req, res) => {
    try {
      const primaryDoc = await contactInfoCRUD.getById('primary');
      if (!primaryDoc) {
        return res.status(404).json({
          success: false,
          error: 'Contact info not found'
        });
      }
      res.json({
        success: true,
        data: primaryDoc
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact info',
        message: error.message
      });
    }
  },
  
  // Create or update contact info (enforces single document with ID 'primary')
  create: async (req, res) => {
    try {
      // Always use 'primary' as the document ID
      const existingDoc = await contactInfoCRUD.getById('primary');
      
      if (existingDoc) {
        // Update existing document
        const updated = await contactInfoCRUD.update('primary', req.body);
        // Write history snapshot
        try {
          await contactInfoHistoryCRUD.create({
            action: 'update',
            contactInfoId: 'primary',
            payload: req.body,
            changedBy: req.user?.email || req.user?.uid || 'unknown',
            snapshotAt: new Date().toISOString()
          });
        } catch (historyErr) {
          console.error('Failed to write contact info history (update):', historyErr.message);
        }
        return res.json({
          success: true,
          message: 'Contact info updated (only one record allowed)',
          action: 'updated',
          data: updated
        });
      } else {
        // Create new document with fixed ID 'primary'
        const created = await contactInfoCRUD.create(req.body, 'primary');
        // Write history snapshot
        try {
          await contactInfoHistoryCRUD.create({
            action: 'create',
            contactInfoId: 'primary',
            payload: req.body,
            changedBy: req.user?.email || req.user?.uid || 'unknown',
            snapshotAt: new Date().toISOString()
          });
        } catch (historyErr) {
          console.error('Failed to write contact info history (create):', historyErr.message);
        }
        return res.status(201).json({
          success: true,
          message: 'Contact info created',
          action: 'created',
          data: created
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create/update contact info',
        message: error.message
      });
    }
  },
  
  // Update contact info (always updates the 'primary' document)
  update: async (req, res) => {
    try {
      const updated = await contactInfoCRUD.update('primary', req.body);
      // History snapshot
      try {
        await contactInfoHistoryCRUD.create({
          action: 'update',
          contactInfoId: 'primary',
          payload: req.body,
          changedBy: req.user?.email || req.user?.uid || 'unknown',
          snapshotAt: new Date().toISOString()
        });
      } catch (historyErr) {
        console.error('Failed to write contact info history (update endpoint):', historyErr.message);
      }
      res.json({
        success: true,
        message: 'Contact info updated',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update contact info',
        message: error.message
      });
    }
  },
  
  // Delete contact info (resets to default values instead of deleting)
  delete: async (req, res) => {
    try {
      // Reset to default values
      const defaultContactInfo = {
        email: '',
        phone: '',
        address: '',
        socialLinks: {},
        availability: true,
        lastUpdated: new Date().toISOString()
      };
      
      const updated = await contactInfoCRUD.update('primary', defaultContactInfo);
      try {
        await contactInfoHistoryCRUD.create({
          action: 'reset',
          contactInfoId: 'primary',
          payload: defaultContactInfo,
          changedBy: req.user?.email || req.user?.uid || 'unknown',
          snapshotAt: new Date().toISOString()
        });
      } catch (historyErr) {
        console.error('Failed to write contact info history (reset):', historyErr.message);
      }
      res.json({
        success: true,
        message: 'Contact info reset to defaults',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to reset contact info',
        message: error.message
      });
    }
  }
};

// Contact Info History Controller (read-only)
export const ContactInfoHistoryController = {
  getAll: async (req, res) => {
    try {
      const items = await contactInfoHistoryCRUD.getAll({
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact info history',
        message: error.message
      });
    }
  }
};

// Achievements Controller
export const AchievementsController = createFirestoreController(
  achievementsCRUD,
  validateAchievement,
  ['title']
);

// ==================== FEATURED CONTENT HELPERS ====================
// Helper function to create featured methods for a controller
const addFeaturedMethods = (controller, crud) => {
  // Feature an item
  controller.feature = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await crud.update(id, {
        featured: true,
        featuredAt: new Date().toISOString()
      });
      res.json({
        success: true,
        message: 'Item featured successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to feature item',
        message: error.message
      });
    }
  };
  
  // Unfeature an item
  controller.unfeature = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await crud.update(id, {
        featured: false,
        featuredAt: null
      });
      res.json({
        success: true,
        message: 'Item unfeatured successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to unfeature item',
        message: error.message
      });
    }
  };
  
  // Reset all featured items in this collection
  controller.resetFeatured = async (req, res) => {
    try {
      const featuredItems = await crud.getAll({
        where: [['featured', '==', true]]
      });
      
      // Update all featured items to unfeatured
      const updates = featuredItems.map(item => 
        crud.update(item.id, { featured: false, featuredAt: null })
      );
      await Promise.all(updates);
      
      res.json({
        success: true,
        message: `Reset ${featuredItems.length} featured items`,
        count: featuredItems.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to reset featured items',
        message: error.message
      });
    }
  };
  
  // Get only featured items
  controller.getFeatured = async (req, res) => {
    try {
      const { limit = 3 } = req.query;
      
      // Try to get featured items first
      let featured = [];
      try {
        featured = await crud.getAll({
          where: [['featured', '==', true]],
          limit: parseInt(limit)
        });
      } catch (err) {
        console.log('No featured items found, will fallback to recent');
      }
      
      // If no featured items, fallback to most recent
      let items = featured;
      if (featured.length === 0) {
        items = await crud.getAll({
          limit: parseInt(limit)
        });
      }
      
      res.json({
        success: true,
        count: items.length,
        featured: featured.length > 0,
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured items',
        message: error.message
      });
    }
  };
  
  return controller;
};

// Add featured methods to all content controllers
addFeaturedMethods(SkillsController, skillsCRUD);
addFeaturedMethods(ProjectsController, projectsCRUD);
addFeaturedMethods(ExperiencesController, experiencesCRUD);
addFeaturedMethods(EducationController, educationCRUD);
addFeaturedMethods(BlogsController, blogsCRUD);
addFeaturedMethods(VlogsController, vlogsCRUD);
addFeaturedMethods(GalleryController, galleryCRUD);
addFeaturedMethods(TestimonialsController, testimonialsCRUD);
addFeaturedMethods(ServicesController, servicesCRUD);
addFeaturedMethods(AchievementsController, achievementsCRUD);
