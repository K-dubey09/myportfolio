import firebaseConfig from '../config/firebase.js';
import { UserHelpers } from '../utils/firestoreHelpers.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existingUser = await UserHelpers.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await UserHelpers.createUser({ email, password, name });

    const customToken = await firebaseConfig.getAuth().createCustomToken(newUser.uid, {
      role: newUser.role,
      permissions: newUser.permissions
    });

    res.status(201).json({
      message: 'User registered successfully',
      customToken,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isPasswordValid = await UserHelpers.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await UserHelpers.updateLastLogin(user.uid);

    const customToken = await firebaseConfig.getAuth().createCustomToken(user.uid, {
      role: user.role,
      permissions: user.permissions
    });

    res.json({
      message: 'Login successful',
      customToken,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserHelpers.getUserById(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
      userNumber: user.userNumber,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = await UserHelpers.updateUser(req.user.uid, updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await UserHelpers.getUserById(req.user.uid);
    const isPasswordValid = await UserHelpers.comparePassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    await UserHelpers.updateUser(user.uid, { password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    await firebaseConfig.getAuth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
