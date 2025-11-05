import firebaseConfig from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';

const rateLimitStore = new Map();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const decodedToken = await firebaseConfig.getAuth().verifyIdToken(token);
    const user = await UserHelpers.getUserById(decodedToken.uid);

    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User is inactive or does not exist' });
    }

    req.user = {
      uid: user.uid,
      email: user.email,
      role: decodedToken.role || user.role,
      permissions: decodedToken.permissions || user.permissions
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient role privileges.',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin role has unrestricted access to all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    const userPermissions = req.user.permissions || {};
    const hasPermission = requiredPermissions.every(perm => userPermissions[perm] === true);

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: requiredPermissions,
        current: Object.keys(userPermissions).filter(k => userPermissions[k])
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireAdminOrEditor = requireRole('admin', 'editor');

export const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.user?.uid || req.ip;
    const now = Date.now();
    
    if (!rateLimitStore.has(identifier)) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(identifier);
    
    if (now > record.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({ 
        message: 'Too many requests',
        retryAfter: `${retryAfter} seconds`
      });
    }

    record.count++;
    next();
  };
};

export const clearRateLimit = (identifier) => {
  return rateLimitStore.delete(identifier);
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);
