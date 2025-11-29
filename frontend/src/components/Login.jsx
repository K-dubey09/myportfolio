import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, Mail } from 'lucide-react';
import './Login.css';

const Login = ({ onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailLinkTrackingId, setEmailLinkTrackingId] = useState(null);
  const { login, googleSignIn, sendEmailLinkForLogin } = useAuth();

  // Check for existing tracking ID on mount (in case of page refresh)
  useEffect(() => {
    const storedTrackingId = window.localStorage.getItem('emailLinkTrackingId');
    if (storedTrackingId) {
      console.log('🔄 Restored email link tracking ID from localStorage:', storedTrackingId);
      setEmailLinkTrackingId(storedTrackingId);
    }
  }, []);

  // Real-time listener for cross-device email link login detection
  useEffect(() => {
    if (!emailLinkTrackingId) return; // Only listen if we have a tracking ID

    console.log('🎧 Setting up Firestore listener for email link login:', emailLinkTrackingId);

    // Listen to Firestore document changes
    const unsubscribe = onSnapshot(
      doc(db, 'emailLinkLoginTracking', emailLinkTrackingId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('📡 Email link login status update:', data.status);

          if (data.status === 'completed') {
            console.log('✅ Email link login completed on another device! Redirecting...');
            toast.success('Signed in successfully! Redirecting...');
            
            // Clean up listener
            unsubscribe();
            
            // Clear tracking ID from localStorage
            window.localStorage.removeItem('emailLinkTrackingId');
            
            // Redirect to home after a brief delay
            setTimeout(() => {
              if (onClose) onClose();
              navigate('/', { replace: true });
            }, 1500);
          }
        }
      },
      (error) => {
        console.error('❌ Firestore listener error:', error);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Cleaning up email link login listener');
      unsubscribe();
    };
  }, [emailLinkTrackingId, navigate, onClose]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const authResult = await googleSignIn(idToken);
      
      if (authResult.success) {
        const roleName = authResult.user.role === 'admin' ? 'Admin' : authResult.user.role === 'editor' ? 'Editor' : 'Viewer';
        toast.success(`Welcome, ${authResult.user.name}! (${roleName})`);
        if (onClose) onClose();
        
        // Redirect based on role
        if (authResult.user.role === 'admin') {
          setTimeout(() => navigate('/admin'), 500);
        } else {
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        setError(authResult.error || 'Google sign-in failed');
        toast.error(authResult.error || 'Google sign-in failed');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        const roleName = result.user.role === 'admin' ? 'Admin' : result.user.role === 'editor' ? 'Editor' : 'Viewer';
        toast.success(`Welcome back, ${result.user.name}! (${roleName})`);
        if (onClose) onClose();
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          setTimeout(() => navigate('/admin'), 500);
        } else {
          setTimeout(() => navigate('/'), 500);
        }
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

  const handleEmailLinkLogin = async () => {
    if (!credentials.email) {
      setError('Please enter your email address first');
      toast.error('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendEmailLinkForLogin(credentials.email);
      
      if (result.success && result.trackingId) {
        // Store tracking ID to enable cross-device detection
        setEmailLinkTrackingId(result.trackingId);
        console.log('📊 Email link tracking ID set:', result.trackingId);
      }
      
      toast.success('Sign-in link sent! Check your email to complete login.');
      // Don't close or navigate - keep page open for cross-device detection
    } catch (err) {
      console.error('Email link error:', err);
      setError(err.message || 'Failed to send email link');
      toast.error(err.message || 'Failed to send email link');
    }

    setLoading(false);
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
          
          <div className="forgot-password-wrapper">
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={() => toast('Password reset feature coming soon!', { icon: 'ℹ️' })}
            >
              Forgot Password?
            </button>
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
          <span>Or continue with</span>
        </div>

        <button 
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <button 
          type="button"
          className="email-link-btn"
          onClick={handleEmailLinkLogin}
          disabled={loading || !credentials.email}
        >
          <Mail size={18} />
          Sign in with Email Link
        </button>

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
          <h4>Account Benefits:</h4>
          <div className="role-benefits">
            <div className="benefit-item">
              <strong>👁️ Viewer:</strong> Access exclusive blogs, vlogs, and gallery content
            </div>
            <div className="benefit-item">
              <strong>✏️ Editor:</strong> Create and manage content, upload files
            </div>
            <div className="benefit-item">
              <strong>👑 Admin:</strong> Full system access and user management
            </div>
          </div>
          <p className="security-note">
            🔒 Your data is secured with Firebase Authentication
          </p>
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