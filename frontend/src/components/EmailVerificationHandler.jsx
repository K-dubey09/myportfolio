import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/env';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EmailVerificationHandler = () => {
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const pollInterval = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (!uid) {
      setError('No user ID provided. Please try registering again.');
      setStatus('failed');
      return;
    }

    const pollVerificationStatus = async () => {
      try {
        console.log('Polling for verification status for UID:', uid);
  const response = await axios.get(`${API_URL}/auth/verification-status/${uid}`);
        const { status: verificationStatus, customToken, user } = response.data;

        if (verificationStatus === 'verified') {
          setStatus('verified');
          toast.success('Email successfully verified! Logging you in...');
          clearInterval(pollInterval.current); // Stop polling

          if (customToken && user) {
            await loginWithToken(customToken, user);
            navigate('/profile'); // Redirect to profile page on success
          } else {
            // Should not happen with the current backend logic, but as a fallback
            toast.error('Login failed. Please try logging in manually.');
            navigate('/login');
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error checking verification status.';
        console.error(errorMessage);
        if (err.response?.status === 404) {
            setError('Verification process not found. You may need to register again.');
            setStatus('failed');
            clearInterval(pollInterval.current);
        }
        // Don't stop polling on other server errors, they might be temporary
      }
    };

    // Poll immediately and then set an interval
    pollVerificationStatus();
    pollInterval.current = setInterval(pollVerificationStatus, 5000); // Poll every 5 seconds

    // Cleanup on component unmount
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [uid, loginWithToken, navigate]);

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
        <h2>Verification Status Check Failed</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/register')} style={{ marginTop: '20px' }}>Go to Registration</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h2>Please Verify Your Email</h2>
      <p>A verification link has been sent to your email address.</p>
      <p>Please check your inbox (and spam folder) and click the link to complete your registration.</p>
      <p><strong>This page will automatically update once you are verified.</strong></p>
    </div>
  );
};

export default EmailVerificationHandler;
