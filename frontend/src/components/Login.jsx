import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import './Login.css';

const Login = ({ onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        if (onClose) onClose();
      } else {
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    if (onClose) onClose();
    navigate('/register');
  };

  return (
    <motion.div 
      className="login-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="login-container"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-header">
          <h2>
            <LogIn className="login-icon" />
            Login to Your Account
          </h2>
          <p>Access your personalized portfolio experience</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <User size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>New to the platform?</span>
        </div>

        <button 
          type="button"
          className="register-btn"
          onClick={handleRegisterClick}
          disabled={loading}
        >
          <UserPlus size={18} />
          Register as Viewer
        </button>

        <div className="login-info">
          <h4>Role Benefits:</h4>
          <div className="role-benefits">
            <div className="benefit-item">
              <strong>Viewer:</strong> Access to exclusive blogs, vlogs, and gallery content
            </div>
            <div className="benefit-item">
              <strong>Admin:</strong> Full access to admin panel and content management
            </div>
          </div>
        </div>

        {onClose && (
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Login;