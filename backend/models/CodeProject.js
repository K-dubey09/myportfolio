import mongoose from 'mongoose';

/**
 * CodeProject Model
 * 
 * Represents a code project with:
 * - Folder structure (nested files/folders)
 * - GitHub integration (sync, push, pull)
 * - Collaboration (multi-user with secret codes)
 * - Build configurations
 * - Language support
 */

// File/Folder node schema
const fileNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder'], required: true },
  path: { type: String, required: true }, // full path from project root
  content: { type: String, default: '' }, // only for files
  language: { type: String, default: 'plaintext' },
  size: { type: Number, default: 0 }, // bytes
  children: [{ type: mongoose.Schema.Types.Mixed }], // nested structure
  lastModified: { type: Date, default: Date.now }
}, { _id: false });

// Collaborator schema
const collaboratorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
}, { _id: false });

// GitHub sync metadata
const githubSyncSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  repoUrl: { type: String },
  repoOwner: { type: String },
  repoName: { type: String },
  branch: { type: String, default: 'main' },
  lastSyncAt: { type: Date },
  syncStatus: { type: String, enum: ['synced', 'pending', 'conflict', 'error'], default: 'synced' },
  lastCommitSha: { type: String },
  accessToken: { type: String }, // encrypted GitHub token
  autoSync: { type: Boolean, default: false }
}, { _id: false });

// Build configuration
const buildConfigSchema = new mongoose.Schema({
  language: { type: String, required: true },
  buildCommand: { type: String },
  runCommand: { type: String },
  installCommand: { type: String },
  entryFile: { type: String },
  environment: { type: Map, of: String } // env variables
}, { _id: false });

const codeProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Folder structure
  files: [fileNodeSchema],
  
  // Collaboration
  collaborators: [collaboratorSchema],
  secretCode: { type: String, sparse: true }, // for joining (index defined below)
  isPublic: { type: Boolean, default: false },
  allowCollaboration: { type: Boolean, default: false },
  
  // GitHub integration
  github: githubSyncSchema,
  
  // Build settings
  buildConfig: buildConfigSchema,
  
  // Primary language
  primaryLanguage: { type: String, default: 'javascript' },
  
  // Tags
  tags: [{ type: String }],
  
  // Stats
  totalFiles: { type: Number, default: 0 },
  totalLines: { type: Number, default: 0 },
  lastEditedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster searches
codeProjectSchema.index({ owner: 1, createdAt: -1 });
codeProjectSchema.index({ secretCode: 1 }, { unique: true, sparse: true });
codeProjectSchema.index({ 'collaborators.userId': 1 });

// Generate unique secret code
codeProjectSchema.statics.generateSecretCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to count files and lines
codeProjectSchema.methods.updateStats = function() {
  const countFilesAndLines = (nodes) => {
    let files = 0;
    let lines = 0;
    for (const node of nodes) {
      if (node.type === 'file') {
        files++;
        lines += (node.content || '').split('\n').length;
      } else if (node.type === 'folder' && node.children) {
        const childStats = countFilesAndLines(node.children);
        files += childStats.files;
        lines += childStats.lines;
      }
    }
    return { files, lines };
  };
  
  const stats = countFilesAndLines(this.files);
  this.totalFiles = stats.files;
  this.totalLines = stats.lines;
  this.lastEditedAt = new Date();
};

export default mongoose.model('CodeProject', codeProjectSchema);
