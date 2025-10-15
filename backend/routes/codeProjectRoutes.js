import express from 'express';
import {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  joinProjectWithCode,
  updateCollaboratorRole,
  removeCollaborator,
  syncFromGitHub,
  pushToGitHub
} from '../controllers/codeProjectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Project CRUD
router.get('/projects', getUserProjects);
router.get('/projects/:projectId', getProjectById);
router.post('/projects', createProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);

// Collaboration
router.post('/projects/join', joinProjectWithCode);
router.put('/projects/:projectId/collaborators', updateCollaboratorRole);
router.delete('/projects/:projectId/collaborators/:collaboratorId', removeCollaborator);

// GitHub sync
router.post('/projects/:projectId/github/sync', syncFromGitHub);
router.post('/projects/:projectId/github/push', pushToGitHub);

export default router;
