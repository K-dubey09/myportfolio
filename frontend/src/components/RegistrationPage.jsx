import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: basic info, 2: password, 3: OTP verification, 4: success
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register, verifyEmail, resendOTP } = useAuth();

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info before moving to password
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      else if (!/^[a-z0-9_]+$/.test(formData.username.trim())) newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setStep(2);
      } else {
        toast.error('Please fix the errors below');
      }
    }
  };

  const prevStep = () => {
    if (step > 1 && step < 3) {
      setStep(step - 1);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 30) {
      newErrors.username = 'Username must be 30 characters or less';
    } else if (!/^[a-z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.username, formData.name, 'viewer');
      
      if (result.success && result.requiresVerification) {
        setRegisteredEmail(formData.email);
        setStep(3); // OTP verification step
        toast.success('Registration initiated! Please check your email for OTP.');
      } else if (result.success) {
        setStep(4); // Success step
        toast.success('Registration successful!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(result.error || 'Registration failed');
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyEmail(registeredEmail, otp);
      
      if (result.success) {
        setStep(4); // Success step
        toast.success('Email verified successfully! Welcome!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(result.error || 'Verification failed');
        setErrors({ otp: result.error || 'Verification failed' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const result = await resendOTP(registeredEmail);
      if (result.success) {
        toast.success('OTP resent successfully! Check your email.');
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // OTP Verification step
  if (step === 3) {
    return (
      <motion.div 
        className="registration-page"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        <div className="registration-container">
          <motion.div 
            className="registration-header"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1>
              <Mail className="header-icon" />
              Verify Your Email
            </h1>
            <p>We've sent a 6-digit OTP to <strong>{registeredEmail}</strong></p>
          </motion.div>

          <form onSubmit={handleVerifyOTP} className="registration-form">
            <motion.div 
              className="form-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="otp">
                  Enter OTP Code
                </label>
                <motion.input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className={errors.otp ? 'error' : ''}
                  disabled={loading}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                {errors.otp && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.otp}
                  </motion.span>
                )}
              </div>

              <motion.button 
                type="submit"
                className="register-button"
                disabled={loading || otp.length !== 6}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </motion.button>

              <motion.button 
                type="button"
                onClick={handleResendOTP}
                className="back-button"
                disabled={loading}
                style={{ marginTop: '1rem', width: '100%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Resend OTP
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    );
  }

  // Success step
  if (step === 4) {
    return (
      <motion.div 
        className="registration-page success-page"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="success-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.4 }}
          >
            <CheckCircle className="success-icon" size={80} />
          </motion.div>
          <h2>Welcome Aboard! 🎉</h2>
          <p>Your email has been verified successfully.</p>
          <p className="role-info">You now have <strong>Viewer</strong> access to exclusive content!</p>
          <motion.div 
            className="success-features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="feature-item">✨ Access to exclusive blog posts</div>
            <div className="feature-item">🎥 Watch premium video content</div>
            <div className="feature-item">🖼️ Browse complete image gallery</div>
            <div className="feature-item">💼 View detailed project portfolios</div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="registration-page"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="registration-container">
        <motion.button 
          className="back-button"
          onClick={() => navigate('/login')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          Back to Login
        </motion.button>

        <motion.div 
          className="registration-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1>
            <UserPlus className="header-icon" />
            Create Your Account
          </h1>
          <p>Join our community and get access to exclusive content</p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="progress-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Basic Info</span>
          </div>
          <div className="progress-line">
            <motion.div 
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: step >= 2 ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Security</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <motion.div 
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  Full Name
                </label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                  disabled={loading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                {errors.name && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.name}
                  </motion.span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="username">
                  <User size={18} />
                  Username (unique)
                </label>
                <motion.input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  className={errors.username ? 'error' : ''}
                  disabled={loading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                />
                {errors.username && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.username}
                  </motion.span>
                )}
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Only lowercase letters, numbers, and underscores (3-30 characters)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} />
                  Email Address
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
                {errors.email && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.span>
                )}
              </div>

              <motion.button 
                type="button"
                onClick={nextStep}
                className="next-button"
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Security
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <motion.div 
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={18} />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={18} />
                  Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <motion.input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.span 
                    className="error-text"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.span>
                )}
              </div>

              {errors.submit && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.submit}
                </motion.div>
              )}

              <div className="form-actions">
                <motion.button 
                  type="button"
                  onClick={prevStep}
                  className="prev-button"
                  disabled={loading}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Previous
                </motion.button>

                <motion.button 
                  type="submit"
                  className="register-button"
                  disabled={loading}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </form>

        <motion.div 
          className="registration-info"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h4>What you'll get as a Viewer:</h4>
          <div className="benefits-grid">
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <span className="benefit-icon">📚</span>
              <span>Exclusive blog access</span>
            </motion.div>
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <span className="benefit-icon">🎥</span>
              <span>Premium video content</span>
            </motion.div>
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <span className="benefit-icon">🖼️</span>
              <span>Full gallery access</span>
            </motion.div>
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <span className="benefit-icon">💼</span>
              <span>Detailed portfolios</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegistrationPage;