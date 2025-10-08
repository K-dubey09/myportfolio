import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    company: '',
    position: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
  // removed unused becomingEditor state
  const [secretKey, setSecretKey] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        company: user.company || '',
        position: user.position || ''
      });
      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  // If there's a fixed header, compute its height and set a CSS var so layout can clear it
  useEffect(() => {
    try {
      const header = document.querySelector('header') || document.querySelector('.site-header') || document.querySelector('nav');
      const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty('--profile-top-offset', `${h}px`);
    } catch {
      // ignore
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const updateData = { ...formData };
      
      // If there's a new profile image, upload it first
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profilePicture', profileImage);
        
        const imageResponse = await fetch(`${API_BASE}/api/auth/upload-profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });
        
        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          updateData.profileImage = imageResult.profileImage;
        }
      }

      // Update profile information
  const result = await updateProfile(updateData);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setProfileImage(null);
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Normalize various API response bodies into a user-friendly string
  const formatMessage = (body) => {
    if (!body && body !== '') return '';
    if (typeof body === 'string') return body;
    if (typeof body === 'boolean') return body ? 'Success' : 'Error';
    if (typeof body === 'number') return String(body);
    // objects: try common fields
    if (body && typeof body === 'object') {
      if (body.message) return String(body.message);
      if (body.error) return String(body.error);
      if (body.data && typeof body.data === 'string') return body.data;
      try {
        return JSON.stringify(body);
      } catch {
        return String(body);
      }
    }
    return String(body);
  };

  // Request admin approval
  const handleRequestAdmin = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`${API_BASE}/api/request-admin`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Requesting editor access' }) });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : await res.text();

      if (res.ok) {
        setMessage(formatMessage((body && (body.message || body.data || body.success)) || 'Request sent to admin'));
      } else {
        const errText = (body && (body.error || body.message)) || String(body) || `Status ${res.status}`;
        // If token is invalid/expired, force logout and notify user
        if (res.status === 401 || /invalid token|jwt malformed|token expired/i.test(errText)) {
          setMessage('Session expired or invalid token. Please log in again.');
          logout();
        } else if (res.status === 403 || /blocked|forbidden/i.test(errText)) {
          // Server explicitly blocked this user from requesting
          setMessage(formatMessage('You have been blocked from requesting editor access.')); 
        } else {
          // Allow re-request when server responds with rejection (e.g., previous request was rejected)
          setMessage(formatMessage(errText.includes('Route not found') ? 'Server: Route not found. Try restarting backend.' : errText));
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    } finally {
      setRequesting(false);
    }
  };

  // Use secret key to become editor
  const handleUseKey = async () => {
    if (!secretKey) return setMessage('Please enter a secret key');
    try {
      const res = await fetch(`${API_BASE}/api/access-keys/use`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ key: secretKey }) });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : await res.text();
      if (res.ok) {
        setMessage(formatMessage((body && (body.message || 'You are now an editor')) || 'You are now an editor'));
        // refresh user/auth state more gracefully later; for now reload to pick up new role
        window.location.reload();
      } else {
        const errText = (body && (body.error || body.message)) || String(body) || `Status ${res.status}`;
        if (res.status === 401 || /invalid token|jwt malformed|token expired/i.test(errText)) {
          setMessage('Session expired or invalid token. Please log in again.');
          logout();
        } else {
          setMessage(formatMessage(errText.includes('Route not found') ? 'Server: Route not found. Try restarting backend.' : errText));
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      website: user.website || '',
      company: user.company || '',
      position: user.position || ''
    });
    setPreviewImage(user.profileImage || null);
    setProfileImage(null);
    setMessage('');
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        {message && (
          <motion.div 
            className={`message ${typeof message === 'string' && message.toLowerCase().includes('success') ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {typeof message === 'string' ? message : JSON.stringify(message)}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </motion.div>
        )}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="sidebar-card-title">
              <h2>Personal Information</h2>
            </div>
            <div className="profile-image-section">
              <div className="profile-image-container">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <User size={64} />
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="profile-image" className="image-upload-overlay">
                    <Camera size={20} />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <div className="profile-role">
                  <Shield size={16} />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>

            {/* Account Details Section */}
            <div className="profile-details-section">
              <h3>Account Details</h3>
              <div className="profile-details-list">
                <div className="detail-item">
                  <Calendar size={18} />
                  <div className="detail-info">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <User size={18} />
                  <div className="detail-info">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">{user.name || 'Not set'}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <Mail size={18} />
                  <div className="detail-info">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* moved Become an Editor panel into the main column below (renders only for viewers) */}

          <div className="profile-main">
            {/* Right column: Become an Editor panel (visible only to viewers) */}
            {(user.role && String(user.role).toLowerCase() === 'viewer') && (
              <div className="be-editor-panel" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Become an Editor</h3>
                <p style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Choose one of the options below to gain editor access.</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="edit-btn" onClick={handleRequestAdmin} disabled={requesting}>
                    Request Admin Approval
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Enter secret key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                    <button className="save-btn" onClick={handleUseKey}>Use Secret Key</button>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-form">
              <div className="form-header">
                <h2>Personal Information</h2>
                <div className="form-actions">
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button onClick={handleSave} disabled={loading} className="save-btn">
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={handleCancel} className="cancel-btn">
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="form-value">
                      <User size={16} />
                      <span>{formData.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="form-value">
                      <Mail size={16} />
                      <span>{formData.email || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="form-value">
                      <Phone size={16} />
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="form-value">
                      <MapPin size={16} />
                      <span>{formData.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter your company"
                    />
                  ) : (
                    <div className="form-value">
                      <span>{formData.company || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Enter your position"
                    />
                  ) : (
                    <div className="form-value">
                      <span>{formData.position || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Enter your website URL"
                    />
                  ) : (
                    <div className="form-value">
                      <span>{formData.website || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows="4"
                    />
                  ) : (
                    <div className="form-value">
                      <span>{formData.bio || 'No bio provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;