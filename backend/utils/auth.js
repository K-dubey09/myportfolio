import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Simple admin credentials (for development)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // Plain text for now, will hash later
};

export const login = async (username, password) => {
  console.log('Login attempt:', { username, password: password ? '***' : 'empty' });
  
  // Simple comparison for debugging
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log('Login successful');
    
    const token = jwt.sign(
      { username: ADMIN_CREDENTIALS.username, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return { success: true, token };
  }
  
  console.log('Invalid credentials');
  return { success: false, message: 'Invalid credentials' };
};

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};