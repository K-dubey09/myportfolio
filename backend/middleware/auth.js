import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Basic authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Normalize req.user: include both userId and _id (some code expects one or the other)
    req.user = {
      userId: String(user._id),
      _id: String(user._id),
      role: user.role,
      email: user.email,
      permissions: user.permissions || {}
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based access control middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Get fresh user data to check permissions
      const user = await User.findById(req.user.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      if (!user.permissions[permission]) {
        return res.status(403).json({ 
          error: 'Permission denied',
          required: permission,
          userPermissions: user.permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Admin or Editor middleware
export const requireAdminOrEditor = requireRole(['admin', 'editor']);

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    if (resourceUserId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied: You can only access your own resources' });
    }

    next();
  };
};

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();

// Function to clear rate limit cache (useful for development and admin reset)
export const clearRateLimit = (identifier = null) => {
  if (identifier) {
    rateLimitMap.delete(identifier);
  } else {
    rateLimitMap.clear();
  }
};

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamps] of rateLimitMap.entries()) {
      rateLimitMap.set(key, timestamps.filter(time => time > windowStart));
      if (rateLimitMap.get(key).length === 0) {
        rateLimitMap.delete(key);
      }
    }

    // Check current requests
    const userRequests = rateLimitMap.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    rateLimitMap.set(identifier, recentRequests);

    next();
  };
};

// Audit log middleware
export const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action
      console.log(`[AUDIT] ${new Date().toISOString()} - User: ${req.user?.email || 'Anonymous'} - Action: ${action} - IP: ${req.ip} - Status: ${res.statusCode}`);
      
      originalSend.call(this, data);
    };

    next();
  };
};