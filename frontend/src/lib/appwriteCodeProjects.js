import { Client, Databases, Storage, ID } from 'appwrite';

/**
 * Appwrite Configuration for Code Projects
 * 
 * This module handles all Appwrite operations for code projects:
 * - Database operations (CRUD)
 * - File storage
 * - Real-time subscriptions
 */

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68ef61ed0005c49591cf');

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);

// Configuration constants
export const APPWRITE_CONFIG = {
  databaseId: '68ef6b3a0006bc5e1dfb', // Your database ID
  collections: {
    codeProjects: 'code_projects',
    collaborators: 'collaborators',
    projectFiles: 'project_files'
  },
  buckets: {
    projectFiles: 'project-files-bucket'
  }
};

/**
 * Code Project Service for Appwrite
 */
export class AppwriteCodeProjectService {
  constructor() {
    this.db = databases;
    this.storage = storage;
    this.dbId = APPWRITE_CONFIG.databaseId;
    this.collectionId = APPWRITE_CONFIG.collections.codeProjects;
  }

  /**
   * Create a new code project
   */
  async createProject(projectData) {
    try {
      const document = await this.db.createDocument(
        this.dbId,
        this.collectionId,
        ID.unique(),
        {
          name: projectData.name,
          description: projectData.description || '',
          ownerId: projectData.ownerId,
          ownerEmail: projectData.ownerEmail,
          primaryLanguage: projectData.primaryLanguage || 'javascript',
          isPublic: projectData.isPublic || false,
          allowCollaboration: projectData.allowCollaboration || false,
          secretCode: projectData.secretCode || null,
          totalFiles: projectData.totalFiles || 0,
          totalLines: projectData.totalLines || 0,
          files: JSON.stringify(projectData.files || []),
          githubEnabled: projectData.github?.enabled || false,
          githubRepoUrl: projectData.github?.repoUrl || '',
          githubBranch: projectData.github?.branch || 'main',
          githubLastSync: projectData.github?.lastSyncAt || null,
          buildLanguage: projectData.buildConfig?.language || '',
          buildCommand: projectData.buildConfig?.buildCommand || '',
          runCommand: projectData.buildConfig?.runCommand || '',
          tags: JSON.stringify(projectData.tags || []),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return this.transformDocument(document);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId) {
    try {
      const response = await this.db.listDocuments(
        this.dbId,
        this.collectionId,
        [
          // Query for projects where user is owner
          // Note: Appwrite queries might need adjustment based on your schema
        ]
      );
      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get single project by ID
   */
  async getProject(projectId) {
    try {
      const document = await this.db.getDocument(
        this.dbId,
        this.collectionId,
        projectId
      );
      return this.transformDocument(document);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.files) updateData.files = JSON.stringify(updates.files);
      if (updates.primaryLanguage) updateData.primaryLanguage = updates.primaryLanguage;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
      if (updates.allowCollaboration !== undefined) updateData.allowCollaboration = updates.allowCollaboration;
      if (updates.secretCode) updateData.secretCode = updates.secretCode;
      if (updates.totalFiles !== undefined) updateData.totalFiles = updates.totalFiles;
      if (updates.totalLines !== undefined) updateData.totalLines = updates.totalLines;

      const document = await this.db.updateDocument(
        this.dbId,
        this.collectionId,
        projectId,
        updateData
      );
      return this.transformDocument(document);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      await this.db.deleteDocument(
        this.dbId,
        this.collectionId,
        projectId
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Add collaborator to project
   */
  async addCollaborator(projectId, collaboratorData) {
    try {
      // Store collaborators in separate collection
      const collabDocument = await this.db.createDocument(
        this.dbId,
        APPWRITE_CONFIG.collections.collaborators,
        ID.unique(),
        {
          projectId,
          userId: collaboratorData.userId,
          email: collaboratorData.email,
          role: collaboratorData.role || 'viewer',
          joinedAt: new Date().toISOString()
        }
      );
      return collabDocument;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  /**
   * Transform Appwrite document to app format
   */
  transformDocument(doc) {
    return {
      _id: doc.$id,
      id: doc.$id,
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId,
      ownerEmail: doc.ownerEmail,
      primaryLanguage: doc.primaryLanguage,
      isPublic: doc.isPublic,
      allowCollaboration: doc.allowCollaboration,
      secretCode: doc.secretCode,
      totalFiles: doc.totalFiles,
      totalLines: doc.totalLines,
      files: JSON.parse(doc.files || '[]'),
      github: {
        enabled: doc.githubEnabled,
        repoUrl: doc.githubRepoUrl,
        branch: doc.githubBranch,
        lastSyncAt: doc.githubLastSync
      },
      buildConfig: {
        language: doc.buildLanguage,
        buildCommand: doc.buildCommand,
        runCommand: doc.runCommand
      },
      tags: JSON.parse(doc.tags || '[]'),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      collaborators: [] // Will be populated separately
    };
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToProject(projectId, callback) {
    return client.subscribe(
      `databases.${this.dbId}.collections.${this.collectionId}.documents.${projectId}`,
      callback
    );
  }
}

/**
 * File Storage Service
 */
export class AppwriteFileService {
  constructor() {
    this.storage = storage;
    this.bucketId = APPWRITE_CONFIG.buckets.projectFiles;
  }

  /**
   * Upload file to storage
   */
  async uploadFile(file, projectId) {
    try {
      const fileId = ID.unique();
      const result = await this.storage.createFile(
        this.bucketId,
        fileId,
        file
      );
      return {
        fileId: result.$id,
        name: result.name,
        size: result.sizeOriginal,
        url: this.getFileUrl(result.$id)
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  getFileUrl(fileId) {
    return this.storage.getFileView(this.bucketId, fileId);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileId) {
    try {
      await this.storage.deleteFile(this.bucketId, fileId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Export singleton instances
export const appwriteCodeProjectService = new AppwriteCodeProjectService();
export const appwriteFileService = new AppwriteFileService();

export default {
  client,
  databases,
  storage,
  appwriteCodeProjectService,
  appwriteFileService,
  APPWRITE_CONFIG
};
