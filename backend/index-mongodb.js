import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import database from './config/database.js';
import { upload, FileUtils } from './utils/fileUpload.js';
import { ProfileController } from './controllers/profileController.js';
import createCRUDController from './controllers/crudController.js';
import { AuthController } from './controllers/authController.js';
import { UserController } from './controllers/userController.js';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  requireAdmin, 
  requireAdminOrEditor,
  rateLimit,
  auditLog
} from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import Profile from './models/Profile.js';
import User from './models/User.js';
import Skill from './models/Skill.js';
import Project from './models/Project.js';
import Experience from './models/Experience.js';
import Education from './models/Education.js';
import Blog from './models/Blog.js';
import Vlog from './models/Vlog.js';
import Gallery from './models/Gallery.js';
import Testimonial from './models/Testimonial.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add a basic test route before everything else
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Serve test page
app.get('/test-page', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test</title>
</head>
<body>
    <h1>API Test Page</h1>
    <div id="results"></div>
    
    <script>
        const results = document.getElementById('results');
        
        async function testAPI() {
            try {
                results.innerHTML += '<p>Testing /test endpoint...</p>';
                const response = await fetch('/test');
                const data = await response.json();
                results.innerHTML += \`<p>✅ Test endpoint works: \${JSON.stringify(data)}</p>\`;
            } catch (error) {
                results.innerHTML += \`<p>❌ Test endpoint failed: \${error.message}</p>\`;
            }
            
            try {
                results.innerHTML += '<p>Testing /api/profile endpoint...</p>';
                const response = await fetch('/api/profile');
                const data = await response.json();
                results.innerHTML += \`<p>✅ Profile endpoint works: \${JSON.stringify(data)}</p>\`;
            } catch (error) {
                results.innerHTML += \`<p>❌ Profile endpoint failed: \${error.message}</p>\`;
            }
        }
        
        testAPI();
    </script>
</body>
</html>`);
});

// Rate limiting for auth routes
app.use('/api/auth', rateLimit(20, 15 * 60 * 1000)); // 20 requests per 15 minutes

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Async initialization function
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

// Initialize first admin user if no users exist
const initializeAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = new User({
        email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: 'Administrator',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

await initializeAdmin();

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/register', auditLog('USER_REGISTER'), AuthController.register);
app.post('/api/auth/login', AuthController.login); // Removed auditLog temporarily
app.post('/api/auth/logout', authenticateToken, auditLog('USER_LOGOUT'), AuthController.logout);
app.get('/api/auth/profile', authenticateToken, AuthController.getProfile);
app.put('/api/auth/profile', authenticateToken, auditLog('PROFILE_UPDATE'), AuthController.updateProfile);
app.put('/api/auth/change-password', authenticateToken, auditLog('PASSWORD_CHANGE'), AuthController.changePassword);

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================
app.get('/api/admin/users', authenticateToken, requireAdmin, auditLog('VIEW_USERS'), UserController.getAllUsers);
app.get('/api/admin/users/stats', authenticateToken, requireAdmin, UserController.getUserStats);
app.get('/api/admin/users/:id', authenticateToken, requireAdmin, UserController.getUserById);
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, auditLog('UPDATE_USER'), UserController.updateUserRole);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, auditLog('DELETE_USER'), UserController.deleteUser);

// Create CRUD controllers for each model
const skillController = createCRUDController(Skill, 'Skill');
const projectController = createCRUDController(Project, 'Project');
const experienceController = createCRUDController(Experience, 'Experience');
const educationController = createCRUDController(Education, 'Education');
const blogController = createCRUDController(Blog, 'Blog');
const vlogController = createCRUDController(Vlog, 'Vlog');
const galleryController = createCRUDController(Gallery, 'Gallery');
const testimonialController = createCRUDController(Testimonial, 'Testimonial');

// ==================== FILE ROUTES ====================
// Generic file upload endpoint
app.post('/api/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = FileUtils.generateFileUrl(req.file.filename, req);
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// ==================== PROFILE ROUTES ====================
app.get('/api/profile', ProfileController.getProfile);
app.get('/api/admin/profile', authenticateToken, ProfileController.getProfile);
app.put('/api/admin/profile', authenticateToken, requirePermission('canEditProfile'), auditLog('PROFILE_UPDATE'), ProfileController.updateProfile);
app.post('/api/admin/profile/picture', authenticateToken, requirePermission('canUploadFiles'), upload.single('profilePicture'), ProfileController.uploadProfilePicture);

// ==================== SKILLS ROUTES ====================
app.get('/api/skills', skillController.getAll);
app.get('/api/admin/skills', authenticateToken, skillController.getAll);
app.get('/api/admin/skills/:id', authenticateToken, skillController.getById);
app.post('/api/admin/skills', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_SKILL'), skillController.create);
app.put('/api/admin/skills/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_SKILL'), skillController.update);
app.delete('/api/admin/skills/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_SKILL'), skillController.delete);

// ==================== PROJECTS ROUTES ====================
app.get('/api/projects', projectController.getAll);
app.get('/api/admin/projects', authenticateToken, projectController.getAll);
app.get('/api/admin/projects/:id', authenticateToken, projectController.getById);
app.post('/api/admin/projects', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_PROJECT'), projectController.create);
app.put('/api/admin/projects/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_PROJECT'), projectController.update);
app.delete('/api/admin/projects/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_PROJECT'), projectController.delete);
app.post('/api/admin/projects/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('image'), projectController.uploadFile);

// ==================== EXPERIENCE ROUTES ====================
app.get('/api/experiences', experienceController.getAll);
app.get('/api/admin/experiences', authenticateToken, experienceController.getAll);
app.get('/api/admin/experiences/:id', authenticateToken, experienceController.getById);
app.post('/api/admin/experiences', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_EXPERIENCE'), experienceController.create);
app.put('/api/admin/experiences/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_EXPERIENCE'), experienceController.update);
app.delete('/api/admin/experiences/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_EXPERIENCE'), experienceController.delete);
app.post('/api/admin/experiences/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('logo'), experienceController.uploadFile);

// ==================== EDUCATION ROUTES ====================
app.get('/api/education', educationController.getAll);
app.get('/api/admin/education', authenticateToken, educationController.getAll);
app.get('/api/admin/education/:id', authenticateToken, educationController.getById);
app.post('/api/admin/education', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_EDUCATION'), educationController.create);
app.put('/api/admin/education/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_EDUCATION'), educationController.update);
app.delete('/api/admin/education/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_EDUCATION'), educationController.delete);
app.post('/api/admin/education/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('logo'), educationController.uploadFile);

// ==================== BLOGS ROUTES ====================
app.get('/api/blogs', blogController.getAll);
app.get('/api/admin/blogs', authenticateToken, blogController.getAll);
app.get('/api/admin/blogs/:id', authenticateToken, blogController.getById);
app.post('/api/admin/blogs', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_BLOG'), blogController.create);
app.put('/api/admin/blogs/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_BLOG'), blogController.update);
app.delete('/api/admin/blogs/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_BLOG'), blogController.delete);
app.post('/api/admin/blogs/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('image'), blogController.uploadFile);

// ==================== VLOGS ROUTES ====================
app.get('/api/vlogs', vlogController.getAll);
app.get('/api/admin/vlogs', authenticateToken, vlogController.getAll);
app.get('/api/admin/vlogs/:id', authenticateToken, vlogController.getById);
app.post('/api/admin/vlogs', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_VLOG'), vlogController.create);
app.put('/api/admin/vlogs/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_VLOG'), vlogController.update);
app.delete('/api/admin/vlogs/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_VLOG'), vlogController.delete);
app.post('/api/admin/vlogs/upload', authenticateToken, requirePermission('canUploadFiles'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), vlogController.uploadFile);

// ==================== GALLERY ROUTES ====================
app.get('/api/gallery', galleryController.getAll);
app.get('/api/admin/gallery', authenticateToken, galleryController.getAll);
app.get('/api/admin/gallery/:id', authenticateToken, galleryController.getById);
app.post('/api/admin/gallery', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_GALLERY'), galleryController.create);
app.put('/api/admin/gallery/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_GALLERY'), galleryController.update);
app.delete('/api/admin/gallery/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_GALLERY'), galleryController.delete);
app.post('/api/admin/gallery/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('image'), galleryController.uploadFile);

// ==================== TESTIMONIALS ROUTES ====================
app.get('/api/testimonials', testimonialController.getAll);
app.get('/api/admin/testimonials', authenticateToken, testimonialController.getAll);
app.get('/api/admin/testimonials/:id', authenticateToken, testimonialController.getById);
app.post('/api/admin/testimonials', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_TESTIMONIAL'), testimonialController.create);
app.put('/api/admin/testimonials/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_TESTIMONIAL'), testimonialController.update);
app.delete('/api/admin/testimonials/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_TESTIMONIAL'), testimonialController.delete);
app.post('/api/admin/testimonials/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('avatar'), testimonialController.uploadFile);

// ==================== PORTFOLIO DATA ROUTE (Combined) ====================
app.get('/api/portfolio', async (req, res) => {
  try {
    const [profile, skills, projects, experiences, education, blogs, vlogs, gallery, testimonials] = await Promise.all([
      Profile.findOne(),
      Skill.find().sort({ category: 1, name: 1 }),
      Project.find({ featured: true }).sort({ createdAt: -1 }).limit(6),
      Experience.find().sort({ startDate: -1 }),
      Education.find().sort({ startDate: -1 }),
      Blog.find({ published: true }).sort({ publishDate: -1 }).limit(6),
      Vlog.find({ published: true }).sort({ publishDate: -1 }).limit(6),
      Gallery.find({ featured: true }).sort({ order: 1 }).limit(12),
      Testimonial.find({ approved: true, featured: true }).sort({ createdAt: -1 }).limit(6)
    ]);

    res.json({
      profile: profile || {},
      skills: skills || [],
      projects: projects || [],
      experiences: experiences || [],
      education: education || [],
      blogs: blogs || [],
      vlogs: vlogs || [],
      gallery: gallery || [],
      testimonials: testimonials || []
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// ==================== ERROR HANDLING ====================
app.use((error, req, res, next) => {
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

    // ==================== SERVER START ====================
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 File serving at http://localhost:${PORT}/api/files/:id`);
      console.log(`🔐 Admin login at http://localhost:${PORT}/api/auth/login`);
      console.log(`📊 Portfolio data at http://localhost:${PORT}/api/portfolio`);
      console.log(`🗄️  MongoDB connection: mongodb://localhost:27017/my-portfolio`);
    });

  } catch (error) {
    console.error('💥 Failed to initialize server:', error);
    process.exit(1);
  }
};

// Initialize the server
initializeServer();

// Process error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit, just log for debugging
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log for debugging
});

// Graceful shutdown only on double Ctrl+C
let shutdownRequests = 0;
process.on('SIGINT', async () => {
  shutdownRequests++;
  console.log(`🔄 SIGINT received (${shutdownRequests}/2)`);
  
  if (shutdownRequests >= 2) {
    console.log('🔄 Double SIGINT - Gracefully shutting down...');
    await database.disconnect();
    process.exit(0);
  } else {
    console.log('🔄 Press Ctrl+C again within 3 seconds to shutdown');
    setTimeout(() => { 
      shutdownRequests = 0;
      console.log('🔄 Shutdown cancelled - server continues running');
    }, 3000);
  }
});

export default app;