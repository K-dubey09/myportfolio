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

  // Login user (accept email or phone as identifier)
  async login(req, res) {
    console.log('🔐 LOGIN ATTEMPT - Body:', req.body);
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      // Find by email or by phone
      let user = await User.findOne({ email: identifier, isActive: true });
      if (!user) {
        user = await User.findOne({ 'phones.number': identifier, isActive: true });
      }

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

      // Update last login
      user.lastLogin = new Date();

      // Create access and refresh tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, permissions: user.permissions },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      user.refreshToken = refreshToken;
      await user.save();

      // Set httpOnly cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      };

      res.cookie('refreshToken', refreshToken, cookieOptions);

      res.json({ message: 'Login successful', accessToken, user: { id: user._id, email: user.email, name: user.name, role: user.role, permissions: user.permissions, lastLogin: user.lastLogin } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  },

  // Update user profile (partial)
  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (req.body.phones && Array.isArray(req.body.phones)) {
        user.phones = req.body.phones.map(p => ({ number: p.number, verified: !!p.verified, verifiedAt: p.verifiedAt || null }));
      }
      if (req.body.githubAccounts && Array.isArray(req.body.githubAccounts)) {
        user.githubAccounts = req.body.githubAccounts.map(g => ({ username: g.username, url: g.url || (g.username ? `https://github.com/${g.username}` : '') }));
      }
      if (req.body.sharedRepos && Array.isArray(req.body.sharedRepos)) {
        user.sharedRepos = req.body.sharedRepos.map(r => ({ repoId: r.repoId, name: r.name, url: r.url, shared: !!r.shared }));
      }
      await user.save();
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // In-memory OTP store
  _otpStore: new Map(),

  async sendPhoneOtp(req, res) {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ error: 'Phone number required' });
      const userId = req.user && req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const key = `${userId}:${phone}`;
      AuthController._otpStore.set(key, { otp, expiresAt: Date.now() + (5 * 60 * 1000) });
      console.log(`Simulated OTP for user ${userId} phone ${phone}: ${otp}`);
      res.json({ message: 'OTP sent (simulated)' });
    } catch (error) {
      console.error('sendPhoneOtp error', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  async verifyPhoneOtp(req, res) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) return res.status(400).json({ error: 'Phone and otp required' });
      const userId = req.user && req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const key = `${userId}:${phone}`;
      const rec = AuthController._otpStore.get(key);
      if (!rec) return res.status(400).json({ error: 'No OTP sent for this number' });
      if (Date.now() > rec.expiresAt) { AuthController._otpStore.delete(key); return res.status(400).json({ error: 'OTP expired' }); }
      if (rec.otp !== String(otp)) return res.status(400).json({ error: 'Invalid OTP' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.phones = user.phones || [];
      const idx = user.phones.findIndex(p => String(p.number) === String(phone));
      const now = new Date();
      if (idx !== -1) { user.phones[idx].verified = true; user.phones[idx].verifiedAt = now; } else { user.phones.push({ number: phone, verified: true, verifiedAt: now }); }
      await user.save();
      AuthController._otpStore.delete(key);
      res.json({ message: 'Phone verified', phone });
    } catch (error) {
      console.error('verifyPhoneOtp error', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current password and new password are required' });
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) return res.status(400).json({ error: 'Current password is incorrect' });
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.cookies && req.cookies.refreshToken;
      if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) { user.refreshToken = null; await user.save(); }
      }
      res.clearCookie('refreshToken');
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.clearCookie('refreshToken');
      res.json({ message: 'Logout attempted' });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies && req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
      const secret = process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET;
      let payload;
      try { payload = jwt.verify(refreshToken, secret); } catch (err) { return res.status(401).json({ error: 'Invalid refresh token' }); }
      const user = await User.findById(payload.userId);
      if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ error: 'Invalid refresh token' });
      const accessToken = jwt.sign({ userId: user._id, email: user.email, role: user.role, permissions: user.permissions }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
};

export default AuthController;
    try {
      const refreshToken = req.cookies && req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

      // verify token
      const secret = process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET;
      let payload;
      try {
        payload = jwt.verify(refreshToken, secret);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const user = await User.findById(payload.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // generate new access token
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, permissions: user.permissions },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  },
};