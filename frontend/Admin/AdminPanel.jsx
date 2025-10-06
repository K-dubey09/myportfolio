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

  // Enhanced file upload handler for GridFS storage
  const handleFileUpload = async (file, contentType = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', contentType);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        return result.fileUrl;
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
      const url = await handleFileUpload(file, 'profile');
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

  // Enhanced image upload handler with both file upload and URL options
  const handleImageUpload = async (event, contentType, fieldName, setFormFunction) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const imageUrl = await handleFileUpload(file, contentType);
      
      if (imageUrl) {
        setFormFunction(prev => ({ ...prev, [fieldName]: imageUrl }));
        showMessage('Image uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showMessage('Error uploading image', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to update contact status
  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showMessage(`Contact marked as ${newStatus}`, 'success');
        fetchData(); // Refresh data
      } else {
        showMessage('Failed to update contact status', 'error');
      }
    } catch (error) {
      console.error('Update contact error:', error);
      showMessage('Error updating contact status', 'error');
    }
  };

  // Helper functions
  const filterItems = (items, searchFields = []) => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || searchFields.some(field => {
        const fieldValue = item[field];
        if (!fieldValue) return false;
        
        // Handle arrays (like tags, technologies)
        if (Array.isArray(fieldValue)) {
          return fieldValue.some(val => 
            val && typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Handle strings
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        // Handle other types (convert to string)
        return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
      
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
          
          {/* File Upload Option */}
          <div style={{marginBottom: '10px'}}>
            <label style={{fontSize: '14px', color: '#666'}}>Upload File:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          
          {/* URL Input Option */}
          <div style={{marginBottom: '10px'}}>
            <label style={{fontSize: '14px', color: '#666'}}>Or Enter URL:</label>
            <input
              type="url"
              value={typeof profileForm.profilePicture === 'string' && profileForm.profilePicture.startsWith('http') ? profileForm.profilePicture : ''}
              onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })}
              className="form-input"
              placeholder="https://example.com/profile.jpg"
            />
          </div>
          
          {/* Image Preview */}
          {profileForm.profilePicture && (
            <div style={{marginTop: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Preview:</label>
              <img 
                src={profileForm.profilePicture} 
                alt="Profile Preview" 
                className="profile-preview"
                style={{ 
                  maxWidth: '150px', 
                  maxHeight: '150px', 
                  borderRadius: '50%', 
                  border: '3px solid #e2e8f0',
                  display: 'block',
                  marginTop: '5px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  showMessage('Invalid image URL or file', 'error');
                }}
              />
            </div>
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

  // Render Projects Tab
  const renderProjectsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Projects Management</h2>
        <div className="header-actions">
          {renderControls(['Web Development', 'Mobile App', 'AI/ML', 'E-commerce'])}
        </div>
      </div>
      
      <form onSubmit={projectHandlers.submit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Project Title</label>
            <input
              type="text"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Technologies</label>
            <input
              type="text"
              value={projectForm.technologies}
              onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
              className="form-input"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            className="form-input"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>GitHub URL</label>
            <input
              type="url"
              value={projectForm.githubUrl}
              onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Live URL</label>
            <input
              type="url"
              value={projectForm.liveUrl}
              onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project Image</label>
            
            {/* File Upload Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Upload File:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'project', 'imageUrl', setProjectForm)}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
            
            {/* URL Input Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Or Enter URL:</label>
              <input
                type="url"
                value={typeof projectForm.imageUrl === 'string' && projectForm.imageUrl.startsWith('http') ? projectForm.imageUrl : ''}
                onChange={(e) => setProjectForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="form-input"
                placeholder="https://example.com/project-image.jpg"
              />
            </div>
            
            {/* Image Preview */}
            {projectForm.imageUrl && (
              <div style={{marginTop: '10px'}}>
                <label style={{fontSize: '14px', color: '#666'}}>Preview:</label>
                <img 
                  src={projectForm.imageUrl} 
                  alt="Project Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px', 
                    border: '2px solid #e2e8f0',
                    display: 'block',
                    marginTop: '5px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showMessage('Invalid image URL or file', 'error');
                  }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={projectForm.featured}
                onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
              />
              Featured Project
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Project' : 'Add Project'}
          </button>
          {editingId && (
            <button type="button" onClick={projectHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.projects || [], ['title', 'technologies']).map((project) => (
          <div key={project._id || project.id} className="item-card">
            <div className="item-header">
              <h3>{project.title}</h3>
              {project.featured && <span className="featured-badge">Featured</span>}
            </div>
            <p className="item-description">{project.description}</p>
            <div className="item-meta">
              <span>Technologies: {project.technologies}</span>
            </div>
            <div className="item-actions">
              <button onClick={() => projectHandlers.edit(project)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => projectHandlers.delete(project._id || project.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Experience Tab
  const renderExperienceTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Experience Management</h2>
        <div className="header-actions">
          {renderControls(['Full-time', 'Part-time', 'Freelance', 'Internship'])}
        </div>
      </div>
      
      <form onSubmit={experienceHandlers.submit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={experienceForm.company}
              onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              value={experienceForm.position}
              onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={experienceForm.description}
            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
            className="form-input"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={experienceForm.startDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={experienceForm.endDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
              className="form-input"
              disabled={experienceForm.current}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={experienceForm.location}
              onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={experienceForm.type}
              onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
              className="form-input"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={experienceForm.current}
              onChange={(e) => setExperienceForm({ ...experienceForm, current: e.target.checked })}
            />
            Currently working here
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Experience' : 'Add Experience'}
          </button>
          {editingId && (
            <button type="button" onClick={experienceHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.experiences || [], ['company', 'position']).map((experience) => (
          <div key={experience._id || experience.id} className="item-card">
            <div className="item-header">
              <h3>{experience.position}</h3>
              <span className="company-name">{experience.company}</span>
            </div>
            <p className="item-description">{experience.description}</p>
            <div className="item-meta">
              <span>{experience.startDate} - {experience.current ? 'Present' : experience.endDate}</span>
              <span>{experience.type}</span>
            </div>
            <div className="item-actions">
              <button onClick={() => experienceHandlers.edit(experience)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => experienceHandlers.delete(experience._id || experience.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Education Tab
  const renderEducationTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Education Management</h2>
      </div>
      
      <form onSubmit={educationHandlers.submit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Institution</label>
            <input
              type="text"
              value={educationForm.institution}
              onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Degree</label>
            <input
              type="text"
              value={educationForm.degree}
              onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Field of Study</label>
            <input
              type="text"
              value={educationForm.field}
              onChange={(e) => setEducationForm({ ...educationForm, field: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>GPA</label>
            <input
              type="text"
              value={educationForm.gpa}
              onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={educationForm.startDate}
              onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={educationForm.endDate}
              onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
              className="form-input"
              disabled={educationForm.current}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={educationForm.current}
              onChange={(e) => setEducationForm({ ...educationForm, current: e.target.checked })}
            />
            Currently studying here
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Education' : 'Add Education'}
          </button>
          {editingId && (
            <button type="button" onClick={educationHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.education || [], ['institution', 'degree', 'field']).map((education) => (
          <div key={education._id || education.id} className="item-card">
            <div className="item-header">
              <h3>{education.degree}</h3>
              <span className="institution-name">{education.institution}</span>
            </div>
            <p className="item-description">{education.field}</p>
            <div className="item-meta">
              <span>{education.startDate} - {education.current ? 'Present' : education.endDate}</span>
              {education.gpa && <span>GPA: {education.gpa}</span>}
            </div>
            <div className="item-actions">
              <button onClick={() => educationHandlers.edit(education)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => educationHandlers.delete(education._id || education.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Blogs Tab
  const renderBlogsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Blog Management</h2>
        <div className="header-actions">
          {renderControls(['Technology', 'Tutorial', 'Personal', 'Business'])}
        </div>
      </div>
      
      <form onSubmit={blogHandlers.submit} className="admin-form">
        <div className="form-group">
          <label>Blog Title</label>
          <input
            type="text"
            value={blogForm.title}
            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Excerpt</label>
          <textarea
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
            className="form-input"
            rows="3"
            placeholder="Brief description of the blog post"
            required
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            value={blogForm.content}
            onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
            className="form-input"
            rows="8"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={blogForm.tags}
              onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
              className="form-input"
              placeholder="react, javascript, tutorial"
            />
          </div>
          <div className="form-group">
            <label>Read Time (minutes)</label>
            <input
              type="number"
              value={blogForm.readTime}
              onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cover Image</label>
            
            {/* File Upload Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Upload File:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'blog', 'coverImage', setBlogForm)}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
            
            {/* URL Input Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Or Enter URL:</label>
              <input
                type="url"
                value={typeof blogForm.coverImage === 'string' && blogForm.coverImage.startsWith('http') ? blogForm.coverImage : ''}
                onChange={(e) => setBlogForm(prev => ({ ...prev, coverImage: e.target.value }))}
                className="form-input"
                placeholder="https://example.com/cover-image.jpg"
              />
            </div>
            
            {/* Image Preview */}
            {blogForm.coverImage && (
              <div style={{marginTop: '10px'}}>
                <label style={{fontSize: '14px', color: '#666'}}>Preview:</label>
                <img 
                  src={blogForm.coverImage} 
                  alt="Cover Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px', 
                    border: '2px solid #e2e8f0',
                    display: 'block',
                    marginTop: '5px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showMessage('Invalid image URL or file', 'error');
                  }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={blogForm.status}
              onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
              className="form-input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={blogForm.featured}
              onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.checked })}
            />
            Featured Blog
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Blog' : 'Add Blog'}
          </button>
          {editingId && (
            <button type="button" onClick={blogHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.blogs || [], ['title', 'tags']).map((blog) => (
          <div key={blog._id || blog.id} className="item-card">
            <div className="item-header">
              <h3>{blog.title}</h3>
              <div className="badges">
                {blog.featured && <span className="featured-badge">Featured</span>}
                <span className={`status-badge ${blog.status}`}>{blog.status}</span>
              </div>
            </div>
            <p className="item-description">{blog.excerpt}</p>
            <div className="item-meta">
              <span>Read time: {blog.readTime} min</span>
              <span>Tags: {blog.tags}</span>
            </div>
            <div className="item-actions">
              <button onClick={() => blogHandlers.edit(blog)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => blogHandlers.delete(blog._id || blog.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Vlogs Tab
  const renderVlogsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Vlog Management</h2>
        <div className="header-actions">
          {renderControls(['YouTube', 'Vimeo', 'Instagram', 'TikTok'])}
        </div>
      </div>
      
      <form onSubmit={vlogHandlers.submit} className="admin-form">
        <div className="form-group">
          <label>Vlog Title</label>
          <input
            type="text"
            value={vlogForm.title}
            onChange={(e) => setVlogForm({ ...vlogForm, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={vlogForm.description}
            onChange={(e) => setVlogForm({ ...vlogForm, description: e.target.value })}
            className="form-input"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Video URL</label>
            <input
              type="url"
              value={vlogForm.videoUrl}
              onChange={(e) => setVlogForm({ ...vlogForm, videoUrl: e.target.value })}
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <div className="form-group">
            <label>Thumbnail</label>
            
            {/* File Upload Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Upload File:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'vlog', 'thumbnailUrl', setVlogForm)}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
            
            {/* URL Input Option */}
            <div style={{marginBottom: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Or Enter URL:</label>
              <input
                type="url"
                value={typeof vlogForm.thumbnailUrl === 'string' && vlogForm.thumbnailUrl.startsWith('http') ? vlogForm.thumbnailUrl : ''}
                onChange={(e) => setVlogForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                className="form-input"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            {/* Image Preview */}
            {vlogForm.thumbnailUrl && (
              <div style={{marginTop: '10px'}}>
                <label style={{fontSize: '14px', color: '#666'}}>Preview:</label>
                <img 
                  src={vlogForm.thumbnailUrl} 
                  alt="Thumbnail Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px', 
                    border: '2px solid #e2e8f0',
                    display: 'block',
                    marginTop: '5px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showMessage('Invalid image URL or file', 'error');
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              value={vlogForm.duration}
              onChange={(e) => setVlogForm({ ...vlogForm, duration: e.target.value })}
              className="form-input"
              placeholder="10:30"
            />
          </div>
          <div className="form-group">
            <label>Platform</label>
            <select
              value={vlogForm.platform}
              onChange={(e) => setVlogForm({ ...vlogForm, platform: e.target.value })}
              className="form-input"
            >
              <option value="YouTube">YouTube</option>
              <option value="Vimeo">Vimeo</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={vlogForm.tags}
              onChange={(e) => setVlogForm({ ...vlogForm, tags: e.target.value })}
              className="form-input"
              placeholder="web development, tutorial, coding"
            />
          </div>
          <div className="form-group">
            <label>Published Date</label>
            <input
              type="date"
              value={vlogForm.publishedDate}
              onChange={(e) => setVlogForm({ ...vlogForm, publishedDate: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={vlogForm.featured}
              onChange={(e) => setVlogForm({ ...vlogForm, featured: e.target.checked })}
            />
            Featured Vlog
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Vlog' : 'Add Vlog'}
          </button>
          {editingId && (
            <button type="button" onClick={vlogHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.vlogs || [], ['title', 'tags']).map((vlog) => (
          <div key={vlog._id || vlog.id} className="item-card">
            <div className="item-header">
              <h3>{vlog.title}</h3>
              <div className="badges">
                {vlog.featured && <span className="featured-badge">Featured</span>}
                <span className="platform-badge">{vlog.platform}</span>
              </div>
            </div>
            <p className="item-description">{vlog.description}</p>
            <div className="item-meta">
              <span>Duration: {vlog.duration}</span>
              <span>Platform: {vlog.platform}</span>
              <span>Published: {vlog.publishedDate}</span>
            </div>
            <div className="item-actions">
              <button onClick={() => vlogHandlers.edit(vlog)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => vlogHandlers.delete(vlog._id || vlog.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Gallery Tab
  const renderGalleryTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Gallery Management</h2>
        <div className="header-actions">
          {renderControls(['Travel', 'Work', 'Personal', 'Events'])}
        </div>
      </div>
      
      <form onSubmit={galleryHandlers.submit} className="admin-form">
        <div className="form-group">
          <label>Image Title</label>
          <input
            type="text"
            value={galleryForm.title}
            onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={galleryForm.description}
            onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
            className="form-input"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Image Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(e, 'gallery', 'imageUrl', setGalleryForm);
                }
              }}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Image URL (Alternative)</label>
            <input
              type="url"
              value={typeof galleryForm.imageUrl === 'string' && galleryForm.imageUrl.startsWith('http') ? galleryForm.imageUrl : ''}
              onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {galleryForm.imageUrl && (
          <div className="form-group">
            <label>Image Preview</label>
            <img 
              src={galleryForm.imageUrl} 
              alt="Preview" 
              style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '2px solid #e2e8f0' }}
              onError={(e) => {
                e.target.style.display = 'none';
                showMessage('Invalid image URL or file', 'error');
              }}
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              value={galleryForm.category}
              onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
              className="form-input"
            >
              <option value="Travel">Travel</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Events">Events</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={galleryForm.location}
              onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={galleryForm.date}
              onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={galleryForm.tags}
              onChange={(e) => setGalleryForm({ ...galleryForm, tags: e.target.value })}
              className="form-input"
              placeholder="nature, landscape, travel"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Image' : 'Add Image'}
          </button>
          {editingId && (
            <button type="button" onClick={galleryHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list gallery-grid">
        {filterItems(data?.gallery || [], ['title', 'tags', 'location']).map((image) => (
          <div key={image._id || image.id} className="gallery-item">
            <div className="gallery-image">
              <img src={image.imageUrl} alt={image.title} />
            </div>
            <div className="gallery-info">
              <h3>{image.title}</h3>
              <p>{image.description}</p>
              <div className="gallery-meta">
                <span>{image.category}</span>
                {image.location && <span>{image.location}</span>}
                {image.date && <span>{image.date}</span>}
              </div>
              <div className="item-actions">
                <button onClick={() => galleryHandlers.edit(image)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => galleryHandlers.delete(image._id || image.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Services Tab
  const renderServicesTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Services Management</h2>
        <div className="header-actions">
          {renderControls(['Web Development', 'Mobile App', 'Consulting', 'Design'])}
        </div>
      </div>
      
      <form onSubmit={serviceHandlers.submit} className="admin-form">
        <div className="form-group">
          <label>Service Title</label>
          <input
            type="text"
            value={serviceForm.title}
            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={serviceForm.description}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            className="form-input"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Icon (Emoji or Unicode)</label>
            <input
              type="text"
              value={serviceForm.icon}
              onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
              className="form-input"
              placeholder="💻 or fa-code"
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="text"
              value={serviceForm.price}
              onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
              className="form-input"
              placeholder="$500 - $2000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              value={serviceForm.duration}
              onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
              className="form-input"
              placeholder="2-4 weeks"
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={serviceForm.featured}
                onChange={(e) => setServiceForm({ ...serviceForm, featured: e.target.checked })}
              />
              Featured Service
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Service' : 'Add Service'}
          </button>
          {editingId && (
            <button type="button" onClick={serviceHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.services || [], ['title', 'description']).map((service) => (
          <div key={service._id || service.id} className="item-card service-card">
            <div className="item-header">
              <div className="service-icon">{service.icon}</div>
              <div>
                <h3>{service.title}</h3>
                {service.featured && <span className="featured-badge">Featured</span>}
              </div>
              <div className="service-price">{service.price}</div>
            </div>
            <p className="item-description">{service.description}</p>
            <div className="item-meta">
              {service.duration && <span>Duration: {service.duration}</span>}
            </div>
            <div className="item-actions">
              <button onClick={() => serviceHandlers.edit(service)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => serviceHandlers.delete(service._id || service.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Testimonials Tab
  const renderTestimonialsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Testimonials Management</h2>
      </div>
      
      <form onSubmit={testimonialHandlers.submit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              value={testimonialForm.name}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              value={testimonialForm.position}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, position: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={testimonialForm.company}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <select
              value={testimonialForm.rating}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
              className="form-input"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Testimonial Content</label>
          <textarea
            value={testimonialForm.content}
            onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
            className="form-input"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Profile Image Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(e, 'testimonial', 'imageUrl', setTestimonialForm);
                }
              }}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Image URL (Alternative)</label>
            <input
              type="url"
              value={typeof testimonialForm.imageUrl === 'string' && testimonialForm.imageUrl.startsWith('http') ? testimonialForm.imageUrl : ''}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, imageUrl: e.target.value })}
              className="form-input"
              placeholder="https://example.com/profile.jpg"
            />
          </div>
        </div>

        {testimonialForm.imageUrl && (
          <div className="form-group">
            <label>Image Preview</label>
            <img 
              src={testimonialForm.imageUrl} 
              alt="Preview" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
              onError={(e) => {
                e.target.style.display = 'none';
                showMessage('Invalid image URL or file', 'error');
              }}
            />
          </div>
        )}

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={testimonialForm.featured}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, featured: e.target.checked })}
            />
            Featured Testimonial
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Testimonial' : 'Add Testimonial'}
          </button>
          {editingId && (
            <button type="button" onClick={testimonialHandlers.cancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        {filterItems(data?.testimonials || [], ['name', 'company', 'content']).map((testimonial) => (
          <div key={testimonial._id || testimonial.id} className="item-card testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">
                {testimonial.imageUrl ? (
                  <img src={testimonial.imageUrl} alt={testimonial.name} />
                ) : (
                  <div className="avatar-placeholder">{testimonial.name.charAt(0)}</div>
                )}
              </div>
              <div className="testimonial-info">
                <h3>{testimonial.name}</h3>
                <p>{testimonial.position} at {testimonial.company}</p>
                <div className="rating">
                  {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                </div>
              </div>
              {testimonial.featured && <span className="featured-badge">Featured</span>}
            </div>
            <p className="testimonial-content">"{testimonial.content}"</p>
            <div className="item-actions">
              <button onClick={() => testimonialHandlers.edit(testimonial)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => testimonialHandlers.delete(testimonial._id || testimonial.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Contacts Tab
  const renderContactsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Contact Messages</h2>
        <div className="header-actions">
          {renderControls(['unread', 'read', 'replied', 'archived'])}
        </div>
      </div>

      <div className="items-list">
        {filterItems(data?.contacts || [], ['name', 'email', 'subject', 'message']).map((contact) => (
          <div key={contact._id || contact.id} className={`item-card contact-card ${contact.status}`}>
            <div className="contact-header">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p>{contact.email}</p>
                <p className="contact-subject">{contact.subject}</p>
              </div>
              <div className="contact-badges">
                <span className={`status-badge ${contact.status}`}>{contact.status}</span>
                <span className={`priority-badge ${contact.priority}`}>{contact.priority}</span>
              </div>
            </div>
            <div className="contact-message">
              <p>{contact.message}</p>
            </div>
            <div className="contact-meta">
              <span>Received: {new Date(contact.createdAt || Date.now()).toLocaleDateString()}</span>
              {contact.phone && <span>Phone: {contact.phone}</span>}
              {contact.company && <span>Company: {contact.company}</span>}
            </div>
            <div className="item-actions">
              <button 
                onClick={() => {
                  setContactForm(contact);
                  setEditingId(contact._id || contact.id);
                  setEditingType('contacts');
                }} 
                className="edit-btn"
              >
                Update Status
              </button>
              <select
                value={contact.status}
                onChange={(e) => updateContactStatus(contact._id || contact.id, e.target.value)}
                className="status-select"
                style={{marginLeft: '10px', padding: '5px'}}
              >
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <button onClick={() => contactHandlers.delete(contact._id || contact.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Status Update Modal */}
      {editingId && editingType === 'contacts' && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Contact Status</h3>
            <form onSubmit={contactHandlers.submit}>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                  className="form-input"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={contactForm.notes || ''}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Add internal notes..."
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Update Contact
                </button>
                <button type="button" onClick={contactHandlers.cancelEdit} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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