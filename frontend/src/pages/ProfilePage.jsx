
import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Shield, MessageCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import '../components/ChatPanel.css';
import ChatNewModal from '../components/ChatNewModal.jsx';
import ChatPanelInline from '../components/ChatPanelInline.jsx';

const ProfilePage = () => {
  const { user, updateProfile, token, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Profile UI state
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // Phone OTP UI state
  const [otpCode, setOtpCode] = useState('');
  // Per-phone UI state: countdown, inline message
  const [phoneOtpState, setPhoneOtpState] = useState({});

  // Helper to set per-phone state
  const setPhoneState = (phone, partial) => {
    setPhoneOtpState(prev => ({ ...(prev || {}), [phone]: { ...(prev[phone] || {}), ...partial } }));
  };

  // Keep refs to intervals per-phone so we can clear them on unmount
  const phoneTimerRefs = React.useRef({});

  useEffect(() => {
    return () => {
      // cleanup all timers when component unmounts
      const refs = phoneTimerRefs.current || {};
  Object.values(refs).forEach(iv => { try { clearInterval(iv); } catch { /* ignore */ } });
      phoneTimerRefs.current = {};
    };
  }, []);

  // Optional libphonenumber integration (dynamically imported if available)
  const phoneLib = React.useRef(null);

  // Fallback basic phone validation (E.164-ish simple check)
  const fallbackIsValidPhone = (phone) => {
    if (!phone) return false;
    const s = String(phone).trim();
    return /^\+?\d{7,15}$/.test(s);
  };

  // Try to validate using `libphonenumber-js` when available, otherwise use fallback
  const validatePhone = async (phone) => {
    const s = String(phone || '').trim();
    if (!s) return false;
    try {
      if (!phoneLib.current) {
        // Try dynamic import; avoid letting Vite statically resolve the import
        // Use @vite-ignore so Vite doesn't pre-bundle this dependency during dev if it's missing
        try {
          const mod = await import(/* @vite-ignore */ 'libphonenumber' + '-js');
          phoneLib.current = mod;
        } catch {
          // Last-resort: some bundlers may still choke; try a runtime require via eval (will fail in strict ESM environments)
          try {
            const req = eval('require');
            phoneLib.current = req ? req('libphonenumber' + '-js') : null;
          } catch {
            phoneLib.current = null;
          }
        }
      }

      if (phoneLib.current && phoneLib.current.parsePhoneNumberFromString) {
        const { parsePhoneNumberFromString } = phoneLib.current;
        const p = parsePhoneNumberFromString(s);
        return !!(p && p.isValid && p.isValid());
      }
    } catch {
      console.debug('libphonenumber validation failed, falling back');
    }
    return fallbackIsValidPhone(s);
  };

  // LocalStorage helpers to persist OTP expiry timestamps across reloads
  const OTP_STORAGE_KEY = 'otp_expires_map_v1';
  const readOtpExpiryMap = () => {
    try {
      const raw = localStorage.getItem(OTP_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') return parsed;
      return {};
    } catch {
      return {};
    }
  };
  const writeOtpExpiryMap = (map) => {
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(map || {}));
  } catch { /* ignore */ }
  };

  // Restore any persisted countdowns from localStorage on mount
  useEffect(() => {
    const map = readOtpExpiryMap();
    Object.keys(map).forEach((phone) => {
      const expiresAt = Number(map[phone]) || 0;
      const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
      if (remaining > 0) {
        setPhoneState(phone, { countdown: remaining, expiresAt });
        // start interval
        const iv = setInterval(() => {
          const nowRemaining = Math.ceil((expiresAt - Date.now()) / 1000);
          setPhoneState(phone, { countdown: Math.max(0, nowRemaining) });
          if (nowRemaining <= 0) {
            try { clearInterval(iv); } catch { /* ignore */ };
            setPhoneState(phone, { countdown: 0 });
            delete phoneTimerRefs.current[phone];
            // cleanup storage
            const cur = readOtpExpiryMap();
            delete cur[phone];
            writeOtpExpiryMap(cur);
          }
        }, 1000);
        phoneTimerRefs.current[phone] = iv;
      } else {
        // expired - remove stale entry
        const cur = readOtpExpiryMap();
        if (cur[phone]) { delete cur[phone]; writeOtpExpiryMap(cur); }
      }
    });
  }, []);
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
  const [secretKey, setSecretKey] = useState('');
  const [requesting, setRequesting] = useState(false);
  // Chat sidebar state
  const [chatsList, setChatsList] = useState([]);
  const [userCache, setUserCache] = useState({});
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pinnedAdmin, setPinnedAdmin] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);

  // apiFetch helper for sidebar/modal
  const apiFetch = useCallback(async (path, opts = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(url, { ...opts, headers });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return { res, json: await res.json() };
      return { res, text: await res.text() };
    } catch (err) {
      console.error('apiFetch error', err);
      return { res: null, err };
    }
  }, [API_BASE, token]);

  const fetchParticipants = async () => {
    if (!token) return;
    try {
      const { res, json } = await apiFetch('/api/chats');
      if (res && res.ok) {
        const chats = (json && (json.data || json)) || [];
        // Only keep chats where the current user is a participant (safety if backend returns more)
        const arr = Array.isArray(chats) ? chats : [];
        const filtered = arr.filter(c => {
          const parts = c.participants || [];
          return parts.some(p => String(p._id || p.id) === String(user && (user._id || user.id)));
        });
        setChatsList(filtered);
      }
    } catch (err) { console.error(err); }
  };

  // Cache minimal user records for participants that lack name/avatar so UI can display names
  useEffect(() => {
    if (!Array.isArray(chatsList) || chatsList.length === 0) return;
    const missing = new Set();
    chatsList.forEach(chat => {
      const parts = chat.participants || [];
      parts.forEach(p => {
        const id = p && (p._id || p.id);
        if (!id) return;
        const hasName = (p && (p.name || p.email));
        if (!hasName && !userCache[String(id)]) missing.add(String(id));
      });
    });

    if (missing.size === 0) return;
    // fetch missing users (parallel)
    (async () => {
      const ids = Array.from(missing);
      const results = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const { res, json } = await apiFetch(`/api/users/${id}`);
          if (res && res.ok && json) {
            const u = json.user || json;
            if (u) results[id] = u;
          }
        } catch { /* ignore individual failures */ }
      }));
      if (Object.keys(results).length) setUserCache(prev => ({ ...prev, ...results }));
    })();
  }, [chatsList, apiFetch, userCache]);

    const fetchPinnedAdmin = async () => {
      if (!token) return;
      try {
        // If current user is admin, fetch via admin route
        if (user && String(user.role).toLowerCase() === 'admin') {
          const { res, json } = await apiFetch('/api/admin/users');
          if (res && res.ok && Array.isArray(json)) {
            const adminUser = (json.find(u => (u.role || '').toLowerCase() === 'admin')) || json[0];
            if (adminUser) setPinnedAdmin(adminUser);
            return;
          }
        }

        // Non-admin: try a best-effort search by name 'Administrator'
        const { json } = await apiFetch(`/api/users?search=${encodeURIComponent('Administrator')}&limit=1`);
        const users = json && (json.users || json.data || json) || [];
        if (Array.isArray(users) && users[0]) setPinnedAdmin(users[0]);
      } catch (err) {
        console.debug('fetchPinnedAdmin failed', err);
      }
    };

  useEffect(() => {
    if (activeSidebar === 'chat') {
      fetchParticipants();
      fetchPinnedAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSidebar, token]);

  // Sidebar now shows only chats (conversations) the user participates in; search filters chats by participant or subject
  useEffect(() => {
    if (!Array.isArray(chatsList) || !sidebarQuery) return;
    // filtering is done in render by applying sidebarQuery to chatsList
  }, [sidebarQuery, chatsList]);

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    } catch (err) {
      console.error('preview creation failed', err);
    }
  };

  // handleImageChange removed (was unused)

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


  // Sidebar navigation items
  const sidebarNav = [
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
    { key: 'chat', label: 'Chat & Collaboration', icon: <MessageCircle size={18} /> },
    // Add more options here if needed
  ];
  // (moved to top for correct hook order)

  return (
    <motion.div
      className={`profile-page profile-admin-layout ${activeSidebar === 'chat' ? 'chat-active' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-admin-sidebar">
        <div className="sidebar-header">
          <button className="sidebar-back-btn" onClick={() => navigate('/')} aria-label="Back to home" style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <div className="profile-image-container">
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <User size={48} />
              </div>
            )}
            <div className="profile-role">
              <Shield size={14} />
              <span>{user.role}</span>
            </div>
          </div>
          <div className="sidebar-username">{user.name || 'User'}</div>
        </div>
        <nav className="sidebar-nav">
          {sidebarNav.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item${activeSidebar === item.key ? ' active' : ''}`}
              onClick={() => setActiveSidebar(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
  <div className={`profile-admin-main${activeSidebar === 'chat' ? ' with-right-sidebar' : ''}`}>
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

        {/* Main content area switches by sidebar selection */}
        {activeSidebar === 'profile' && (
          <div className="profile-main-content">
            <div className="profile-header">
              <h1>My Profile</h1>
              <p>Manage your personal information and preferences</p>
            </div>

            {/* Become an Editor panel (visible only to viewers) */}
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

              {/* Username & Profile Picture - moved above other inputs */}
              <div className="username-picture-section" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ minWidth: 120 }}>Username</label>
                {isEditing ? (
                  <>
                    <input className="username-input" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Username" style={{ flex: '1 1 auto' }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input id="profileImageInput" className="hidden-file" type="file" accept="image/*" onChange={handleProfileImageChange} />
                      <label htmlFor="profileImageInput" className="file-btn">Choose File</label>
                      {previewImage ? (
                        <img className="profile-avatar-small" src={previewImage} alt="preview" />
                      ) : (
                        <div className="profile-avatar-small placeholder"> 
                          <User size={18} />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        {previewImage ? (
                          <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-primary)', color: 'var(--text-secondary)' }}>
                            <User size={18} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formData.name || user.name || 'User'}</div>
                    </div>
                  </>
                )}
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        style={{ flex: '1 1 auto' }}
                      />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="otp-send-btn"
                            onClick={async () => {
                              const phone = String(formData.phone || '').trim();
                              if (!phone) return setMessage('Please enter a phone number first');
                              // validate using libphonenumber if available, otherwise fallback
                              const ok = await validatePhone(phone);
                              if (!ok) { setPhoneState(phone, { sending: false, error: 'Invalid phone format. Use +<countrycode><number>' }); return; }
                              // disable repeated sends per-phone
                              const st = phoneOtpState[phone] || {};
                              if (st.sending) return;
                              setPhoneState(phone, { sending: true, error: null, success: null });
                              try {
                                const { res, json } = await apiFetch('/api/auth/phone/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
                                if (res && res.ok) {
                                  const now = Date.now();
                                  const expiresAt = now + (60 * 1000);
                                  setPhoneState(phone, { sentAt: now, sending: false, success: 'OTP sent (simulated)', error: null, countdown: 60, expiresAt });
                                  // persist expiry to localStorage
                                  const cur = readOtpExpiryMap(); cur[phone] = expiresAt; writeOtpExpiryMap(cur);
                                  // start countdown interval (cleanup-aware)
                                  const iv = setInterval(() => {
                                    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
                                    setPhoneState(phone, { countdown: Math.max(0, remaining) });
                                    if (remaining <= 0) {
                                      try { clearInterval(iv); } catch { /* ignore */ };
                                      setPhoneState(phone, { countdown: 0 });
                                      delete phoneTimerRefs.current[phone];
                                      const cur2 = readOtpExpiryMap(); delete cur2[phone]; writeOtpExpiryMap(cur2);
                                    }
                                  }, 1000);
                                  phoneTimerRefs.current[phone] = iv;
                                } else {
                                  setPhoneState(phone, { sending: false, error: (json && (json.error || json.message)) || 'Failed to send OTP' });
                                }
                              } catch (e) {
                                console.error(e);
                                setPhoneState(phone, { sending: false, error: 'Network error sending OTP' });
                              }
                            }}
                            disabled={(phoneOtpState[String(formData.phone || '').trim()] || {}).countdown > 0}
                          >
                            {((phoneOtpState[String(formData.phone || '').trim()] || {}).sending) ? 'Sending...' : (((phoneOtpState[String(formData.phone || '').trim()] || {}).countdown || 0) > 0 ? `Resend in ${ (phoneOtpState[String(formData.phone || '').trim()] || {}).countdown }s` : 'Send OTP')}
                          </button>
                      </div>
                    </div>
                  ) : (
                    <div className="form-value">
                      <Phone size={16} />
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                  )}
                  {/* OTP entry shown when OTP was sent during editing */}
                  {isEditing && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                      <input type="text" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ width: 160 }} />
                      <button className="otp-verify-btn" onClick={async () => {
                        const phone = String(formData.phone || '').trim();
                        if (!phone || !otpCode) return setPhoneState(phone, { error: 'Enter phone and OTP' });
                        setPhoneState(phone, { verifying: true, error: null });
                        try {
                          const { res, json } = await apiFetch('/api/auth/phone/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, otp: otpCode }) });
                          if (res && res.ok) {
                            setPhoneState(phone, { verifying: false, success: 'Phone verified' });
                            // Refresh user context to pick up verified phone without full reload
                            try { await refreshUser(); } catch (e) { console.warn('refreshUser failed', e); }
                            // clear persisted expiry for this phone
                            try { const cur = readOtpExpiryMap(); delete cur[phone]; writeOtpExpiryMap(cur); } catch { /* ignore */ }
                            // clear any running timer
                            try { const iv = phoneTimerRefs.current[phone]; if (iv) { clearInterval(iv); delete phoneTimerRefs.current[phone]; } } catch { /* ignore */ }
                          } else {
                            setPhoneState(phone, { verifying: false, error: (json && (json.error || json.message)) || 'Failed to verify OTP' });
                          }
                        } catch (e) {
                          console.error(e);
                          setPhoneState(phone, { verifying: false, error: 'Network error verifying OTP' });
                        }
                      }} disabled={((phoneOtpState[String(formData.phone || '').trim()] || {}).verifying)}>{((phoneOtpState[String(formData.phone || '').trim()] || {}).verifying) ? 'Verifying...' : 'Verify'}</button>

                      {/* inline message for this phone */}
                      <div style={{ marginLeft: 8 }}>
                        {(() => {
                          const st = phoneOtpState[String(formData.phone || '').trim()] || {};
                          if (st.error) return <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{st.error}</div>;
                          if (st.success) return <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{st.success}</div>;
                          return null;
                        })()}
                      </div>
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
              {/* New Profile management: username, phones, github accounts */}
              <div className="profile-social-section" style={{ marginTop: '1rem' }}>
                <h3>Account & Verification</h3>
                <div style={{ marginTop: 12 }}>
                  <h4>GitHub accounts</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input id="gh-username" placeholder="github username" />
                    <button className="new-chat-btn" onClick={async () => {
                      const username = document.getElementById('gh-username').value.trim(); if (!username) return alert('Enter username');
                      try { const body = { githubAccounts: [{ username }] }; const { res } = await apiFetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (res && res.ok) { alert('Added'); window.location.reload(); } } catch (e) { console.error(e); }
                    }}>Add GitHub</button>
                  </div>
                  <ul>
                    {(user && user.githubAccounts && user.githubAccounts.length) ? user.githubAccounts.map((g, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <a href={g.url || `https://github.com/${g.username}`} target="_blank" rel="noreferrer">{g.username}</a>
                        <button className="refresh-btn" onClick={async () => { /* remove */ const keep = confirm('Remove this GitHub account?'); if (!keep) return; try { const remaining = (user.githubAccounts || []).filter(x => x.username !== g.username); const { res } = await apiFetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ githubAccounts: remaining }) }); if (res && res.ok) { window.location.reload(); } } catch (e) { console.error(e); } }}>Remove</button>
                      </li>
                    )) : <li className="muted">No GitHub accounts linked</li>}
                  </ul>
                </div>
              </div>

              {/* Code section: shared repos management */}
              <div style={{ marginTop: 18 }}>
                <h3>Code</h3>
                <div className="muted">Manage repositories you want to share on your profile</div>
                <div style={{ marginTop: 8 }}>
                  <button className="start-chat-btn" onClick={async () => { alert('Repo import from GitHub not implemented yet'); }}>Import from GitHub</button>
                </div>
                <ul style={{ marginTop: 8 }}>
                  {(user && user.sharedRepos && user.sharedRepos.length) ? user.sharedRepos.map((r, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
                      <label style={{ marginLeft: 'auto' }}>
                        <input type="checkbox" checked={!!r.shared} onChange={async (e) => {
                          try { r.shared = e.target.checked; const remaining = (user.sharedRepos || []).map(x => x); const { res } = await apiFetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharedRepos: remaining }) }); if (res && res.ok) { window.location.reload(); } } catch (e) { console.error(e); }
                        }} /> Share
                      </label>
                      <button className="refresh-btn" onClick={() => {
                        // Attempt to open in VSCode via 'vscode://file' is not allowed in browser; instruct user how to open
                        alert('To open in VSCode: clone the repo locally or use the future in-browser editor');
                      }}>Open in VSCode</button>
                    </li>
                  )) : <li className="muted">No repositories shared</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSidebar === 'chat' && (
          <div className="chat-layout" style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            <div className="chat-panel-wrapper" style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
              <div className="chat-center" style={{ width: '100%', maxWidth: '1080px', height: '100vh', margin: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderRadius: 0 }}>
                <ChatPanelInline apiFetch={apiFetch} openChatId={openChatId} user={user} />
              </div>
            </div>

            <aside className="profile-right-sidebar" aria-hidden="false" style={{ flex: '0 0 320px' }}>
              <div className="right-sidebar-search">
                <input value={sidebarQuery} onChange={(e) => setSidebarQuery(e.target.value)} type="search" className="right-search-input" placeholder="Search in chats..." aria-label="Search chats or users" />
              </div>

              <div className="right-sidebar-body">
                <div className="chat-list-small">
                  {(!chatsList || chatsList.length === 0) && <div className="muted">No conversations yet</div>}

                  {/* Inject pinned admin at top if present */}
                  {(pinnedAdmin) && (
                    <div key={pinnedAdmin._id || pinnedAdmin.id || 'pinned-admin'} className="chat-list-item pinned-admin">
                      <div className="chat-list-item-main">
                        <div className="chat-list-name">{pinnedAdmin.name || pinnedAdmin.email || 'Admin'}</div>
                        <div className="chat-list-meta muted">{pinnedAdmin.role || 'admin'}</div>
                      </div>
                      <div className="chat-list-actions">
                        <button className="open-chat-small" onClick={async () => {
                          try {
                            const pid = pinnedAdmin._id || pinnedAdmin.id;
                            const { res, json, body } = await apiFetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantIds: [pid] }) });
                            const payload = json || body || {};
                            const chat = payload.data || payload.chat || payload;
                            const cid = chat && (chat._id || chat.id);
                            if (res && res.ok && cid) {
                              setOpenChatId(cid);
                              fetchParticipants();
                            }
                          } catch (e) { console.error(e); }
                        }}>Open</button>
                      </div>
                    </div>
                  )}

                  {(() => {
                    // Build a deduplicated list: for 1:1 chats collapse multiple chats with same other participant
                    const map = new Map();
                    (chatsList || []).forEach(chat => {
                      const participants = chat.participants || [];
                      // compute a timestamp for ordering: prefer lastMessage.createdAt then updatedAt
                      // Prefer server-verified timestamp for ordering; fall back to createdAt then updatedAt
                        let lastMsg = 0;
                        if (chat.lastMessage) {
                          if (chat.lastMessage.verifiedAt) lastMsg = new Date(chat.lastMessage.verifiedAt).getTime();
                          else if (chat.lastMessage.createdAt) lastMsg = new Date(chat.lastMessage.createdAt).getTime();
                          else if (chat.lastMessage.timestamp) lastMsg = new Date(chat.lastMessage.timestamp).getTime();
                        }
                        const updated = chat.updatedAt ? new Date(chat.updatedAt).getTime() : 0;
                        const ts = Math.max(lastMsg || 0, updated || 0, 0);

                      if (participants.length === 2) {
                        const other = participants.find(p => String(p._id || p.id) !== String(user && user._id));
                        const key = other && (other._id || other.id) ? String(other._id || other.id) : ('chat_' + String(chat._id || chat.id));
                        const existing = map.get(key);
                        if (!existing || (ts > existing.ts)) {
                          map.set(key, { chat, ts });
                        }
                      } else {
                        // group chats keyed by chat id
                        const key = 'group_' + String(chat._id || chat.id);
                        map.set(key, { chat, ts });
                      }
                    });

                    // Build entries and sort by most-recent message time (robust fallback order)
                    const computeTs = (chat) => {
                      try {
                        let t = 0;
                        if (chat && chat.lastMessage) {
                          // prefer verifiedAt from the lastMessage, then createdAt, then other fields
                          const lm = chat.lastMessage;
                          const d = lm.verifiedAt || lm.createdAt || lm.timestamp || lm.at;
                          if (d) t = new Date(d).getTime();
                        }
                        if (!t && chat && Array.isArray(chat.messages) && chat.messages.length) {
                          const lm = chat.messages[chat.messages.length - 1];
                          const d2 = lm && (lm.verifiedAt || lm.createdAt || lm.timestamp || lm.at);
                          if (d2) t = new Date(d2).getTime();
                        }
                        if (!t && chat && chat.updatedAt) t = new Date(chat.updatedAt).getTime();
                        if (!t && chat && chat.createdAt) t = new Date(chat.createdAt).getTime();
                        return Number.isFinite(t) ? t : 0;
                      } catch { return 0; }
                    };

                    const entries = Array.from(map.values()).map(v => ({ chat: v.chat, ts: v.ts || computeTs(v.chat) }));
                    entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
                    let displayed = entries.map(e => e.chat);

                    // Apply sidebarQuery filter (case-insensitive) to displayed list
                    const q = (sidebarQuery || '').trim().toLowerCase();
                    if (q) {
                      displayed = displayed.filter(chat => {
                        const participants = chat.participants || [];
                        const others = participants.filter(p => String(p._id || p.id) !== String(user && user._id));
                        const names = others.map(o => ((o && (o.name || o.email || '')) + '').toLowerCase()).join(' ');
                        const subject = (chat.subject || '').toLowerCase();
                        const lastText = ((chat.lastMessage && chat.lastMessage.text) || '').toLowerCase();
                        return names.includes(q) || subject.includes(q) || lastText.includes(q) || String(chat._id || chat.id).includes(q);
                      });
                    }

                    // remove entries that will render as the generic fallback 'Conversation'
                    const computeTitle = (chat) => {
                      const participants = chat.participants || [];
                      const others = participants.filter(p => String(p._id || p.id) !== String(user && user._id));
                      if (chat.subject && chat.subject.trim()) return chat.subject;
                      if (others.length === 1) return (others[0].name || others[0].email || String(others[0]._id || others[0].id) || 'Conversation');
                      if (others.length > 1) return others.map(o => o.name || o.email || (o._id || o.id)).join(', ');
                      if (chat.lastMessage && chat.lastMessage.authorName) return chat.lastMessage.authorName;
                      return 'Conversation';
                    };

                    displayed = displayed.filter(chat => {
                      const t = (computeTitle(chat) || '').toLowerCase();
                      return t && t !== 'conversation';
                    });

                    return displayed.map(chat => {
                      // derive partner display name: for 1:1 chats show the other user; for group chats show subject
                      const participants = chat.participants || [];
                      const others = participants.filter(p => String(p._id || p.id) !== String(user && user._id));

                      // Prefer explicit subject for groups, otherwise try other user's name > email > id > lastMessage author
                      let title = 'Conversation';
                      if (chat.subject && chat.subject.trim()) title = chat.subject;
                      else if (others.length === 1) title = (others[0].name || others[0].email || String(others[0]._id || others[0].id) || 'Conversation');
                      else if (others.length > 1) title = others.map(o => o.name || o.email || (o._id || o.id)).join(', ');
                      else if (chat.lastMessage && chat.lastMessage.authorName) title = chat.lastMessage.authorName;

                      const lastMessageText = (chat.lastMessage && (chat.lastMessage.text || chat.lastMessage.body)) ? (chat.lastMessage.text || chat.lastMessage.body) : (chat.messages && chat.messages.length ? chat.messages[chat.messages.length -1].text : '');
                      const unread = chat.unreadCount || 0;

                      return (
                        <div key={chat._id || chat.id} className="chat-list-item" role="button" onClick={async () => {
                          try {
                            const cid = chat._id || chat.id;
                            setOpenChatId(cid);
                            // mark read for this chat
                            try { await apiFetch(`/api/chats/${cid}/read`, { method: 'POST' }); } catch { /* ignore */ }
                            fetchParticipants();
                          } catch (e) { console.error(e); }
                        }} style={{ cursor: 'pointer' }}>
                          <div className="chat-list-item-main">
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <div className="chat-avatar" style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', background: 'var(--avatar-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {others[0] && (others[0].avatar || others[0].image) ? (
                                  <img src={others[0].avatar || others[0].image} alt={(others[0].name || others[0].email) || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ color: 'white', fontSize: '0.9rem' }}>{(others[0] && (others[0].name || others[0].email) || 'U').slice(0,1).toUpperCase()}</div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="chat-list-name">{title}</div>
                                <div className="chat-list-meta muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastMessageText}</div>
                              </div>
                              {unread > 0 && <div className="unread-badge">{unread}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="right-sidebar-footer" style={{ position: 'relative' }}>
                <button className="start-chat-btn" onClick={() => setIsNewModalOpen(true)}>Start Chat</button>
              </div>

              {/* derive default users for the new-chat modal from recent chat participants */}
              <ChatNewModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                apiFetch={apiFetch}
                defaultUsers={(function(){
                  const map = {};
                  (chatsList || []).forEach(c => {
                    (c.participants || []).forEach(p => {
                      const id = p._id || p.id;
                      if (!id || String(id) === String(user && user._id)) return;
                      map[String(id)] = p;
                    });
                  });
                  return Object.values(map).slice(0,5);
                })()}
                pinnedAdmin={pinnedAdmin}
                onChatCreated={async (chatIdOrObj) => {
                  const cid = (typeof chatIdOrObj === 'string' || typeof chatIdOrObj === 'number') ? chatIdOrObj : (chatIdOrObj && (chatIdOrObj._id || chatIdOrObj.id));
                  if (cid) setOpenChatId(cid);
                  await fetchParticipants();
                }}
              />
            </aside>
          </div>
        )}
  </div>
    </motion.div>
  );
};

export default ProfilePage;