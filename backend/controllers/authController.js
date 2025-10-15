import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to send email (mock for now - integrate with real email service)
const sendEmailOTP = async (email, otp) => {
  console.log(`📧 Sending OTP to ${email}: ${otp}`);
  // TODO: Integrate with real email service (SendGrid, AWS SES, etc.)
  // For now, just log to console
  return true;
};

export const AuthController = {
  // Step 1: Register new user and send OTP
  async register(req, res) {
    try {
      const { email, password, username, name, role = 'viewer' } = req.body;

      // Validate required fields
      if (!email || !password || !username || !name) {
        return res.status(400).json({ error: 'Email, password, username, and name are required' });
      }

      // Validate username format
      if (!/^[a-z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain lowercase letters, numbers, and underscores' });
      }

      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Validate role
      const allowedRoles = ['admin', 'editor', 'viewer'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Check if this is the first user (make them admin)
      const userCount = await User.countDocuments();
      const userRole = userCount === 0 ? 'admin' : role;

      // Generate OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new user (not verified yet)
      const user = new User({
        email,
        password,
        username: username.toLowerCase(),
        name,
        role: userRole,
        emailVerified: false,
        emailVerificationOTP: otp,
        emailOTPExpires: otpExpires
      });

      await user.save();

      // Send OTP email
      await sendEmailOTP(email, otp);

      res.status(201).json({
        message: 'Registration initiated. Please verify your email with the OTP sent.',
        userId: user._id,
        email: user.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        res.status(400).json({ error: `${field === 'username' ? 'Username' : 'Email'} already exists` });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  },

  // Step 2: Verify email OTP
  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      if (!user.emailVerificationOTP || !user.emailOTPExpires) {
        return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
      }

      if (new Date() > user.emailOTPExpires) {
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
      }

      if (user.emailVerificationOTP !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Verify user
      user.emailVerified = true;
      user.emailVerificationOTP = null;
      user.emailOTPExpires = null;
      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          permissions: user.permissions
        },
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

      // Set refresh token cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      res.cookie('refreshToken', refreshToken, cookieOptions);

      res.json({
        message: 'Email verified successfully',
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  },

  // Resend OTP
  async resendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.emailVerificationOTP = otp;
      user.emailOTPExpires = otpExpires;
      await user.save();

      // Send OTP email
      await sendEmailOTP(email, otp);

      res.json({
        message: 'OTP sent successfully',
        email: user.email
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: 'Failed to resend OTP' });
    }
  },

  // Login user (accept email, username, or phone as identifier)
  async login(req, res) {
    console.log('🔐 LOGIN ATTEMPT - Body:', req.body);
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      // Find by email, username, or phone
      let user = await User.findOne({ email: identifier, isActive: true });
      if (!user) {
        user = await User.findOne({ username: identifier.toLowerCase(), isActive: true });
      }
      if (!user) {
        user = await User.findOne({ 'phones.number': identifier, isActive: true });
      }

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: 'Email not verified. Please verify your email first.',
          requiresVerification: true,
          email: user.email
        });
      }

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
  }
};

export default AuthController;