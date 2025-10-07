import express from 'express';
import { upload } from '../utils/fileUpload.js';
import {
  uploadImage,
  uploadMultipleImages,
  getImage,
  getOptimizedImage,
  listImages,
  deleteImage,
  getImageCategories
} from '../controllers/imageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes for serving images
router.get('/serve/:filename', getImage);
router.get('/optimized/:filename', getOptimizedImage);

// Protected routes for image management
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);
router.post('/upload-multiple', authenticateToken, upload.array('images', 10), uploadMultipleImages);
router.get('/list', authenticateToken, listImages);
router.get('/categories', authenticateToken, getImageCategories);
router.delete('/:filename', authenticateToken, deleteImage);

// Portfolio-specific image uploads with categorization
router.post('/profile', authenticateToken, upload.single('image'), async (req, res, next) => {
  req.body.category = 'profile';
  req.body.resize = JSON.stringify({ width: 400, height: 400 });
  req.body.quality = '90';
  next();
}, uploadImage);

router.post('/project', authenticateToken, upload.array('images', 5), async (req, res, next) => {
  req.body.category = 'project';
  req.body.resize = JSON.stringify({ width: 800, height: 600 });
  req.body.quality = '85';
  next();
}, uploadMultipleImages);

router.post('/blog', authenticateToken, upload.single('image'), async (req, res, next) => {
  req.body.category = 'blog';
  req.body.resize = JSON.stringify({ width: 1200, height: 630 });
  req.body.quality = '85';
  next();
}, uploadImage);

router.post('/gallery', authenticateToken, upload.single('image'), async (req, res, next) => {
  req.body.category = 'gallery';
  req.body.quality = '90';
  // No resize for gallery images to maintain quality
  next();
}, uploadImage);

router.post('/service', authenticateToken, upload.single('image'), async (req, res, next) => {
  req.body.category = 'service';
  req.body.resize = JSON.stringify({ width: 400, height: 300 });
  req.body.quality = '85';
  next();
}, uploadImage);

export default router;