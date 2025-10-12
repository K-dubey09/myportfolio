import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import database from './config/database.js';
import { upload, GridFSUtils, initializeGridFS } from './utils/fileUpload.js';
import { ProfileController } from './controllers/profileController.js';
import createCRUDController from './controllers/crudController.js';
import { AuthController } from './controllers/authController.js';
import { UserController } from './controllers/userController.js';
import AccessKeyController from './controllers/accessKeyController.js';
import AdminRequestController from './controllers/adminRequestController.js';
import { FileController } from './controllers/fileController.js';
import imageRoutes from './routes/imageRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  requireAdmin, 
  requireAdminOrEditor,
  rateLimit,
  auditLog,
  clearRateLimit
} from './middleware/auth.js';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔧 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

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
import Service from './models/Service.js';
import Contact from './models/Contact.js';
import ContactInfo from './models/ContactInfo.js';
import contactInfoController from './controllers/contactInfoController.js';
import Achievement from './models/Achievement.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Add health check and test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
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
            const endpoints = [
              { name: 'Health Check', url: '/api/health' },
              { name: 'Profile', url: '/api/profile' },
              { name: 'Projects', url: '/api/projects' },
              { name: 'Skills', url: '/api/skills' },
              { name: 'Portfolio', url: '/api/portfolio' }
            ];
            
            for (const endpoint of endpoints) {
              try {
                results.innerHTML += \`<p>Testing \${endpoint.name}...</p>\`;
                const response = await fetch(endpoint.url);
                const data = await response.json();
                results.innerHTML += \`<p>✅ \${endpoint.name}: \${response.status} - \${response.ok ? 'OK' : 'Error'}</p>\`;
              } catch (error) {
                results.innerHTML += \`<p>❌ \${endpoint.name}: \${error.message}</p>\`;
              }
            }
        }
        
        testAPI();
    </script>
</body>
</html>`);
});

// Rate limiting for auth routes
app.use('/api/auth', rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Async initialization function
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Initialize GridFS after database connection
    initializeGridFS();

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
app.post('/api/auth/refresh', AuthController.refresh);
app.post('/api/auth/logout', authenticateToken, auditLog('USER_LOGOUT'), AuthController.logout);
app.get('/api/auth/profile', authenticateToken, AuthController.getProfile);
app.put('/api/auth/profile', authenticateToken, auditLog('PROFILE_UPDATE'), AuthController.updateProfile);
app.put('/api/auth/change-password', authenticateToken, auditLog('PASSWORD_CHANGE'), AuthController.changePassword);
// Phone OTP endpoints
app.post('/api/auth/phone/send-otp', authenticateToken, AuthController.sendPhoneOtp);
app.post('/api/auth/phone/verify-otp', authenticateToken, AuthController.verifyPhoneOtp);

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================
app.get('/api/admin/users', authenticateToken, requireAdmin, auditLog('VIEW_USERS'), UserController.getAllUsers);
app.get('/api/admin/users/stats', authenticateToken, requireAdmin, UserController.getUserStats);
app.get('/api/admin/users/:id', authenticateToken, requireAdmin, UserController.getUserById);
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, auditLog('UPDATE_USER'), UserController.updateUserRole);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, auditLog('DELETE_USER'), UserController.deleteUser);
// Assign or generate a unique userNumber for a user (admin only)
app.post('/api/admin/users/:id/assign-id', authenticateToken, requireAdmin, auditLog('ASSIGN_USER_NUMBER'), UserController.assignUserNumber);

// Public (authenticated) user search for chat initiation
app.get('/api/users', authenticateToken, UserController.searchUsers);
// Recent users helper for default suggestions
app.get('/api/users/recent', authenticateToken, UserController.recentUsers);
// Public (authenticated) single user fetch for chat add flows
app.get('/api/users/:id', authenticateToken, UserController.getPublicUserById);

// ==================== ADMIN UTILITY ROUTES ====================
// Clear rate limits (admin only)
app.post('/api/admin/clear-rate-limit', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { identifier } = req.body;
    clearRateLimit(identifier);
    res.json({ 
      message: identifier 
        ? `Rate limit cleared for ${identifier}` 
        : 'All rate limits cleared' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear rate limits' });
  }
});

// Create CRUD controllers for each model
const skillController = createCRUDController(Skill, 'Skill');
const projectController = createCRUDController(Project, 'Project');
const experienceController = createCRUDController(Experience, 'Experience');
const educationController = createCRUDController(Education, 'Education');
const blogController = createCRUDController(Blog, 'Blog');
const vlogController = createCRUDController(Vlog, 'Vlog');
const galleryController = createCRUDController(Gallery, 'Gallery');
const testimonialController = createCRUDController(Testimonial, 'Testimonial');
const serviceController = createCRUDController(Service, 'Service');
const contactController = createCRUDController(Contact, 'Contact');
const achievementController = createCRUDController(Achievement, 'Achievement');
// ContactInfo uses specialized controller to ensure only one record exists

// ==================== FILE ROUTES (GridFS) ====================
// Serve files from GridFS
app.get('/api/files/:filename', FileController.serveFile);

// Upload file to GridFS
app.post('/api/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('file'), FileController.uploadFile);

// List files with pagination
app.get('/api/files', authenticateToken, FileController.listFiles);

// Delete file from GridFS
app.delete('/api/files/:filename', authenticateToken, FileController.deleteFile);

// Get file info
app.get('/api/files/:filename/info', authenticateToken, FileController.getFileInfo);

// Legacy upload endpoint for backward compatibility
app.post('/api/admin/upload', authenticateToken, requirePermission('canUploadFiles'), upload.single('file'), FileController.uploadFile);

// ==================== IMAGE MANAGEMENT ROUTES ====================
app.use('/api/images', imageRoutes);

// ==================== CHAT ROUTES ====================
// User chat endpoints
app.use('/api/chats', chatRoutes);
// Admin route to list all chats (mounted separately for clarity)
app.get('/api/admin/chats', authenticateToken, requireAdmin, (req, res, next) => { req.url = '/admin/all'; next(); }, chatRoutes);

// ==================== PORTFOLIO ROUTES ====================
app.use('/api/portfolio', portfolioRoutes);

// ==================== PROFILE ROUTES ====================
app.get('/api/profile', ProfileController.getProfile);
app.get('/api/admin/profile', authenticateToken, ProfileController.getProfile);
app.get('/api/admin/profile/get-or-create', authenticateToken, ProfileController.getOrCreateProfile);
app.post('/api/admin/profile', authenticateToken, requirePermission('canEditProfile'), auditLog('PROFILE_CREATE_UPDATE'), ProfileController.createOrUpdateProfile);
app.put('/api/admin/profile', authenticateToken, requirePermission('canEditProfile'), auditLog('PROFILE_UPDATE'), ProfileController.updateProfile);
app.post('/api/admin/profile/picture', authenticateToken, requirePermission('canUploadFiles'), upload.single('profilePicture'), ProfileController.uploadProfilePicture);
app.delete('/api/admin/profile/reset', authenticateToken, requirePermission('canEditProfile'), auditLog('PROFILE_RESET'), ProfileController.resetProfile);

// ==================== SKILLS ROUTES ====================
app.get('/api/skills', skillController.getAll);
app.get('/api/admin/skills', authenticateToken, skillController.getAll);

// ==================== ACCESS KEYS (Admin) ====================
app.post('/api/admin/access-keys', authenticateToken, requireAdmin, AccessKeyController.createKey);
app.get('/api/admin/access-keys', authenticateToken, requireAdmin, AccessKeyController.listKeys);
app.delete('/api/admin/access-keys/:id', authenticateToken, requireAdmin, AccessKeyController.deleteKey);

// Public endpoint for using a key (authenticated user)
app.post('/api/access-keys/use', authenticateToken, AccessKeyController.useKey);

// Request admin approval (viewer -> request admin) (authenticated)
app.post('/api/request-admin', authenticateToken, AdminRequestController.createRequest);

// Admin: list and approve requests
app.get('/api/admin/requests', authenticateToken, requireAdmin, AdminRequestController.listRequests);
app.post('/api/admin/requests/:id/approve', authenticateToken, requireAdmin, AdminRequestController.approveRequest);
app.post('/api/admin/requests/:id/reject', authenticateToken, requireAdmin, AdminRequestController.rejectRequest);

// Admin: list conversions & revert
app.get('/api/admin/conversions', authenticateToken, requireAdmin, AccessKeyController.listConversions);
app.post('/api/admin/revert-user/:id', authenticateToken, requireAdmin, AccessKeyController.revertUser);
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

// ==================== ACHIEVEMENTS ROUTES ====================
app.get('/api/achievements', achievementController.getAll);
app.get('/api/admin/achievements', authenticateToken, achievementController.getAll);
app.get('/api/admin/achievements/:id', authenticateToken, achievementController.getById);
app.post('/api/admin/achievements', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_ACHIEVEMENT'), achievementController.create);
app.put('/api/admin/achievements/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_ACHIEVEMENT'), achievementController.update);
app.delete('/api/admin/achievements/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_ACHIEVEMENT'), achievementController.delete);

// ==================== SERVICES ROUTES ====================
app.get('/api/services', serviceController.getAll);
app.get('/api/admin/services', authenticateToken, serviceController.getAll);
app.get('/api/admin/services/:id', authenticateToken, serviceController.getById);
app.post('/api/admin/services', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_SERVICE'), serviceController.create);
app.put('/api/admin/services/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_SERVICE'), serviceController.update);
app.delete('/api/admin/services/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_SERVICE'), serviceController.delete);

// ==================== CONTACTS ROUTES ====================
app.get('/api/contacts', contactController.getAll); // Public endpoint for contact form submission
app.post('/api/contacts', contactController.create); // Public endpoint for contact form submission
app.get('/api/admin/contacts', authenticateToken, contactController.getAll);
app.get('/api/admin/contacts/:id', authenticateToken, contactController.getById);
app.put('/api/admin/contacts/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_CONTACT'), contactController.update);
app.delete('/api/admin/contacts/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_CONTACT'), contactController.delete);

// ==================== CONTACT INFO ROUTES ====================
app.get('/api/contact-info', contactInfoController.getAll); // Public endpoint for getting contact info
app.get('/api/admin/contact-info', authenticateToken, contactInfoController.getAll);
app.get('/api/admin/contact-info/get-or-create', authenticateToken, contactInfoController.getOrCreate);
app.get('/api/admin/contact-info/:id', authenticateToken, contactInfoController.getById);
app.post('/api/admin/contact-info', authenticateToken, requirePermission('canCreatePosts'), auditLog('CREATE_CONTACT_INFO'), contactInfoController.create);
app.put('/api/admin/contact-info/:id', authenticateToken, requirePermission('canEditPosts'), auditLog('UPDATE_CONTACT_INFO'), contactInfoController.update);
app.delete('/api/admin/contact-info/:id', authenticateToken, requirePermission('canDeletePosts'), auditLog('DELETE_CONTACT_INFO'), contactInfoController.delete);

// ==================== LEGACY PORTFOLIO DATA ROUTE (Combined) ====================
// Note: This route is deprecated in favor of /api/portfolio/* routes
app.get('/api/portfolio-legacy', async (req, res) => {
  try {
    const [profile, skills, projects, experiences, education, blogs, vlogs, gallery, testimonials, services, contacts, contactInfo] = await Promise.all([
      Profile.findOne(),
      Skill.find().sort({ category: 1, name: 1 }),
      Project.find().sort({ featured: -1, createdAt: -1 }),
      Experience.find().sort({ startDate: -1 }),
      Education.find().sort({ startDate: -1 }),
      Blog.find().sort({ publishDate: -1, createdAt: -1 }),
      Vlog.find().sort({ publishedDate: -1, createdAt: -1 }),
      Gallery.find().sort({ createdAt: -1 }),
      Testimonial.find().sort({ featured: -1, createdAt: -1 }),
      Service.find().sort({ featured: -1, createdAt: -1 }),
      Contact.find().sort({ createdAt: -1 }),
      ContactInfo.findOne()
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
      testimonials: testimonials || [],
      services: services || [],
      contacts: contacts || [],
      contactInfo: contactInfo || {}
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