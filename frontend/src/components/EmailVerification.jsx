import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import './EmailVerification.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { verifyEmailRegistration } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // This page will be accessed after Firebase email verification
      // We need to check if user is authenticated and complete registration
      
      // Wait for Firebase auth state to be determined
      setTimeout(async () => {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setVerificationStatus('error');
          setErrorMessage('No authenticated user found. Please click the verification link in your email.');
          toast.error('Please click the verification link in your email first');
          return;
        }

        if (!currentUser.emailVerified) {
          setVerificationStatus('error');
          setErrorMessage('Email not yet verified. Please check your email and click the verification link.');
          toast.error('Email not verified');
          return;
        }

        try {
          // Complete registration in our backend
          const result = await verifyEmailRegistration(currentUser.uid);
          
          if (result.success) {
            setVerificationStatus('success');
            toast.success('Email verified successfully! Welcome to the platform!');
            // Redirect to dashboard after 3 seconds
            setTimeout(() => navigate('/'), 3000);
          } else {
            setVerificationStatus('error');
            setErrorMessage(result.error || 'Registration completion failed');
            toast.error(result.error || 'Registration completion failed');
          }
        } catch (error) {
          console.error('Registration completion error:', error);
          setVerificationStatus('error');
          setErrorMessage('Network error occurred during registration completion');
          toast.error('Network error. Please try again.');
        }
      }, 1000); // Give Firebase auth time to initialize
    };

    verifyEmail();
  }, [verifyEmailRegistration, navigate]);

  const handleRetryRegistration = () => {
    navigate('/register');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="email-verification-page">
      <div className="container">
        <motion.div 
          className="verification-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          {/* Loading State */}
          {verificationStatus === 'verifying' && (
            <motion.div 
              className="verification-content verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 size={64} className="verification-icon spinning" />
              <h2>Verifying Your Email</h2>
              <p>Please wait while we verify your email address...</p>
            </motion.div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <motion.div 
              className="verification-content success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              >
                <CheckCircle size={64} className="verification-icon success-icon" />
              </motion.div>
              <h2>Email Verified! 🎉</h2>
              <p>Your account has been successfully created and verified.</p>
              <div className="success-details">
                <p>You now have <strong>Viewer</strong> access and can:</p>
                <ul>
                  <li>✨ Access exclusive blog posts</li>
                  <li>🎥 Watch premium video content</li>
                  <li>🖼️ Browse complete image gallery</li>
                  <li>💼 View detailed project portfolios</li>
                </ul>
              </div>
              <p className="redirect-info">Redirecting you to the homepage in a few seconds...</p>
              
              <motion.button 
                onClick={() => navigate('/')}
                className="success-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Homepage
              </motion.button>
            </motion.div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <motion.div 
              className="verification-content error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <XCircle size={64} className="verification-icon error-icon" />
              <h2>Verification Failed</h2>
              <p className="error-message">{errorMessage}</p>
              
              <div className="error-help">
                <h4>Possible reasons:</h4>
                <ul>
                  <li>The verification link has expired (links are valid for 24 hours)</li>
                  <li>The link has already been used</li>
                  <li>The link is malformed or corrupted</li>
                  <li>An account with this email already exists</li>
                </ul>
              </div>

              <div className="error-actions">
                <motion.button 
                  onClick={handleRetryRegistration}
                  className="retry-button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Registration Again
                </motion.button>

                <motion.button 
                  onClick={handleGoToLogin}
                  className="login-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Login
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div 
            className="navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/')}
              className="nav-button"
            >
              <ArrowLeft size={16} />
              Back to Homepage
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;