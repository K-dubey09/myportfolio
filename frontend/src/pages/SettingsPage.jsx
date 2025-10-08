import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Moon, 
  Sun, 
  Star,
  Shield,
  Key,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, changePassword, deleteAccount } = useAuth();
  const { theme, setSpecificTheme, isAnimated, toggleAnimations, themes } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    securityAlerts: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessaging: true
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 5000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        showMessage('Password changed successfully!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage(result.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showMessage('An error occurred while changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showMessage('Notification preferences updated', 'success');
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    showMessage('Privacy settings updated', 'success');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const confirmDelete = window.prompt('Type "DELETE" to confirm account deletion:');
      if (confirmDelete === 'DELETE') {
        setLoading(true);
        try {
          const result = await deleteAccount();
          if (result.success) {
            showMessage('Account deleted successfully', 'success');
          } else {
            showMessage(result.error || 'Failed to delete account', 'error');
          }
        } catch (error) {
          console.error('Account deletion error:', error);
          showMessage('Failed to delete account', 'error');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'danger', name: 'Danger Zone', icon: Trash2 }
  ];

  const themeLabels = {
    light: { name: 'Light', icon: Sun },
    dark: { name: 'Dark', icon: Moon },
    blue: { name: 'Ocean Blue', icon: Globe },
    purple: { name: 'Cosmic Purple', icon: Star },
    green: { name: 'Nature Green', icon: Globe }
  };

  return (
    <motion.div 
      className="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and settings</p>
        </div>

        {message && (
          <motion.div 
            className={`message ${message.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message.text}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </motion.div>
        )}

        <div className="settings-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={20} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2>Appearance</h2>
                <p>Customize how the application looks and feels</p>

                <div className="setting-group">
                  <h3>Theme</h3>
                  <p>Choose your preferred color scheme</p>
                  <div className="theme-grid">
                    {Object.entries(themeLabels).map(([themeKey, themeInfo]) => (
                      <button
                        key={themeKey}
                        className={`theme-option ${theme === themeKey ? 'active' : ''}`}
                        onClick={() => setSpecificTheme(themeKey)}
                      >
                        <themeInfo.icon size={24} />
                        <span>{themeInfo.name}</span>
                        {theme === themeKey && <div className="active-indicator">✓</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Animations</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <span>Enable Animations</span>
                      <p>Turn on/off motion and transition effects</p>
                    </div>
                    <button
                      className={`toggle-switch ${isAnimated ? 'active' : ''}`}
                      onClick={toggleAnimations}
                    >
                      <div className="toggle-slider"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notifications</h2>
                <p>Control what notifications you receive</p>

                <div className="setting-group">
                  <h3>Email Notifications</h3>
                  {Object.entries({
                    emailNotifications: 'General email notifications',
                    marketingEmails: 'Marketing and promotional emails',
                    securityAlerts: 'Security and account alerts'
                  }).map(([key, label]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <span>{label}</span>
                      </div>
                      <button
                        className={`toggle-switch ${notifications[key] ? 'active' : ''}`}
                        onClick={() => handleNotificationChange(key)}
                      >
                        <div className="toggle-slider"></div>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="setting-group">
                  <h3>Push Notifications</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <span>Browser Notifications</span>
                      <p>Get notified about important updates</p>
                    </div>
                    <button
                      className={`toggle-switch ${notifications.pushNotifications ? 'active' : ''}`}
                      onClick={() => handleNotificationChange('pushNotifications')}
                    >
                      <div className="toggle-slider"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy</h2>
                <p>Control your privacy and data sharing preferences</p>

                <div className="setting-group">
                  <h3>Profile Visibility</h3>
                  <div className="radio-group">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                      { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
                      { value: 'contacts', label: 'Contacts Only', desc: 'Only your contacts can view' }
                    ].map((option) => (
                      <label key={option.value} className="radio-option">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={privacy.profileVisibility === option.value}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        />
                        <div className="radio-content">
                          <span>{option.label}</span>
                          <p>{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Contact Information</h3>
                  {Object.entries({
                    showEmail: 'Show email address on profile',
                    showPhone: 'Show phone number on profile',
                    allowMessaging: 'Allow others to send me messages'
                  }).map(([key, label]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <span>{label}</span>
                      </div>
                      <button
                        className={`toggle-switch ${privacy[key] ? 'active' : ''}`}
                        onClick={() => handlePrivacyChange(key, !privacy[key])}
                      >
                        <div className="toggle-slider"></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security</h2>
                <p>Manage your account security and password</p>

                <div className="setting-group">
                  <h3>Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="save-btn">
                      <Key size={16} />
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="settings-section danger-zone">
                <h2>Danger Zone</h2>
                <p>Irreversible and destructive actions</p>

                <div className="setting-group">
                  <div className="danger-item">
                    <div className="danger-info">
                      <h3>Delete Account</h3>
                      <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="danger-btn"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;