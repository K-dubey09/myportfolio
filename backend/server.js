import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import firebaseConfig from './config/firebase.js';
import * as AuthController from './controllers/authController.js';
import { UserController } from './controllers/userController.js';
import AccessKeysController from './controllers/accessKeysController.js';
import AdminRequestsController from './controllers/adminRequestsController.js';
import ConversionsController from './controllers/conversionsController.js';
import UploadController, { upload } from './controllers/uploadController.js';
import * as ProfileCompletionController from './controllers/profileCompletionController.js';
import * as InconsistencyLogsController from './controllers/inconsistencyLogsController.js';
import * as NotificationsController from './controllers/notificationsController.js';
import { checkUserConsistency, blockSuspendedUsers } from './middleware/userConsistencyCheck.js';
import userConsistencyService from './services/userConsistencyService.js';
import emailNotificationService from './services/emailNotificationService.js';
import {
  ProfileController,
  SkillsController,
  ProjectsController,
  ExperiencesController,
  EducationController,
  BlogsController,
  VlogsController,
  GalleryController,
  TestimonialsController,
  ServicesController,
  ContactsController,
  ContactInfoController,
  AchievementsController,
  ContactInfoHistoryController
} from './controllers/allControllers.js';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  requireAdmin, 
  requireAdminOrEditor,
  rateLimit,
  clearRateLimit
} from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔧 Firebase Project:', process.env.FIREBASE_PROJECT_ID || 'my-portfolio-7ceb6');
console.log('🔧 Environment:', process.env.NODE_ENV);

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import contact info controller for backward compatibility
import contactInfoController from './controllers/contactInfoController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    // Initialize Firebase Admin SDK
    await firebaseConfig.initialize();
    console.log('✅ Firebase initialized successfully');

    // Start user consistency service
    userConsistencyService.start();
    console.log('✅ User consistency service started');

    // Start email notification service
    emailNotificationService.start();
    console.log('✅ Email notification service started');

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/register/request-verification', AuthController.requestEmailVerification);
app.post('/api/auth/register/verify-email', AuthController.verifyEmail);
app.get('/api/auth/verification-status/:uid', AuthController.getVerificationStatus);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/email-link-signin', AuthController.handleEmailLinkSignIn); // Email link login option
app.post('/api/auth/google', AuthController.googleAuth);
app.post('/api/auth/logout', authenticateToken, AuthController.logout);

// Profile status and completion (for suspended users)
app.get('/api/auth/profile-status', authenticateToken, ProfileCompletionController.getProfileCompletionStatus);
app.post('/api/auth/complete-profile', authenticateToken, ProfileCompletionController.completeProfile);

// Protected routes with consistency checking
app.get('/api/auth/profile', authenticateToken, checkUserConsistency, AuthController.getProfile);
app.put('/api/auth/profile', authenticateToken, checkUserConsistency, blockSuspendedUsers, AuthController.updateProfile);
app.put('/api/auth/change-password', authenticateToken, checkUserConsistency, blockSuspendedUsers, AuthController.changePassword);

// ==================== USER MANAGEMENT ROUTES (Admin Only) ====================
app.get('/api/admin/users', authenticateToken, requireAdmin, UserController.getAllUsers);
app.get('/api/admin/users/stats', authenticateToken, requireAdmin, UserController.getUserStats);
app.get('/api/admin/users/:id', authenticateToken, requireAdmin, UserController.getUserById);
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, UserController.updateUserRole);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, UserController.deleteUser);
app.post('/api/admin/users/:id/assign-id', authenticateToken, requireAdmin, UserController.assignUserNumber);

// ==================== USER INCONSISTENCY LOGS ROUTES (Admin Only) ====================
app.get('/api/admin/inconsistency-logs', authenticateToken, requireAdmin, InconsistencyLogsController.getAllInconsistencyLogs);
app.get('/api/admin/inconsistency-logs/:userId', authenticateToken, requireAdmin, InconsistencyLogsController.getUserInconsistencyLogs);
app.get('/api/admin/deleted-accounts', authenticateToken, requireAdmin, InconsistencyLogsController.getDeletedAccounts);
app.post('/api/admin/inconsistency-logs/:logId/resolve', authenticateToken, requireAdmin, InconsistencyLogsController.markInconsistencyResolved);
app.get('/api/admin/inconsistency-stats', authenticateToken, requireAdmin, InconsistencyLogsController.getInconsistencyStats);
app.post('/api/admin/restore-user/:userId', authenticateToken, requireAdmin, InconsistencyLogsController.restoreUserAccess);

// ==================== NOTIFICATIONS ROUTES (Admin Only) ====================
app.get('/api/admin/notifications', authenticateToken, requireAdmin, NotificationsController.getAllNotifications);
app.get('/api/admin/notifications/unread-count', authenticateToken, requireAdmin, NotificationsController.getUnreadCount);
app.post('/api/admin/notifications/:notificationId/read', authenticateToken, requireAdmin, NotificationsController.markAsRead);
app.post('/api/admin/notifications/mark-all-read', authenticateToken, requireAdmin, NotificationsController.markAllAsRead);
app.delete('/api/admin/notifications/:notificationId', authenticateToken, requireAdmin, NotificationsController.deleteNotification);
app.post('/api/admin/notifications/trigger-check', authenticateToken, requireAdmin, NotificationsController.triggerWarningCheck);
app.get('/api/admin/content-status', authenticateToken, requireAdmin, NotificationsController.getContentStatus);

// ==================== ACCESS KEYS ROUTES (Admin Only) ====================
app.get('/api/admin/access-keys', authenticateToken, requireAdmin, AccessKeysController.getAllAccessKeys);
app.post('/api/admin/access-keys', authenticateToken, requireAdmin, AccessKeysController.createAccessKey);
app.delete('/api/admin/access-keys/:id', authenticateToken, requireAdmin, AccessKeysController.deleteAccessKey);

// ==================== ADMIN REQUESTS ROUTES ====================
app.get('/api/admin/requests', authenticateToken, requireAdmin, AdminRequestsController.getAllRequests);
app.post('/api/admin/requests', authenticateToken, AdminRequestsController.createRequest);
app.post('/api/admin/requests/:requestId/approve', authenticateToken, requireAdmin, AdminRequestsController.approveRequest);
app.post('/api/admin/requests/:requestId/reject', authenticateToken, requireAdmin, AdminRequestsController.rejectRequest);
app.post('/api/admin/revert-user/:userId', authenticateToken, requireAdmin, AdminRequestsController.revertUser);

// ==================== CONVERSIONS ROUTES (Admin Only) ====================
app.get('/api/admin/conversions', authenticateToken, requireAdmin, ConversionsController.getAllConversions);
app.post('/api/admin/conversions', authenticateToken, ConversionsController.trackConversion);
app.get('/api/admin/conversions/stats', authenticateToken, requireAdmin, ConversionsController.getConversionStats);
app.delete('/api/admin/conversions/:id', authenticateToken, requireAdmin, ConversionsController.deleteConversion);

// ==================== UPLOAD ROUTES ====================
app.post('/api/upload', authenticateToken, upload.single('file'), UploadController.uploadFile);
app.post('/api/upload/multiple', authenticateToken, upload.array('files', 10), UploadController.uploadMultipleFiles);
app.post('/api/upload/folder', authenticateToken, upload.single('file'), UploadController.uploadToFolder);
app.post('/api/upload/document', authenticateToken, upload.single('document'), UploadController.uploadDocument);
app.post('/api/upload/documents', authenticateToken, upload.array('documents', 5), UploadController.uploadMultipleDocuments);
app.get('/api/upload/:id', authenticateToken, UploadController.getFile);
app.get('/api/uploads', authenticateToken, UploadController.listUploads);
app.delete('/api/upload/:id', authenticateToken, requireAdmin, UploadController.deleteFile);

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

// ==================== PROFILE ROUTES ====================
app.get('/api/profile', ProfileController.getAll);
app.post('/api/profile', authenticateToken, requirePermission('canEditProfile'), ProfileController.create);
app.put('/api/profile/:id', authenticateToken, requirePermission('canEditProfile'), ProfileController.update);
app.delete('/api/profile/:id', authenticateToken, requireAdmin, ProfileController.delete);

// Admin profile routes
app.get('/api/admin/profile', authenticateToken, ProfileController.getAll);
app.post('/api/admin/profile', authenticateToken, requirePermission('canEditProfile'), ProfileController.create);
app.put('/api/admin/profile/:id', authenticateToken, requirePermission('canEditProfile'), ProfileController.update);

// ==================== SKILLS ROUTES ====================
app.get('/api/skills', SkillsController.getAll);
app.get('/api/skills/featured', SkillsController.getFeatured);
app.get('/api/skills/search', SkillsController.search);
app.get('/api/skills/:id', SkillsController.getById);
app.post('/api/skills', authenticateToken, requirePermission('canCreatePosts'), SkillsController.create);
app.put('/api/skills/:id', authenticateToken, requirePermission('canEditPosts'), SkillsController.update);
app.delete('/api/skills/:id', authenticateToken, requirePermission('canDeletePosts'), SkillsController.delete);

// Admin skills routes
app.get('/api/admin/skills', authenticateToken, SkillsController.getAll);
app.get('/api/admin/skills/:id', authenticateToken, SkillsController.getById);
app.post('/api/admin/skills', authenticateToken, requirePermission('canCreatePosts'), SkillsController.create);
app.put('/api/admin/skills/:id', authenticateToken, requirePermission('canEditPosts'), SkillsController.update);
app.delete('/api/admin/skills/:id', authenticateToken, requirePermission('canDeletePosts'), SkillsController.delete);
app.post('/api/admin/skills/batch', authenticateToken, requirePermission('canCreatePosts'), SkillsController.batchCreate);

// ==================== PROJECTS ROUTES ====================
app.get('/api/projects', ProjectsController.getAll);
app.get('/api/projects/featured', ProjectsController.getFeatured);
app.get('/api/projects/search', ProjectsController.search);
app.get('/api/projects/:id', ProjectsController.getById);

// Admin projects routes
app.get('/api/admin/projects', authenticateToken, ProjectsController.getAll);
app.get('/api/admin/projects/:id', authenticateToken, ProjectsController.getById);
app.post('/api/admin/projects', authenticateToken, requirePermission('canCreatePosts'), ProjectsController.create);
app.put('/api/admin/projects/:id', authenticateToken, requirePermission('canEditPosts'), ProjectsController.update);
app.delete('/api/admin/projects/:id', authenticateToken, requirePermission('canDeletePosts'), ProjectsController.delete);
app.post('/api/admin/projects/batch', authenticateToken, requirePermission('canCreatePosts'), ProjectsController.batchCreate);

// ==================== EXPERIENCES ROUTES ====================
app.get('/api/experiences', ExperiencesController.getAll);
app.get('/api/experiences/featured', ExperiencesController.getFeatured);
app.get('/api/experiences/:id', ExperiencesController.getById);

// Admin experiences routes
app.get('/api/admin/experiences', authenticateToken, ExperiencesController.getAll);
app.get('/api/admin/experiences/:id', authenticateToken, ExperiencesController.getById);
app.post('/api/admin/experiences', authenticateToken, requirePermission('canCreatePosts'), ExperiencesController.create);
app.put('/api/admin/experiences/:id', authenticateToken, requirePermission('canEditPosts'), ExperiencesController.update);
app.delete('/api/admin/experiences/:id', authenticateToken, requirePermission('canDeletePosts'), ExperiencesController.delete);
app.post('/api/admin/experiences/batch', authenticateToken, requirePermission('canCreatePosts'), ExperiencesController.batchCreate);

// ==================== EDUCATION ROUTES ====================
app.get('/api/education', EducationController.getAll);
app.get('/api/education/featured', EducationController.getFeatured);
app.get('/api/education/:id', EducationController.getById);

// Admin education routes
app.get('/api/admin/education', authenticateToken, EducationController.getAll);
app.get('/api/admin/education/:id', authenticateToken, EducationController.getById);
app.post('/api/admin/education', authenticateToken, requirePermission('canCreatePosts'), EducationController.create);
app.put('/api/admin/education/:id', authenticateToken, requirePermission('canEditPosts'), EducationController.update);
app.delete('/api/admin/education/:id', authenticateToken, requirePermission('canDeletePosts'), EducationController.delete);
app.post('/api/admin/education/batch', authenticateToken, requirePermission('canCreatePosts'), EducationController.batchCreate);

// ==================== BLOGS ROUTES ====================
app.get('/api/blogs', BlogsController.getAll);
app.get('/api/blogs/featured', BlogsController.getFeatured);
app.get('/api/blogs/search', BlogsController.search);
app.get('/api/blogs/:id', BlogsController.getById);

// Admin blogs routes
app.get('/api/admin/blogs', authenticateToken, BlogsController.getAll);
app.get('/api/admin/blogs/:id', authenticateToken, BlogsController.getById);
app.post('/api/admin/blogs', authenticateToken, requirePermission('canCreatePosts'), BlogsController.create);
app.put('/api/admin/blogs/:id', authenticateToken, requirePermission('canEditPosts'), BlogsController.update);
app.delete('/api/admin/blogs/:id', authenticateToken, requirePermission('canDeletePosts'), BlogsController.delete);
app.post('/api/admin/blogs/batch', authenticateToken, requirePermission('canCreatePosts'), BlogsController.batchCreate);

// ==================== VLOGS ROUTES ====================
app.get('/api/vlogs', VlogsController.getAll);
app.get('/api/vlogs/featured', VlogsController.getFeatured);
app.get('/api/vlogs/search', VlogsController.search);
app.get('/api/vlogs/:id', VlogsController.getById);

// Admin vlogs routes
app.get('/api/admin/vlogs', authenticateToken, VlogsController.getAll);
app.get('/api/admin/vlogs/:id', authenticateToken, VlogsController.getById);
app.post('/api/admin/vlogs', authenticateToken, requirePermission('canCreatePosts'), VlogsController.create);
app.put('/api/admin/vlogs/:id', authenticateToken, requirePermission('canEditPosts'), VlogsController.update);
app.delete('/api/admin/vlogs/:id', authenticateToken, requirePermission('canDeletePosts'), VlogsController.delete);
app.post('/api/admin/vlogs/batch', authenticateToken, requirePermission('canCreatePosts'), VlogsController.batchCreate);

// ==================== GALLERY ROUTES ====================
app.get('/api/gallery', GalleryController.getAll);
app.get('/api/gallery/featured', GalleryController.getFeatured);
app.get('/api/gallery/search', GalleryController.search);
app.get('/api/gallery/:id', GalleryController.getById);

// Admin gallery routes
app.get('/api/admin/gallery', authenticateToken, GalleryController.getAll);
app.get('/api/admin/gallery/:id', authenticateToken, GalleryController.getById);
app.post('/api/admin/gallery', authenticateToken, requirePermission('canCreatePosts'), GalleryController.create);
app.put('/api/admin/gallery/:id', authenticateToken, requirePermission('canEditPosts'), GalleryController.update);
app.delete('/api/admin/gallery/:id', authenticateToken, requirePermission('canDeletePosts'), GalleryController.delete);
app.post('/api/admin/gallery/batch', authenticateToken, requirePermission('canCreatePosts'), GalleryController.batchCreate);

// ==================== TESTIMONIALS ROUTES ====================
app.get('/api/testimonials', TestimonialsController.getAll);
app.get('/api/testimonials/featured', TestimonialsController.getFeatured);
app.get('/api/testimonials/:id', TestimonialsController.getById);

// Admin testimonials routes
app.get('/api/admin/testimonials', authenticateToken, TestimonialsController.getAll);
app.get('/api/admin/testimonials/:id', authenticateToken, TestimonialsController.getById);
app.post('/api/admin/testimonials', authenticateToken, requirePermission('canCreatePosts'), TestimonialsController.create);
app.put('/api/admin/testimonials/:id', authenticateToken, requirePermission('canEditPosts'), TestimonialsController.update);
app.delete('/api/admin/testimonials/:id', authenticateToken, requirePermission('canDeletePosts'), TestimonialsController.delete);
app.post('/api/admin/testimonials/batch', authenticateToken, requirePermission('canCreatePosts'), TestimonialsController.batchCreate);

// ==================== ACHIEVEMENTS ROUTES ====================
app.get('/api/achievements', AchievementsController.getAll);
app.get('/api/achievements/featured', AchievementsController.getFeatured);
app.get('/api/achievements/search', AchievementsController.search);
app.get('/api/achievements/:id', AchievementsController.getById);

// Admin achievements routes
app.get('/api/admin/achievements', authenticateToken, AchievementsController.getAll);
app.get('/api/admin/achievements/:id', authenticateToken, AchievementsController.getById);
app.post('/api/admin/achievements', authenticateToken, requirePermission('canCreatePosts'), AchievementsController.create);
app.put('/api/admin/achievements/:id', authenticateToken, requirePermission('canEditPosts'), AchievementsController.update);
app.delete('/api/admin/achievements/:id', authenticateToken, requirePermission('canDeletePosts'), AchievementsController.delete);
app.post('/api/admin/achievements/batch', authenticateToken, requirePermission('canCreatePosts'), AchievementsController.batchCreate);

// ==================== SERVICES ROUTES ====================
app.get('/api/services', ServicesController.getAll);
app.get('/api/services/featured', ServicesController.getFeatured);
app.get('/api/services/search', ServicesController.search);
app.get('/api/services/:id', ServicesController.getById);

// Admin services routes
app.get('/api/admin/services', authenticateToken, ServicesController.getAll);
app.get('/api/admin/services/:id', authenticateToken, ServicesController.getById);
app.post('/api/admin/services', authenticateToken, requirePermission('canCreatePosts'), ServicesController.create);
app.put('/api/admin/services/:id', authenticateToken, requirePermission('canEditPosts'), ServicesController.update);
app.delete('/api/admin/services/:id', authenticateToken, requirePermission('canDeletePosts'), ServicesController.delete);
app.post('/api/admin/services/batch', authenticateToken, requirePermission('canCreatePosts'), ServicesController.batchCreate);

// ==================== CONTACTS ROUTES ====================
// Public contact form submission
app.post('/api/contacts', ContactsController.create);
app.get('/api/contacts', ContactsController.getAll);

// Admin contacts routes
app.get('/api/admin/contacts', authenticateToken, ContactsController.getAll);
app.get('/api/admin/contacts/:id', authenticateToken, ContactsController.getById);
app.put('/api/admin/contacts/:id', authenticateToken, ContactsController.update);
app.delete('/api/admin/contacts/:id', authenticateToken, requirePermission('canDeletePosts'), ContactsController.delete);
app.post('/api/admin/contacts/:id/mark-read', authenticateToken, ContactsController.markAsRead);

// ==================== CONTACT INFO ROUTES ====================
// Public contact info
app.get('/api/contact-info', ContactInfoController.getAll);

// Admin contact info routes
app.get('/api/admin/contact-info', authenticateToken, ContactInfoController.getAll);
app.post('/api/admin/contact-info', authenticateToken, requirePermission('canEditProfile'), ContactInfoController.create);
app.put('/api/admin/contact-info/:id', authenticateToken, requirePermission('canEditProfile'), ContactInfoController.update);
app.delete('/api/admin/contact-info/:id', authenticateToken, requireAdmin, ContactInfoController.delete);
// History endpoint (read-only)
app.get('/api/admin/contact-info/history', authenticateToken, requirePermission('canEditProfile'), ContactInfoHistoryController.getAll);

// ==================== FEATURED CONTENT ROUTES ====================
// Public featured content endpoints
app.get('/api/skills/featured', SkillsController.getFeatured);
app.get('/api/projects/featured', ProjectsController.getFeatured);
app.get('/api/experiences/featured', ExperiencesController.getFeatured);
app.get('/api/education/featured', EducationController.getFeatured);
app.get('/api/blogs/featured', BlogsController.getFeatured);
app.get('/api/vlogs/featured', VlogsController.getFeatured);
app.get('/api/gallery/featured', GalleryController.getFeatured);
app.get('/api/testimonials/featured', TestimonialsController.getFeatured);
app.get('/api/services/featured', ServicesController.getFeatured);

// Admin featured management endpoints
app.post('/api/admin/skills/:id/feature', authenticateToken, requireAdmin, SkillsController.feature);
app.post('/api/admin/skills/:id/unfeature', authenticateToken, requireAdmin, SkillsController.unfeature);
app.post('/api/admin/skills/reset-featured', authenticateToken, requireAdmin, SkillsController.resetFeatured);

app.post('/api/admin/projects/:id/feature', authenticateToken, requireAdmin, ProjectsController.feature);
app.post('/api/admin/projects/:id/unfeature', authenticateToken, requireAdmin, ProjectsController.unfeature);
app.post('/api/admin/projects/reset-featured', authenticateToken, requireAdmin, ProjectsController.resetFeatured);

app.post('/api/admin/experiences/:id/feature', authenticateToken, requireAdmin, ExperiencesController.feature);
app.post('/api/admin/experiences/:id/unfeature', authenticateToken, requireAdmin, ExperiencesController.unfeature);
app.post('/api/admin/experiences/reset-featured', authenticateToken, requireAdmin, ExperiencesController.resetFeatured);

app.post('/api/admin/education/:id/feature', authenticateToken, requireAdmin, EducationController.feature);
app.post('/api/admin/education/:id/unfeature', authenticateToken, requireAdmin, EducationController.unfeature);
app.post('/api/admin/education/reset-featured', authenticateToken, requireAdmin, EducationController.resetFeatured);

app.post('/api/admin/blogs/:id/feature', authenticateToken, requireAdmin, BlogsController.feature);
app.post('/api/admin/blogs/:id/unfeature', authenticateToken, requireAdmin, BlogsController.unfeature);
app.post('/api/admin/blogs/reset-featured', authenticateToken, requireAdmin, BlogsController.resetFeatured);

app.post('/api/admin/vlogs/:id/feature', authenticateToken, requireAdmin, VlogsController.feature);
app.post('/api/admin/vlogs/:id/unfeature', authenticateToken, requireAdmin, VlogsController.unfeature);
app.post('/api/admin/vlogs/reset-featured', authenticateToken, requireAdmin, VlogsController.resetFeatured);

app.post('/api/admin/gallery/:id/feature', authenticateToken, requireAdmin, GalleryController.feature);
app.post('/api/admin/gallery/:id/unfeature', authenticateToken, requireAdmin, GalleryController.unfeature);
app.post('/api/admin/gallery/reset-featured', authenticateToken, requireAdmin, GalleryController.resetFeatured);

app.post('/api/admin/testimonials/:id/feature', authenticateToken, requireAdmin, TestimonialsController.feature);
app.post('/api/admin/testimonials/:id/unfeature', authenticateToken, requireAdmin, TestimonialsController.unfeature);
app.post('/api/admin/testimonials/reset-featured', authenticateToken, requireAdmin, TestimonialsController.resetFeatured);

app.post('/api/admin/services/:id/feature', authenticateToken, requireAdmin, ServicesController.feature);
app.post('/api/admin/services/:id/unfeature', authenticateToken, requireAdmin, ServicesController.unfeature);
app.post('/api/admin/services/reset-featured', authenticateToken, requireAdmin, ServicesController.resetFeatured);

app.post('/api/admin/achievements/:id/feature', authenticateToken, requireAdmin, AchievementsController.feature);
app.post('/api/admin/achievements/:id/unfeature', authenticateToken, requireAdmin, AchievementsController.unfeature);
app.post('/api/admin/achievements/reset-featured', authenticateToken, requireAdmin, AchievementsController.resetFeatured);

// ==================== PORTFOLIO DATA AGGREGATION ROUTE ====================
// Get all portfolio data in one request (useful for initial page load)
app.get('/api/portfolio', async (req, res) => {
  try {
    const firestoreCRUD = await import('./utils/firestoreCRUD.js');
    const { profileCRUD, skillsCRUD, projectsCRUD, experiencesCRUD, educationCRUD, 
            blogsCRUD, vlogsCRUD, galleryCRUD, testimonialsCRUD, servicesCRUD, 
            contactInfoCRUD, achievementsCRUD } = firestoreCRUD;
    
    const [profile, skills, projects, experiences, education, blogs, vlogs, gallery, testimonials, services, contactInfo, achievements] = await Promise.all([
      profileCRUD.getAll({}).then(data => data[0] || null),
      skillsCRUD.getAll({}),
      projectsCRUD.getAll({}),
      experiencesCRUD.getAll({}),
      educationCRUD.getAll({}),
      blogsCRUD.getAll({}),
      vlogsCRUD.getAll({}),
      galleryCRUD.getAll({}),
      testimonialsCRUD.getAll({}),
      servicesCRUD.getAll({}),
      contactInfoCRUD.getAll({}).then(data => data[0] || null),
      achievementsCRUD.getAll({})
    ]);

    res.json({
      success: true,
      data: {
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
        contactInfo: contactInfo || {},
        achievements: achievements || []
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch portfolio data',
      message: error.message 
    });
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
      console.log(`� Firebase project: my-portfolio-7ceb6`);
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
    
    // Stop consistency service
    userConsistencyService.stop();
    
    // Stop email notification service
    emailNotificationService.stop();
    
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