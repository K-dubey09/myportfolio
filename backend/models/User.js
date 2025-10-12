import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6
  },
  name: { 
    type: String, 
    required: true, 
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String, // URL to avatar image
    default: ''
  },
  // Multiple phone numbers with verification state
  phones: [{
    number: { type: String },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  }],
  // External code accounts (e.g., GitHub) - store username and optional profile url
  githubAccounts: [{
    username: { type: String },
    url: { type: String }
  }],
  // Repositories the user may choose to share publicly on profile; store meta and share boolean
  sharedRepos: [{
    repoId: { type: String },
    name: { type: String },
    url: { type: String },
    shared: { type: Boolean, default: false }
  }],
  // Optional human-friendly user number/identifier that can be chosen or generated
  userNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  lastLogin: {
    type: Date
  },
  permissions: {
    canCreatePosts: { type: Boolean, default: false },
    canEditPosts: { type: Boolean, default: false },
    canDeletePosts: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canUploadFiles: { type: Boolean, default: false },
    canEditProfile: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.role === 'admin') {
    this.permissions = {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canManageUsers: true,
      canUploadFiles: true,
      canEditProfile: true,
      canViewAnalytics: true
    };
  } else if (this.role === 'editor') {
    this.permissions = {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: false,
      canManageUsers: false,
      canUploadFiles: true,
      canEditProfile: false,
      canViewAnalytics: false
    };
  } else if (this.role === 'viewer') {
    this.permissions = {
      canCreatePosts: false,
      canEditPosts: false,
      canDeletePosts: false,
      canManageUsers: false,
      canUploadFiles: false,
      canEditProfile: false,
      canViewAnalytics: false
    };
  }
  next();
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);