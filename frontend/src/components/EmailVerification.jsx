import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { applyActionCode } from 'firebase/auth';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './EmailVerification.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailRegistration } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleEmailVerification = async () => {
    try {
      // Get the action code from URL parameters
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      
      console.log('🔍 Email verification initiated', { mode, oobCode });

      if (mode !== 'verifyEmail' || !oobCode) {
        // This verification page is only for email verification from registration
        // Not for passwordless email link sign-in
        setErrorMessage('Invalid verification link. Please request a new one.');
        setVerificationStatus('error');
        setLoading(false);
        return;
      }

      // Apply the email verification code
      await applyActionCode(auth, oobCode);
      console.log('✅ Email verified successfully in Firebase');

      // Complete registration in backend using oobCode
      // Backend will extract the email from oobCode
      console.log('📝 Completing registration and logging in...');
      const result = await verifyEmailRegistration(null, oobCode);
        
      if (result.success) {
        setVerificationStatus('success');
        console.log('✅ User logged in successfully!');
        console.log('🏠 Redirecting to home page...');
        
        // Signal to registration page that verification is complete
        localStorage.setItem('emailVerified', 'true');
        localStorage.setItem('verificationComplete', Date.now().toString());
        
        toast.success('Welcome! You are now logged in.');
        // Redirect immediately after successful login
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Failed to complete registration');
        setVerificationStatus('error');
        toast.error(result.error);
      }
        
    } catch (error) {
      console.error('❌ Email verification error:', error);
      setErrorMessage(error.message || 'Verification failed');
      setVerificationStatus('error');
      toast.error('Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

    handleEmailVerification();
  }, [searchParams, verifyEmailRegistration, navigate]);

  if (loading) {
    return (
      <div className="email-verification-page">
        <div className="verification-container">
          <Loader2 className="spinner" size={48} />
          <h2>Verifying your email...</h2>
          <p>Please wait while we complete your verification.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="email-verification-page">
        <div className="verification-container success">
          <CheckCircle size={64} className="success-icon" />
          <h2>✅ Welcome! You're All Set!</h2>
          <p>✓ Email verified successfully</p>
          <p>✓ Account activated</p>
          <p>✓ You are now logged in</p>
          <p className="redirect-message">🏠 Taking you home now...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="email-verification-page">
        <div className="verification-container error">
          <XCircle size={64} className="error-icon" />
          <h2>Verification Failed</h2>
          <p className="error-message">{errorMessage}</p>
          <button 
            onClick={() => navigate('/register')} 
            className="retry-btn"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="login-btn-link"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default EmailVerification;