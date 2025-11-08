import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import './RegistrationPage.css';
import './EmailInstructionsStyles.css';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1=name/email, 2=confirm, 3=password, 4=email-sent, 5=success
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const { requestEmailVerification } = useAuth();

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

  const nextStep = () => {
    if (step === 1) {
      if (formData.name.trim() && formData.email.trim()) {
        setStep(2);
      } else {
        toast.error('Please fill in your name and email');
      }
    } else if (step === 2) {
      // Move from confirmation to password step
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRequestEmailVerification = async () => {
    // Validate password fields first
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      toast.error('Password is required');
      return;
    }
    
    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.confirmPassword) {
      setErrors({ confirmPassword: 'Please confirm your password' });
      toast.error('Please confirm your password');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const result = await requestEmailVerification(formData.email, formData.name, formData.password);
      
      if (result.success) {
        setVerificationEmailSent(true);
        setStep(4); // Move to email-sent step (step 4)
        toast.success('Verification email sent! Check your inbox and spam folder.');
      } else {
        // Check if error is about existing user
        if (result.error && result.error.includes('already exists')) {
          toast.error('This email is already registered. Please login instead.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error(result.error || 'Failed to send verification email');
        }
      }
    } catch (error) {
      console.error('Email verification request error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setErrors({});
    await handleRequestEmailVerification();
  };

  // Success step
  if (step === 5) {
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
          <p>Your account has been created successfully.</p>
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
            <span>Contact</span>
          </div>
          <div className="progress-line">
            <motion.div 
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: step >= 3 ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Security</span>
          </div>
          <div className="progress-line">
            <motion.div 
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: step >= 4 ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span>Verify</span>
          </div>
        </motion.div>

        <div className="registration-form">
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
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Contact Confirmation */}
          {step === 2 && (
            <motion.div 
              className="form-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="contact-confirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>Confirm Your Details</h3>
                <div className="detail-item">
                  <User size={18} />
                  <div>
                    <label>Name</label>
                    <strong>{formData.name}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <strong>{formData.email}</strong>
                  </div>
                </div>
              </motion.div>

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
                  type="button"
                  onClick={nextStep}
                  className="next-button"
                  disabled={loading}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to Security
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
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

              <motion.div 
                className="otp-notice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <p>📧 Email verification required</p>
                <span>We'll send a verification code to your email to complete registration</span>
              </motion.div>

              <div className="form-actions">
                <motion.button 
                  type="button"
                  onClick={prevStep}
                  className="prev-button"
                  disabled={loading}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Previous
                </motion.button>

                <motion.button 
                  type="button"
                  onClick={handleRequestEmailVerification}
                  className="email-verification-button"
                  disabled={loading}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Send Verification Email
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Email Verification Sent */}
          {step === 4 && (
            <motion.div 
              className="form-step email-sent-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="email-sent-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle size={64} className="email-sent-icon" />
                <h3>Check Your Email</h3>
                <p>We've sent a verification link to:</p>
                <strong>{formData.email}</strong>
                <span className="email-hint">
                  Click the verification link in your email to complete your registration.
                  The link will expire in 24 hours.
                </span>
                <div className="email-instructions">
                  <p>📧 <strong>Check your inbox</strong> for an email from Firebase</p>
                  <p>📂 Don't see it? <strong>Check your spam/junk folder</strong></p>
                  <p>🔗 <strong>Click the verification link</strong> in the email</p>
                  <p>✅ You'll be redirected back here once verified</p>
                </div>
              </motion.div>

              <motion.div 
                className="email-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <p>Didn't receive the email?</p>
                
                <button 
                  type="button" 
                  onClick={handleResendEmail}
                  className="resend-email-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Resending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </motion.div>

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
                  type="button"
                  onClick={() => navigate('/login')}
                  className="login-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go to Login
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

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