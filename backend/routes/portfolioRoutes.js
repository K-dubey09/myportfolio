import express from 'express';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';
import Gallery from '../models/Gallery.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';

const router = express.Router();

// Get complete portfolio data
router.get('/complete', async (req, res) => {
  try {
    const [
      profile,
      projects,
      services,
      blogs,
      gallery,
      skillsArray,
      experiences,
      education
    ] = await Promise.all([
      Profile.findOne().select('-__v'),
      Project.find({ status: 'Completed' }).sort({ featured: -1, endDate: -1 }).select('-__v'),
      Service.find().sort({ order: 1, featured: -1 }).select('-__v'),
      Blog.find({ published: true }).sort({ featured: -1, createdAt: -1 }).select('-__v'),
      Gallery.find().sort({ featured: -1, order: 1 }).select('-__v'),
      Skill.find().sort({ level: -1 }).select('-__v'),
      Experience.find().sort({ startDate: -1 }).select('-__v'),
      Education.find().sort({ endDate: -1 }).select('-__v')
    ]);

    // Group skills by category for frontend consumption (keep raw array for admin)
    const skills = req.headers.authorization ? skillsArray : skillsArray.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        profile,
        projects,
        services,
        blogs,
        gallery,
        skills,
        experiences,
        education,
        stats: {
          totalProjects: projects.length,
          totalServices: services.length,
          totalBlogs: blogs.length,
          totalSkills: skillsArray.length,
          yearsExperience: experiences.reduce((acc, exp) => {
            const start = new Date(exp.startDate);
            const end = exp.current ? new Date() : new Date(exp.endDate);
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            return acc + years;
          }, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data',
      error: error.message
    });
  }
});

// Get profile data
router.get('/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne().select('-__v');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get featured content
router.get('/featured', async (req, res) => {
  try {
    const [featuredProjects, featuredServices, featuredBlogs, featuredGallery] = await Promise.all([
      Project.find({ featured: true, status: 'Completed' }).limit(3).select('-__v'),
      Service.find({ featured: true }).limit(3).select('-__v'),
      Blog.find({ featured: true, published: true }).limit(3).select('-__v'),
      Gallery.find({ featured: true }).limit(6).select('-__v')
    ]);

    res.json({
      success: true,
      data: {
        projects: featuredProjects,
        services: featuredServices,
        blogs: featuredBlogs,
        gallery: featuredGallery
      }
    });
  } catch (error) {
    console.error('Error fetching featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content',
      error: error.message
    });
  }
});

// Get projects with filtering and pagination
router.get('/projects', async (req, res) => {
  try {
    const { featured, status, technology, limit = 10, page = 1 } = req.query;
    
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (status) filter.status = status;
    if (technology) filter.technologies = { $in: [new RegExp(technology, 'i')] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ featured: -1, endDate: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('-__v'),
      Project.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get services with filtering
router.get('/services', async (req, res) => {
  try {
    const { featured, category } = req.query;
    
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = new RegExp(category, 'i');

    const services = await Service.find(filter)
      .sort({ order: 1, featured: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// Get blogs with filtering and pagination
router.get('/blogs', async (req, res) => {
  try {
    const { featured, category, tag, limit = 10, page = 1 } = req.query;
    
    const filter = { published: true };
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = new RegExp(category, 'i');
    if (tag) filter.tags = { $in: [new RegExp(tag, 'i')] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('-content -__v'), // Exclude full content for list view
      Blog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// Get single blog by slug
router.get('/blog/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      published: true 
    }).select('-__v');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

// Get gallery with filtering
router.get('/gallery', async (req, res) => {
  try {
    const { featured, category } = req.query;
    
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = new RegExp(category, 'i');

    const gallery = await Gallery.find(filter)
      .sort({ featured: -1, order: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery',
      error: error.message
    });
  }
});

// Get skills grouped by category
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ level: -1 }).select('-__v');
    
    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSkills
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: error.message
    });
  }
});

// Get experience
router.get('/experience', async (req, res) => {
  try {
    const experience = await Experience.find()
      .sort({ startDate: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience',
      error: error.message
    });
  }
});

// Get education
router.get('/education', async (req, res) => {
  try {
    const education = await Education.find()
      .sort({ endDate: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error fetching education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education',
      error: error.message
    });
  }
});

// Get portfolio statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      projectCount,
      serviceCount,
      blogCount,
      galleryCount,
      skillCount,
      experienceYears,
      totalViews,
      totalLikes
    ] = await Promise.all([
      Project.countDocuments({ status: 'Completed' }),
      Service.countDocuments(),
      Blog.countDocuments({ published: true }),
      Gallery.countDocuments(),
      Skill.countDocuments(),
      Experience.aggregate([
        {
          $group: {
            _id: null,
            totalYears: {
              $sum: {
                $divide: [
                  { $subtract: [
                    { $ifNull: ['$endDate', new Date()] },
                    '$startDate'
                  ]},
                  31557600000 // milliseconds in a year
                ]
              }
            }
          }
        }
      ]),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }])
    ]);

    res.json({
      success: true,
      data: {
        projects: projectCount,
        services: serviceCount,
        blogs: blogCount,
        gallery: galleryCount,
        skills: skillCount,
        experienceYears: Math.round((experienceYears[0]?.totalYears || 0) * 10) / 10,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

export default router;