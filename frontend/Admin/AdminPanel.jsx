import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../src/context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Form states for all content types
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profilePicture: ''
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 'Beginner',
    category: 'Technical'
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    featured: false
  });

  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    type: 'Full-time',
    current: false
  });

  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    location: '',
    gpa: '',
    current: false
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    publishedDate: '',
    readTime: '',
    featured: false,
    status: 'draft',
    coverImage: ''
  });

  const [vlogForm, setVlogForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    publishedDate: '',
    tags: '',
    featured: false,
    platform: 'YouTube'
  });

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Travel',
    location: '',
    date: '',
    tags: ''
  });

  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    rating: 5,
    featured: false,
    imageUrl: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    status: 'unread',
    priority: 'normal'
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: '',
    price: '',
    duration: '',
    featured: false
  });

  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch portfolio data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const portfolioData = await response.json();
        setData(portfolioData);
        // Populate profile form with existing data
        if (portfolioData.profile) {
          setProfileForm(prev => ({ ...portfolioData.profile, ...prev }));
        }
      } else {
        console.error('Failed to fetch portfolio data');
        showMessage('Failed to load portfolio data', 'error');
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      showMessage('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchData]);

  // Show message function
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 5000);
  };

  // Generic API call handler
  const handleApiCall = async (url, method = 'GET', body = null) => {
    setIsSubmitting(true);
    try {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        // Handle tags and technologies as arrays
        if (body.tags && typeof body.tags === 'string') {
          body.tags = body.tags.split(',').map(t => t.trim()).filter(t => t);
        }
        if (body.technologies && typeof body.technologies === 'string') {
          body.technologies = body.technologies.split(',').map(t => t.trim()).filter(t => t);
        }
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, 'success');
        await fetchData();
        return true;
      } else {
        showMessage(result.error || 'Operation failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('API call error:', error);
      showMessage('Network error occurred', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        return result.url;
      } else {
        showMessage(result.error || 'Upload failed', 'error');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed', 'error');
      return null;
    }
  };

  // Profile handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await handleApiCall('http://localhost:5000/api/admin/profile', 'PUT', profileForm);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleFileUpload(file);
      if (url) {
        setProfileForm({ ...profileForm, profilePicture: url });
      }
    }
  };

  // Generic handlers for CRUD operations
  const createHandlers = (formState, setFormState, resetForm, endpoint) => ({
    submit: async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const url = editingId 
        ? `http://localhost:5000/api/admin/${endpoint}/${editingId}`
        : `http://localhost:5000/api/admin/${endpoint}`;
      
      const method = editingId ? 'PUT' : 'POST';
      const success = await handleApiCall(url, method, formState);
      
      if (success) {
        setFormState(resetForm);
        setEditingId(null);
        setEditingType(null);
        showMessage(`${endpoint.slice(0, -1)} ${editingId ? 'updated' : 'created'} successfully!`, 'success');
        
        // Scroll to top of form after submission
        setTimeout(() => {
          const formElement = document.querySelector('.admin-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    },
    edit: (item) => {
      setFormState(item);
      setEditingId(item.id);
      setEditingType(endpoint);
      
      // Scroll to form after setting editing state
      setTimeout(() => {
        const formElement = document.querySelector('.admin-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    delete: async (id) => {
      setShowDeleteConfirm(id);
    },
    confirmDelete: async (id) => {
      const success = await handleApiCall(`http://localhost:5000/api/admin/${endpoint}/${id}`, 'DELETE');
      if (success) {
        showMessage('Item deleted successfully!', 'success');
      }
      setShowDeleteConfirm(null);
    },
    cancelEdit: () => {
      setFormState(resetForm);
      setEditingId(null);
    }
  });

  // Create handlers for all content types
  const skillHandlers = createHandlers(
    skillForm, 
    setSkillForm, 
    { name: '', level: 'Beginner', category: 'Technical' },
    'skills'
  );

  const projectHandlers = createHandlers(
    projectForm,
    setProjectForm,
    { title: '', description: '', technologies: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false },
    'projects'
  );

  const experienceHandlers = createHandlers(
    experienceForm,
    setExperienceForm,
    { company: '', position: '', description: '', startDate: '', endDate: '', location: '', type: 'Full-time', current: false },
    'experiences'
  );

  const educationHandlers = createHandlers(
    educationForm,
    setEducationForm,
    { institution: '', degree: '', field: '', startDate: '', endDate: '', location: '', gpa: '', current: false },
    'education'
  );

  const blogHandlers = createHandlers(
    blogForm,
    setBlogForm,
    { title: '', excerpt: '', content: '', tags: '', publishedDate: '', readTime: '', featured: false, status: 'draft', coverImage: '' },
    'blogs'
  );

  const vlogHandlers = createHandlers(
    vlogForm,
    setVlogForm,
    { title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: '', publishedDate: '', tags: '', featured: false, platform: 'YouTube' },
    'vlogs'
  );

  const galleryHandlers = createHandlers(
    galleryForm,
    setGalleryForm,
    { title: '', description: '', imageUrl: '', category: 'Travel', location: '', date: '', tags: '' },
    'gallery'
  );

  const testimonialHandlers = createHandlers(
    testimonialForm,
    setTestimonialForm,
    { name: '', position: '', company: '', content: '', rating: 5, featured: false, imageUrl: '' },
    'testimonials'
  );

  const contactHandlers = createHandlers(
    contactForm,
    setContactForm,
    { name: '', email: '', subject: '', message: '', status: 'unread', priority: 'normal' },
    'contacts'
  );

  const serviceHandlers = createHandlers(
    serviceForm,
    setServiceForm,
    { title: '', description: '', icon: '', price: '', duration: '', featured: false },
    'services'
  );

  // Helper functions
  const filterItems = (items, searchFields = []) => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || searchFields.some(field => 
        item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  };



  // Render controls for search and filter
  const renderControls = (categories = []) => (
    <div className="controls-section">
      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {categories.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat, index) => (
            <option key={cat || `category-${index}`} value={cat}>{cat}</option>
          ))}
        </select>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading portfolio data...</div>
      </div>
    );
  }

  // Render Profile Tab
  const renderProfileTab = () => (
    <div className="tab-content">
      <h2>Profile Information</h2>
      <form onSubmit={handleProfileUpdate} className="admin-form">
        <div className="form-group">
          <label>Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="form-input"
          />
          {profileForm.profilePicture && (
            <img src={profileForm.profilePicture} alt="Profile" className="profile-preview" />
          )}
        </div>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profileForm.name || ''}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Professional Title</label>
          <input
            type="text"
            value={profileForm.title || ''}
            onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profileForm.email || ''}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileForm.phone || ''}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={profileForm.location || ''}
            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileForm.bio || ''}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            className="form-input"
            rows="5"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px', display: 'inline-block'}}></div>
              Updating Profile...
            </>
          ) : (
            'Update Profile'
          )}
        </button>
      </form>
    </div>
  );

  // Render Skills Tab
  const renderSkillsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Skills Management</h2>
        <div className="header-actions">
          {renderControls(['Technical', 'Soft Skills', 'Languages', 'Tools'])}
        </div>
      </div>
      
      <form onSubmit={skillHandlers.submit} className="admin-form">
        <div className="form-group">
          <label>Skill Name</label>
          <input
            type="text"
            value={skillForm.name}
            onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Level</label>
          <select
            value={skillForm.level}
            onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
            className="form-input"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={skillForm.category}
            onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
            className="form-input"
          >
            <option value="Technical">Technical</option>
            <option value="Soft Skills">Soft Skills</option>
            <option value="Languages">Languages</option>
            <option value="Tools">Tools</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px', display: 'inline-block'}}></div>
              {editingId ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            editingId ? 'Update Skill' : 'Add Skill'
          )}
        </button>
        {editingId && (
          <button 
            type="button" 
            onClick={skillHandlers.cancelEdit} 
            className="cancel-btn"
            style={{marginLeft: '10px'}}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="items-section">
        {!data?.skills || data.skills.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>
            {searchTerm || filterCategory !== 'all' ? 'No skills match your search criteria.' : 'No skills added yet.'}
          </div>
        ) : (
          <div className="items-grid">
            {filterItems(data?.skills || [], ['name', 'category', 'level']).map((skill, index) => (
              <div key={`skill-${skill.id || index}-${skill.name || 'unnamed'}`} className="item-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="item-info">
                  <h4>{skill.name}</h4>
                  <p><strong>Level:</strong> {skill.level} | <strong>Category:</strong> {skill.category}</p>
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => skillHandlers.edit(skill)} 
                    className="edit-btn"
                    title="Edit skill"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => skillHandlers.delete(skill.id)} 
                    className="delete-btn"
                    title="Delete skill"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      {/* Left Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Portfolio Admin</h2>
          <div className="status-indicator online"></div>
          <span className="status-text">Connected</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Content Management</h3>
            <button 
              className={activeTab === 'profile' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('profile')}
            >
              <span>👤</span> Profile
            </button>
            <button 
              className={activeTab === 'skills' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('skills')}
            >
              <span>⚡</span> Skills
            </button>
            <button 
              className={activeTab === 'projects' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('projects')}
            >
              <span>💼</span> Projects
            </button>
            <button 
              className={activeTab === 'experience' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('experience')}
            >
              <span>🏢</span> Experience
            </button>
            <button 
              className={activeTab === 'education' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('education')}
            >
              <span>🎓</span> Education
            </button>
          </div>
          
          <div className="nav-section">
            <h3>Content & Media</h3>
            <button 
              className={activeTab === 'blogs' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('blogs')}
            >
              <span>📝</span> Blogs
            </button>
            <button 
              className={activeTab === 'vlogs' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('vlogs')}
            >
              <span>🎥</span> Vlogs
            </button>
            <button 
              className={activeTab === 'gallery' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('gallery')}
            >
              <span>🖼️</span> Gallery
            </button>
          </div>
          
          <div className="nav-section">
            <h3>Business</h3>
            <button 
              className={activeTab === 'services' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('services')}
            >
              <span>🛠️</span> Services
            </button>
            <button 
              className={activeTab === 'testimonials' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('testimonials')}
            >
              <span>⭐</span> Testimonials
            </button>
            <button 
              className={activeTab === 'contacts' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('contacts')}
            >
              <span>📧</span> Contacts
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {message && (
          <div className={`message ${typeof message === 'object' ? message.type : (message.includes?.('error') || message.includes?.('failed') ? 'error' : 'success')}`}>
            {typeof message === 'object' ? message.text : message}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button 
                  onClick={() => {
                    if (editingType) {
                      const handlers = {
                        skills: skillHandlers,
                        projects: projectHandlers,
                        experiences: experienceHandlers,
                        education: educationHandlers,
                        blogs: blogHandlers,
                        vlogs: vlogHandlers,
                        gallery: galleryHandlers,
                        testimonials: testimonialHandlers,
                        contacts: contactHandlers,
                        services: serviceHandlers
                      };
                      handlers[editingType]?.confirmDelete(showDeleteConfirm);
                    }
                  }}
                  className="confirm-delete-btn"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="cancel-delete-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        <div className="admin-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'skills' && renderSkillsTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'experience' && renderExperienceTab()}
          {activeTab === 'education' && renderEducationTab()}
          {activeTab === 'blogs' && renderBlogsTab()}
          {activeTab === 'vlogs' && renderVlogsTab()}
          {activeTab === 'gallery' && renderGalleryTab()}
          {activeTab === 'services' && renderServicesTab()}
          {activeTab === 'testimonials' && renderTestimonialsTab()}
          {activeTab === 'contacts' && renderContactsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;