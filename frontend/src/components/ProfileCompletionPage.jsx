import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileCompletionPage.css';

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const fetchProfileStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile status');
      }

      const data = await response.json();
      
      // If not suspended, redirect to home
      if (!data.isSuspended) {
        navigate('/');
        return;
      }

      setStatus(data);
      
      // Pre-fill form with existing data
      setFormData({
        name: data.userData?.name || '',
        email: data.userData?.email || ''
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileStatus();
  }, [fetchProfileStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      setSuccess('Profile completed successfully! Redirecting...');
      
      // Wait 2 seconds then redirect
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-completion-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="profile-completion-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Unable to load profile status'}</p>
        </div>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(status.suspensionExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="profile-completion-page">
      <div className="completion-container">
        <div className="alert-banner">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h2>Action Required: Complete Your Profile</h2>
            <p>
              Your account has been temporarily suspended due to incomplete or inconsistent information.
            </p>
            <p className="days-remaining">
              <strong>Time Remaining: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>
            </p>
            <p className="warning-text">
              If not completed within this period, your account will be permanently deleted.
            </p>
          </div>
        </div>

        {status.missingFields && status.missingFields.length > 0 && (
          <div className="missing-fields">
            <h3>Missing Required Information</h3>
            <ul>
              {status.missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        {status.inconsistencies && status.inconsistencies.length > 0 && (
          <div className="inconsistencies">
            <h3>Data Inconsistencies Found</h3>
            <ul>
              {status.inconsistencies.map((issue, index) => (
                <li key={index}>
                  <strong>{issue.field}:</strong> Please verify your {issue.field}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="completion-form">
          <h3>Complete Your Profile</h3>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              disabled={submitting}
            />
            <small>This should match your registered email</small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Submitting...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>

          <div className="help-text">
            <p>
              <strong>Note:</strong> All information must be accurate and match your account registration.
              Once submitted, your account access will be restored immediately.
            </p>
          </div>
        </form>

        <div className="suspension-details">
          <h4>Suspension Details</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Suspended On:</span>
              <span className="detail-value">
                {new Date(status.suspendedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires On:</span>
              <span className="detail-value">
                {new Date(status.suspensionExpiresAt).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Reason:</span>
              <span className="detail-value">{status.suspensionReason}</span>
            </div>
          </div>
        </div>

        <div className="support-section">
          <p>
            Need help? <a href="/contact">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
