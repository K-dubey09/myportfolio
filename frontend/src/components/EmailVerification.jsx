import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (mode === 'verifyEmail' && oobCode) {
      axios.post('http://localhost:5000/api/auth/register/verify-email', { oobCode })
        .then(() => {
          toast.success('Email verified successfully!');
          setMessage('Your email has been verified. You can now close this tab and return to the original device to be logged in.');
        })
        .catch(error => {
          const errorMessage = error.response?.data?.message || 'An error occurred during verification.';
          toast.error(errorMessage);
          setMessage(`Verification failed: ${errorMessage}`);
        });
    } else {
      setMessage('Invalid verification link.');
    }
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default EmailVerification;