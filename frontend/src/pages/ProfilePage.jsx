
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Shield, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';
import '../components/ChatPanel.css';

// Inline chat panel component used in profile page
function ChatPanelInline() {
  const { token, user } = useAuth();
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const apiFetch = async (path, opts = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(url, { ...opts, headers });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : await res.text();
      return { res, body };
    } catch (err) {
      console.error('apiFetch error', err);
      return { res: null, err };
    }
  };

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const { res, body } = await apiFetch('/api/chats');
      if (res && res.ok) {
        const list = Array.isArray(body) ? body : (body.data || body.chats || []);
        setChats(list);
        if (!activeChatId && list[0]) setActiveChatId(list[0]._id || list[0].id);
      }
    } catch (err) { console.error(err); }
    setLoadingChats(false);
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    setLoadingMessages(true);
    try {
      const { res, body } = await apiFetch(`/api/chats/${chatId}`);
      if (res && res.ok) {
        const payload = body.data || body.chat || body;
        setMessages(payload.messages || payload || []);
      }
    } catch (err) { console.error(err); }
    setLoadingMessages(false);
  };

  useEffect(() => { fetchChats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchMessages is defined in this component; we intentionally omit it from deps to avoid recreating the effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeChatId) fetchMessages(activeChatId); else setMessages([]); }, [activeChatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    try {
      const { res } = await apiFetch(`/api/chats/${activeChatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage }) });
      if (res && res.ok) {
        setNewMessage('');
        await fetchMessages(activeChatId);
        await fetchChats();
      }
    } catch (err) { console.error(err); }
  };

  const handleSearchUsers = async (q) => {
    setSearchError('');
    setSearchResults([]);
    if (!q || q.trim().length < 1) return;
    try {
      const { res, body } = await apiFetch(`/api/users?search=${encodeURIComponent(q)}`);
      if (res && res.ok) {
        const list = Array.isArray(body) ? body : (body.users || body.data || []);
        setSearchResults(list);
      } else if (res && (res.status === 403 || res.status === 401)) {
        setSearchError('You do not have permission to search users.');
      } else {
        setSearchError('No users found or search not available.');
      }
    } catch (err) { console.error(err); setSearchError('Search failed'); }
  };

  const handleStartChatWithUser = async (otherUserId) => {
    try {
      const payload = { participantIds: [otherUserId] };
      const { res, body } = await apiFetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res && (res.ok || res.status === 201)) {
        const newChat = body.data || body.chat || body;
        await fetchChats();
        setActiveChatId(newChat._id || newChat.id);
        setShowNewChat(false);
      } else if (res && res.status === 403) {
        setSearchError('Not allowed to start chat with that user');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="chat-panel">
      <div className="chat-list">
        <div className="search-row">
          <Search size={16} />
          <input className="" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." onKeyDown={(e) => { if (e.key === 'Enter') handleSearchUsers(searchQuery); }} />
          <button onClick={() => handleSearchUsers(searchQuery)}>Go</button>
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={() => setShowNewChat(s => !s)} className="new-chat-btn">{showNewChat ? 'Close' : 'New Chat'}</button>
        </div>

        {showNewChat && (
          <div className="new-chat-area">
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {searchResults.length === 0 && <div className="muted">No results</div>}
              {searchResults.map(u => (
                <div key={u._id || u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.name || u.username || u.email}</div>
                    <div className="muted" style={{ fontSize: '0.85rem' }}>{u.email}</div>
                  </div>
                  <div>
                    <button onClick={() => handleStartChatWithUser(u._id || u.id)}>Chat</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input placeholder="Search users to start chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button onClick={() => handleSearchUsers(searchQuery)}>Search</button>
            </div>
            {searchError && <div className="muted" style={{ marginTop: 8 }}>{searchError}</div>}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <h4>Your Chats</h4>
          {loadingChats && <div className="muted">Loading...</div>}
          {!loadingChats && chats.length === 0 && <div className="muted">No chats yet</div>}
          <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}>
            {chats.map(c => (
              <div key={c._id || c.id} onClick={() => setActiveChatId(c._id || c.id)} className={`chat-item ${String(activeChatId) === String(c._id || c.id) ? 'active' : ''}`}>
                <div style={{ fontWeight: 700 }}>{c.subject || (c.participants && c.participants.map(p => p.name).join(', '))}</div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="conversation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Conversation</h4>
          <div>
            <button onClick={fetchChats} className="refresh-btn">Refresh</button>
          </div>
        </div>
        <div className="messages">
          {loadingMessages && <div className="muted">Loading messages...</div>}
          {!loadingMessages && messages.length === 0 && <div className="muted">Select a chat to view messages</div>}
          {messages.map(m => {
            const isMine = m.author && ((m.author._id && String(m.author._id) === String(user && user._id)) || (m.author === (user && user._id)));
            return (
              <div key={m._id || m.id} className="message-row">
                <div className="meta"><strong>{(m.author && (m.author.name || m.author.email)) || (m.authorName) || (m.author === (user && user._id) ? 'You' : 'User')}</strong> <span style={{ marginLeft: 8 }}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</span></div>
                <div className={`bubble ${isMine ? 'outgoing' : 'incoming'}`}>{m.text || m.content}</div>
              </div>
            );
          })}
        </div>

        <div className="composer">
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={handleSendMessage} className="send-btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfilePage = () => {
  const { user, updateProfile, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('profile');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      className="profile-page profile-admin-layout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-admin-sidebar">
        <div className="sidebar-header">
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
  <div className="profile-admin-main">
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
        )}

        {activeSidebar === 'chat' && (
          <div className="profile-chat-collab">
            <h2><MessageCircle size={22} style={{verticalAlign:'middle',marginRight:8}}/>Chat & Collaboration</h2>
            <p>Start a chat or collaborate with support/admins. Your conversations are private and secure.</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ flex: '0 0 30%', minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={18} />
                  <input style={{ flex: 1 }} placeholder="Search groups or users..." value={''} onChange={() => {}} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <h4>Your Chats</h4>
                  {/* placeholder: actual chat list is rendered in center/right in the expanded view below */}
                  <div className="muted">Use the collaboration panel to manage chats here.</div>
                </div>
              </div>

              <div style={{ flex: '1 1 50%', minWidth: 360 }}>
                {/* Embed the chat area inline so users don't need a modal */}
                <div className="chat-panel">
                  <ChatPanelInline />
                </div>
              </div>

              <div style={{ flex: '0 0 25%', minWidth: 220 }}>
                <h4>Quick Actions</h4>
                <p className="muted">Start a new conversation or search users to invite.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="new-chat-btn">New Chat</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;


