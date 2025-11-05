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
  achievementsCRUD
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

// Contact Info Controller (singleton - only one contact info)
export const ContactInfoController = {
  ...createFirestoreController(contactInfoCRUD, validateContactInfo, []),
  
  getAll: async (req, res) => {
    try {
      const items = await contactInfoCRUD.getAll({ limit: 1 });
      res.json({
        success: true,
        data: items[0] || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contact info',
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
