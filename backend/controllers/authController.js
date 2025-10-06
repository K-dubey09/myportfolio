import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const AuthController = {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, name, role = 'viewer' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Validate role
      const allowedRoles = ['admin', 'editor', 'viewer'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Check if this is the first user (make them admin)
      const userCount = await User.countDocuments();
      const userRole = userCount === 0 ? 'admin' : role;

      // Create new user
      const user = new User({
        email,
        password,
        name,
        role: userRole
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role,
          permissions: user.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        res.status(400).json({ error: 'Email already exists' });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  },

  // Login user
  async login(req, res) {
    console.log('🔐 LOGIN ATTEMPT - Body:', req.body);
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('❌ Missing credentials');
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('🔍 Finding user:', email);
      // Find user by email
      const user = await User.findOne({ email, isActive: true });
      console.log('👤 User found:', !!user);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('🔐 Checking password...');
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      console.log('✅ Password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('💾 Updating last login...');
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      console.log('🎫 Generating token with secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
      // Generate token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role,
          permissions: user.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('📤 Sending successful response...');
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          lastLogin: user.lastLogin
        }
      });
      console.log('✅ Login completed successfully');
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },

  // Logout (invalidate token on frontend)
  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }
};