import CodeProject from '../models/CodeProject.js';
import GitHubService from '../services/githubService.js';

/**
 * Code Project Controller
 * Handles CRUD operations for code projects with GitHub sync and collaboration
 */

// Get all projects for user (owned + collaborated)
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find projects where user is owner or collaborator
    const projects = await CodeProject.find({
      $or: [
        { owner: userId },
        { 'collaborators.userId': userId }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('collaborators.userId', 'name email avatar')
    .sort({ lastEditedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get single project by ID
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('collaborators.userId', 'name email avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access rights
    const isOwner = project.owner._id.toString() === userId;
    const isCollaborator = project.collaborators.some(c => c.userId._id.toString() === userId);
    const isPublic = project.isPublic;

    if (!isOwner && !isCollaborator && !isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, primaryLanguage, allowCollaboration, isPublic } = req.body;

    // Create default folder structure
    const defaultFiles = [
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        path: 'README.md',
        content: `# ${name}\n\n${description || 'A new code project'}`,
        language: 'markdown',
        lastModified: new Date()
      }
    ];

    const project = new CodeProject({
      name,
      description,
      owner: userId,
      files: defaultFiles,
      primaryLanguage: primaryLanguage || 'javascript',
      allowCollaboration: allowCollaboration || false,
      isPublic: isPublic || false,
      secretCode: allowCollaboration ? CodeProject.generateSecretCode() : null
    });

    project.updateStats();
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project (metadata or files)
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check edit permission
    const isOwner = project.owner.toString() === userId;
    const collaborator = project.collaborators.find(c => c.userId.toString() === userId);
    const canEdit = isOwner || (collaborator && collaborator.role === 'editor');

    if (!canEdit) {
      return res.status(403).json({ error: 'No edit permission' });
    }

    // Update allowed fields
    if (updates.name) project.name = updates.name;
    if (updates.description !== undefined) project.description = updates.description;
    if (updates.primaryLanguage) project.primaryLanguage = updates.primaryLanguage;
    if (updates.isPublic !== undefined && isOwner) project.isPublic = updates.isPublic;
    if (updates.allowCollaboration !== undefined && isOwner) {
      project.allowCollaboration = updates.allowCollaboration;
      if (updates.allowCollaboration && !project.secretCode) {
        project.secretCode = CodeProject.generateSecretCode();
      }
    }
    if (updates.files) {
      project.files = updates.files;
      project.updateStats();
    }
    if (updates.buildConfig) project.buildConfig = updates.buildConfig;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only owner can delete project' });
    }

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Join project with secret code
export const joinProjectWithCode = async (req, res) => {
  try {
    const { secretCode } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    const project = await CodeProject.findOne({ secretCode });

    if (!project) {
      return res.status(404).json({ error: 'Invalid code' });
    }

    if (!project.allowCollaboration) {
      return res.status(403).json({ error: 'Collaboration not allowed' });
    }

    // Check if already a collaborator
    const existing = project.collaborators.find(c => c.userId.toString() === userId);
    if (existing) {
      return res.status(400).json({ error: 'Already a collaborator' });
    }

    // Add collaborator
    project.collaborators.push({
      userId,
      email: userEmail,
      role: 'editor',
      joinedAt: new Date(),
      lastSeen: new Date()
    });

    await project.save();

    res.json({ message: 'Joined project successfully', project });
  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({ error: 'Failed to join project' });
  }
};

// Update collaborator role
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { collaboratorId, role } = req.body;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can change roles
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only owner can change roles' });
    }

    const collaborator = project.collaborators.find(c => c.userId.toString() === collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    collaborator.role = role;
    await project.save();

    res.json({ message: 'Role updated successfully', project });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Remove collaborator
export const removeCollaborator = async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Owner or the collaborator themselves can remove
    const isOwner = project.owner.toString() === userId;
    const isSelf = collaboratorId === userId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    project.collaborators = project.collaborators.filter(
      c => c.userId.toString() !== collaboratorId
    );

    await project.save();

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
};

// Sync with GitHub - Import repo
export const syncFromGitHub = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { githubToken, repoUrl, branch } = req.body;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check edit permission
    const isOwner = project.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ error: 'Only owner can sync with GitHub' });
    }

    // Parse repo URL
    const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlParts) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }

    const [, owner, repoName] = urlParts;
    const cleanRepoName = repoName.replace('.git', '');

    // Fetch from GitHub
    const github = new GitHubService(githubToken);
    const files = await github.fetchRepoContents(owner, cleanRepoName, branch || 'main');
    const latestCommit = await github.getLatestCommit(owner, cleanRepoName, branch || 'main');

    // Update project
    project.files = files;
    project.github = {
      enabled: true,
      repoUrl,
      repoOwner: owner,
      repoName: cleanRepoName,
      branch: branch || 'main',
      lastSyncAt: new Date(),
      syncStatus: 'synced',
      lastCommitSha: latestCommit,
      accessToken: githubToken, // Should be encrypted in production
      autoSync: false
    };

    project.updateStats();
    await project.save();

    res.json({ message: 'Synced successfully', project });
  } catch (error) {
    console.error('Error syncing from GitHub:', error);
    res.status(500).json({ error: `Failed to sync: ${error.message}` });
  }
};

// Push changes to GitHub
export const pushToGitHub = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { commitMessage } = req.body;
    const userId = req.user.userId;

    const project = await CodeProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permission
    const isOwner = project.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ error: 'Only owner can push to GitHub' });
    }

    if (!project.github || !project.github.enabled) {
      return res.status(400).json({ error: 'GitHub sync not enabled' });
    }

    const github = new GitHubService(project.github.accessToken);
    const { repoOwner, repoName, branch } = project.github;

    // Push all files (simplified - should track changes)
    const pushFile = async (file) => {
      if (file.type === 'file') {
        await github.createOrUpdateFile(
          repoOwner,
          repoName,
          file.path,
          file.content,
          commitMessage || 'Update from web editor',
          branch,
          file.sha
        );
      } else if (file.type === 'folder' && file.children) {
        for (const child of file.children) {
          await pushFile(child);
        }
      }
    };

    for (const file of project.files) {
      await pushFile(file);
    }

    // Update sync status
    const latestCommit = await github.getLatestCommit(repoOwner, repoName, branch);
    project.github.lastSyncAt = new Date();
    project.github.lastCommitSha = latestCommit;
    project.github.syncStatus = 'synced';

    await project.save();

    res.json({ message: 'Pushed to GitHub successfully', project });
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    res.status(500).json({ error: `Failed to push: ${error.message}` });
  }
};

export default {
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
};
