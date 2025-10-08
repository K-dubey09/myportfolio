import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
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
        
        const imageResponse = await fetch('/api/auth/upload-profile-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            className={`message ${message.includes('success') ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </motion.div>
        )}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-image-section">
              <div className="profile-image-container">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <User size={48} />
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
              </div>
              <div className="profile-role">
                <Shield size={16} />
                <span>{user.role}</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <Calendar size={16} />
                <span>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="profile-main">
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