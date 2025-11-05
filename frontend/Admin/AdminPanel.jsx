import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../src/context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { getIdToken, logout } = useAuth();
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSubTab, setActiveSubTab] = useState('contactInfo');
  // Testimonials sub-tab state (split Add vs Manage)
  const [activeTestimonialsSubTab, setActiveTestimonialsSubTab] = useState('add');
  const [isLoading, setIsLoading] = useState(true);
  const [accessKeys, setAccessKeys] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [viewerEditorSubTab, setViewerEditorSubTab] = useState('manage-keys');
  const [veAnimate, setVeAnimate] = useState(false);
  const [genNotes, setGenNotes] = useState('');
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name-asc, name-desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editedRoles, setEditedRoles] = useState({}); // { userId: newRole }

  // Small helper to call backend and safely parse JSON (avoids trying to parse HTML pages)
  const apiFetch = useCallback(async (path, options = {}) => {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, options);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const json = await res.json();
      return { res, json };
    }
    // fallback: return text
    const text = await res.text();
    return { res, text };
  }, [API_BASE]);
  const [message, setMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Add/remove a body-level class so we can hide other page-level mobile close buttons
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isMobileMenuOpen) document.body.classList.add('admin-mobile-open');
      else document.body.classList.remove('admin-mobile-open');
    }
    // Broadcast an event so other components (like global Navigation) can react
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('admin-mobile-open', { detail: isMobileMenuOpen }));
      } catch {
        // ignore in older browsers
      }
    }

    return () => {
      if (typeof document !== 'undefined') document.body.classList.remove('admin-mobile-open');
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('admin-mobile-open', { detail: false }));
        } catch {
          // ignore
        }
      }
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Fetch Firebase ID token
  useEffect(() => {
    const fetchToken = async () => {
      const idToken = await getIdToken();
      setToken(idToken);
    };
    fetchToken();
  }, [getIdToken]);

  // Load access keys and conversions when admin opens panel or navigates to that tab
  // NOTE: moved the viewer-editor load effect below where the fetch helpers are declared

  const fetchAccessKeys = useCallback(async () => {
    try {
      const { res, json, text } = await apiFetch('/api/admin/access-keys', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchAccessKeys non-ok:', res.status, text || json);
        setAccessKeys([]);
        return;
      }
      // Handle backend response format { success, count, data: [] }
      const data = json.success ? (json.data || []) : (Array.isArray(json) ? json : []);
      setAccessKeys(data);
    } catch (e) { 
      console.error('fetchAccessKeys error:', e); 
      setAccessKeys([]);
    }
  }, [token, apiFetch]);

  const fetchAdminRequests = useCallback(async () => {
    try {
      const { res, json, text } = await apiFetch('/api/admin/requests', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchAdminRequests non-ok:', res.status, text || json);
        setAdminRequests([]);
        return;
      }
      // Handle backend response format { success, count, data: [] }
      const data = json.success ? (json.data || []) : (Array.isArray(json) ? json : []);
      setAdminRequests(data);
    } catch (e) { 
      console.error('fetchAdminRequests error:', e); 
      setAdminRequests([]);
    }
  }, [token, apiFetch]);

  const fetchConversions = useCallback(async () => {
    try {
      const { res, json, text } = await apiFetch('/api/admin/conversions', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchConversions non-ok:', res.status, text || json);
        setConversions([]);
        return;
      }
      // Handle backend response format { success, count, data: [] }
      const data = json.success ? (json.data || []) : (Array.isArray(json) ? json : []);
      setConversions(data);
    } catch (e) { 
      console.error('fetchConversions error:', e); 
      setConversions([]);
    }
  }, [token, apiFetch]);

  // Fetch users (admin)
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const { res, json, text } = await apiFetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res || !res.ok) {
        console.error('fetchUsers failed', res && res.status, text || json);
        setUsersList([]);
        return;
      }
      // Handle backend response format { success, count, data: [] }
      const data = Array.isArray(json) ? json : (json.data || json.users || []);
      setUsersList(data);
    } catch (e) { 
      console.error('fetchUsers error', e); 
      setUsersList([]); 
    } finally { 
      setUsersLoading(false); 
    }
  }, [token, apiFetch]);

  // Helper: apply filter, sort and pagination locally
  const applyUsersPipeline = (list) => {
    if (!Array.isArray(list)) return [];

    let out = [...list];

    // Role filter
    if (roleFilter && roleFilter !== 'all') {
      out = out.filter(u => (u.role || '').toLowerCase() === roleFilter.toLowerCase());
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      out = out.filter(u => (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term));
    }

    // Sort
    if (sortBy === 'newest') {
      out.sort((a,b) => new Date(b.createdAt || b.createdAt) - new Date(a.createdAt || a.createdAt));
    } else if (sortBy === 'oldest') {
      out.sort((a,b) => new Date(a.createdAt || a.createdAt) - new Date(b.createdAt || b.createdAt));
    } else if (sortBy === 'name-asc') {
      out.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      out.sort((a,b) => (b.name || '').localeCompare(a.name || ''));
    }

    // Pagination
    const total = out.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const paged = out.slice(start, start + pageSize);

    return { paged, total, totalPages, currentPage };
  };

  const handleLocalRoleChange = (userId, newRole) => {
    setEditedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const saveUserRole = async (userId) => {
    const newRole = editedRoles[userId];
    if (!newRole) return showMessage('No role change to save', 'error');
    const ok = await changeUserRole(userId, newRole);
    if (ok) {
      setEditedRoles(prev => { const p = { ...prev }; delete p[userId]; return p; });
    }
  };

  // Assign a generated userid (if backend supports) or use existing _id as fallback
  const assignUserId = async (userId) => {
    try {
      setIsSubmitting(true);
      // Ask backend to assign a userId (endpoint should handle generation). If not supported, fallback to using _id
      const { res, json, text } = await apiFetch(`/api/admin/users/${userId}/assign-id`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res || !res.ok) {
        console.error('assignUserId failed', res && res.status, text || json);
        showMessage('Failed to assign userid', 'error');
        return false;
      }
      showMessage('UserID assigned', 'success');
      await fetchUsers();
      return true;
    } catch (e) {
      console.error('assignUserId error', e);
      showMessage('Error assigning userid', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  // Helper to fetch achievements (used by admin tab)
  const fetchAchievements = useCallback(async () => {
    try {
      const result = await apiFetch('/api/achievements', { headers: { 'Authorization': `Bearer ${token}` } });
      const res = result.res;
      if (res && res.ok && result.json) {
        const payload = result.json;
        if (Array.isArray(payload)) setAchievementsList(payload);
        else if (payload.achievements) setAchievementsList(payload.achievements);
        else setAchievementsList(payload.data || []);
      }
    } catch (e) { console.error('fetchAchievements error', e); }
  }, [token, apiFetch]);

  // Load data when admin opens panel or navigates to that tab
  useEffect(() => {
    if (activeTab === 'viewer-editor') {
      fetchAccessKeys();
      fetchAdminRequests();
      fetchConversions();
    }
    if (activeTab === 'achievements') {
      fetchAchievements();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchAccessKeys, fetchAdminRequests, fetchConversions, fetchAchievements, fetchUsers]);

  const handleGenerateKey = async () => {
    try {
      const { res, json, text } = await apiFetch('/api/admin/access-keys', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: genNotes }) });
      if (!res.ok) {
        console.error('create key failed:', res.status, text || json);
        showMessage('Failed to create key', 'error');
        return;
      }
      if (json && json.success) {
        setAccessKeys(prev => [json.key, ...prev]);
        setGenNotes('');
        showMessage('Key generated', 'success');
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteKey = async (id) => {
    try {
      const { res, json, text } = await apiFetch(`/api/admin/access-keys/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('delete key failed:', res.status, text || json);
        showMessage('Failed to delete key', 'error');
        return;
      }
      setAccessKeys(prev => prev.filter(k => k.id !== id));
      showMessage('Key deleted', 'success');
    } catch (e) { console.error(e); }
  };

  const handleCopy = (key) => {
    try {
      navigator.clipboard.writeText(key);
      showMessage('Key copied to clipboard');
    } catch {
      showMessage('Copy failed', 'error');
    }
  };

  const handleRevertUser = async (userId) => {
    try {
      const { res, json, text } = await apiFetch(`/api/admin/revert-user/${userId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('revert user failed:', res.status, text || json);
        showMessage('Failed to revert user', 'error');
        return;
      }
      showMessage('User reverted to viewer', 'success');
      fetchConversions();
    } catch (e) { console.error(e); }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const { res, json, text } = await apiFetch(`/api/admin/requests/${requestId}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('approve request failed:', res.status, text || json);
        showMessage('Failed to approve request', 'error');
        return;
      }
      showMessage('Request approved and user promoted', 'success');
      fetchAdminRequests();
      fetchConversions();
    } catch (e) { console.error(e); }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { res, json, text } = await apiFetch(`/api/admin/requests/${requestId}/reject`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('reject request failed:', res.status, text || json);
        showMessage('Failed to reject request', 'error');
        return;
      }
      showMessage('Request rejected', 'success');
      fetchAdminRequests();
    } catch (e) { console.error(e); }
  };

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Trigger a small entrance animation for viewer->editor subnav buttons on mount
  useEffect(() => {
    // slight delay so CSS can pick up and animate
    const t = setTimeout(() => setVeAnimate(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Form states for all content types
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profilePicture: '',
    resume: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    professionalContacts: {
      github: '',
      gitlab: '',
      bitbucket: '',
      stackoverflow: '',
      leetcode: '',
      codepen: '',
      behance: '',
      dribbble: '',
      medium: '',
      devto: '',
      hashnode: '',
      website: '',
      portfolio: '',
      blog: '',
      resume: '',
      discord: '',
      slack: ''
    }
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 'beginner',
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
    coverImage: '',
    media: []
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
    imageUrls: [],
    category: 'Travel',
    location: '',
    date: '',
    tags: ''
  });

  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    position: '',
    company: '',
    message: '',
    rating: 5,
    featured: false,
    imageUrl: ''
  });

  // Multiple-file upload tracking for blog, vlog and gallery
  const [blogFilesUploading, setBlogFilesUploading] = useState(false);
  const [blogFileUrls, setBlogFileUrls] = useState([]);
  const [blogUploadProgress, setBlogUploadProgress] = useState([]);
  const [blogBatchFiles, setBlogBatchFiles] = useState([]); // { id, name, file, progress, status, url, xhr }

  const [vlogFilesUploading, setVlogFilesUploading] = useState(false);
  const [vlogFileUrls, setVlogFileUrls] = useState([]);
  const [vlogUploadProgress, setVlogUploadProgress] = useState([]);
  const [vlogBatchFiles, setVlogBatchFiles] = useState([]);

  const [galleryFilesUploading, setGalleryFilesUploading] = useState(false);
  const [galleryImageUrls, setGalleryImageUrls] = useState([]);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState([]);
  const [galleryBatchFiles, setGalleryBatchFiles] = useState([]);

  // Achievements form state
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    organization: '',
    number: '',
    unit: '',
    verificationUrl: ''
  });

  const [achievementsList, setAchievementsList] = useState([]);
  const [achievementEditingId, setAchievementEditingId] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    status: 'unread',
    priority: 'normal'
  });

  const [contactInfoForm, setContactInfoForm] = useState({
    email: '',
    phone: '',
    alternateEmail: '',
    alternatePhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    },
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      behance: '',
      dribbble: '',
      medium: '',
      devto: '',
      stackoverflow: '',
      discord: ''
    },
    website: '',
    resume: '',
    portfolio: '',
    preferredContactMethod: 'email',
    availability: 'available',
    responseTime: '24-48 hours',
    timezone: 'UTC',
    languages: [],
    callToAction: {
      title: 'Let\'s Work Together!',
      subtitle: 'Ready to bring your ideas to life? Get in touch!',
      buttonText: 'Contact Me'
    },
    displaySettings: {
      showEmail: true,
      showAddress: true,
      showPhone: true,
      showBusinessHours: true,
      showSocialLinks: true,
      showAvailability: true
    }
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
      // Wait for token if not available yet
      let authToken = token;
      if (!authToken) {
        authToken = await getIdToken();
        setToken(authToken);
      }

      if (!authToken) {
        console.error('No authentication token available');
        setIsLoading(false);
        return;
      }

      // Fetch all collections individually
      const endpoints = [
        'profile', 'skills', 'projects', 'experiences', 'education',
        'blogs', 'vlogs', 'gallery', 'testimonials', 'services',
        'achievements', 'contact-info', 'contacts'
      ];

      const headers = { 'Authorization': `Bearer ${authToken}` };
      const fetchPromises = endpoints.map(endpoint =>
        apiFetch(`/api/admin/${endpoint}`, { headers })
          .then(({ res, json }) => {
            if (res.ok && json && json.success) {
              return { [endpoint.replace('-', '')]: json.data };
            }
            return { [endpoint.replace('-', '')]: endpoint === 'profile' ? null : [] };
          })
          .catch(err => {
            console.error(`Error fetching ${endpoint}:`, err);
            return { [endpoint.replace('-', '')]: endpoint === 'profile' ? null : [] };
          })
      );

      const results = await Promise.all(fetchPromises);
      const portfolioData = Object.assign({}, ...results);
      
      setData(portfolioData);
      
      // Populate profile form with existing data
      if (portfolioData.profile) {
        setProfileForm(prev => ({ 
          ...prev,
          ...portfolioData.profile,
          socialLinks: {
            ...prev.socialLinks,
            ...portfolioData.profile.socialLinks
          },
          professionalContacts: {
            ...prev.professionalContacts,
            ...portfolioData.profile.professionalContacts
          }
        }));
      }
      
      // Populate contact info form with existing data
      if (portfolioData.contactinfo || portfolioData.contactInfo) {
        const contactData = portfolioData.contactinfo || portfolioData.contactInfo;
        setContactInfoForm(prev => ({ 
          ...prev, 
          ...contactData,
          address: {
            ...prev.address,
            ...contactData.address
          },
          businessHours: {
            ...prev.businessHours,
            ...contactData.businessHours
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      showMessage('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, apiFetch, getIdToken]);

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
      // Wait for token if not available yet
      let authToken = token;
      if (!authToken) {
        console.log('Token not available, fetching...');
        authToken = await getIdToken();
        setToken(authToken);
      }

      if (!authToken) {
        console.error('Failed to get authentication token');
        showMessage('Authentication token not available. Please login again.', 'error');
        return false;
      }

      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
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

      const fullUrl = url.startsWith('http') ? url.replace('http://localhost:5000', API_BASE) : url.replace(API_BASE, API_BASE);
      console.log('API Call:', { method, url: fullUrl, body });
      
      const response = await fetch(fullUrl, options);
      const result = await response.json();

      console.log('API Response:', { status: response.status, result });

      if (response.ok && result.success) {
        showMessage(result.message || 'Operation successful', 'success');
        await fetchData();
        return true;
      } else {
        console.error('API call failed:', result);
        if (result.errors && Array.isArray(result.errors)) {
          console.error('Validation errors:', result.errors);
          showMessage(`${result.error || 'Validation failed'}: ${result.errors.join(', ')}`, 'error');
        } else {
          showMessage(result.error || result.message || 'Operation failed', 'error');
        }
        return false;
      }
    } catch (error) {
      console.error('API call error:', error);
      showMessage('Network error occurred: ' + error.message, 'error');
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
      // Wait for token if not available yet
      let authToken = token;
      if (!authToken) {
        authToken = await getIdToken();
        setToken(authToken);
      }

      if (!authToken) {
        showMessage('Authentication token not available. Please login again.', 'error');
        return null;
      }

      const { res: response, json } = await apiFetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      console.log('Upload response:', { status: response.status, json });

      const result = json || {};
      if (response.ok && result.success) {
        // Backend returns: { success: true, data: { url, fileName, ... } }
        const uploadedUrl = result.data?.url || result.data?.publicUrl || result.fileUrl;
        console.log('Upload successful, URL:', uploadedUrl);
        return uploadedUrl;
      } else {
        console.error('Upload failed:', result);
        showMessage(result.error || result.message || 'Upload failed', 'error');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed: ' + error.message, 'error');
      return null;
    }
  };

  // Profile handlers - Always update existing profile (singleton pattern)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First, get the current profile to get its ID
      const { res: getRes, json: getJson } = await apiFetch('/api/admin/profile', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (!getRes.ok) {
        showMessage('Failed to fetch profile', 'error');
        setIsSubmitting(false);
        return;
      }
      
      const currentProfile = getJson.data;
      
      // ALWAYS update existing profile - never create new ones
      if (!currentProfile || !currentProfile.id) {
        // If no profile exists, create initial one using POST
        const { res, json } = await apiFetch('/api/admin/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileForm)
        });
        
        if (res.ok && json.success) {
          showMessage('Profile created successfully', 'success');
          await fetchData();
        } else {
          showMessage(json.error || 'Failed to create profile', 'error');
        }
      } else {
        // Update the existing single profile record
        const { res, json } = await apiFetch(`/api/admin/profile/${currentProfile.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileForm)
        });
        
        if (res.ok && json.success) {
          showMessage('Profile updated successfully', 'success');
          await fetchData(); // Refresh all data to reflect changes
        } else {
          showMessage(json.error || json.message || 'Failed to update profile', 'error');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('Network error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
        ? `${API_BASE}/api/admin/${endpoint}/${editingId}`
        : `${API_BASE}/api/admin/${endpoint}`;
      
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
      setEditingType(endpoint);
    },
    confirmDelete: async (id) => {
      const success = await handleApiCall(`${API_BASE}/api/admin/${endpoint}/${id}`, 'DELETE');
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

  const blogHandlers = {
    ...createHandlers(
      blogForm,
      setBlogForm,
      { title: '', excerpt: '', content: '', tags: '', publishedDate: '', readTime: '', featured: false, status: 'draft', coverImage: '', media: [] },
      'blogs'
    ),
    submit: async (e) => {
      e.preventDefault();

      if (blogFilesUploading) {
        showMessage('Please wait for blog files to finish uploading', 'error');
        return;
      }

      // Require at least one uploaded media OR cover image URL
      const hasUploadedMedia = Array.isArray(blogFileUrls) && blogFileUrls.length > 0;
      const hasCover = blogForm.coverImage && typeof blogForm.coverImage === 'string' && blogForm.coverImage.startsWith('http');
      if (!hasUploadedMedia && !hasCover) {
        showMessage('Please upload at least one media file or add a cover image before creating the blog post', 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = { ...blogForm, media: hasUploadedMedia ? blogFileUrls : (blogForm.media || []) };
        const url = editingId ? `${API_BASE}/api/admin/blogs/${editingId}` : `${API_BASE}/api/admin/blogs`;
        const method = editingId ? 'PUT' : 'POST';
        const success = await handleApiCall(url, method, payload);

        if (success) {
          setBlogForm({ title: '', excerpt: '', content: '', tags: '', publishedDate: '', readTime: '', featured: false, status: 'draft', coverImage: '', media: [] });
          setBlogFileUrls([]);
          setEditingId(null);
          setEditingType(null);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const vlogHandlers = {
    ...createHandlers(
      vlogForm,
      setVlogForm,
      { title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: '', publishedDate: '', tags: '', featured: false, platform: 'YouTube', videos: [] },
      'vlogs'
    ),
    submit: async (e) => {
      e.preventDefault();

      if (vlogFilesUploading) {
        showMessage('Please wait for vlog files to finish uploading', 'error');
        return;
      }

      const hasUploadedVideos = Array.isArray(vlogFileUrls) && vlogFileUrls.length > 0;
      const hasVideoUrl = vlogForm.videoUrl && typeof vlogForm.videoUrl === 'string' && vlogForm.videoUrl.startsWith('http');
      if (!hasUploadedVideos && !hasVideoUrl) {
        showMessage('Please upload at least one video file or provide a video URL before adding the vlog', 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = { ...vlogForm, videos: hasUploadedVideos ? vlogFileUrls : (vlogForm.videos || []) };
        const url = editingId ? `${API_BASE}/api/admin/vlogs/${editingId}` : `${API_BASE}/api/admin/vlogs`;
        const method = editingId ? 'PUT' : 'POST';
        const success = await handleApiCall(url, method, payload);

        if (success) {
          setVlogForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: '', publishedDate: '', tags: '', featured: false, platform: 'YouTube', videos: [] });
          setVlogFileUrls([]);
          setEditingId(null);
          setEditingType(null);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const galleryHandlers = {
    ...createHandlers(
      galleryForm,
      setGalleryForm,
      { title: '', description: '', imageUrl: '', imageUrls: [], category: 'Travel', location: '', date: '', tags: '' },
      'gallery'
    ),
    submit: async (e) => {
      e.preventDefault();
      // Accept either one-or-more uploaded image URLs OR a single imageUrl field
      if (galleryFilesUploading) {
        showMessage('Please wait for gallery uploads to finish', 'error');
        return;
      }

      const hasUploaded = Array.isArray(galleryImageUrls) && galleryImageUrls.length > 0;
      const hasSingle = galleryForm.imageUrl && typeof galleryForm.imageUrl === 'string' && galleryForm.imageUrl.startsWith('http');
      if (!hasUploaded && !hasSingle) {
        showMessage('Please upload at least one image or provide an image URL before adding to gallery', 'error');
        return;
      }

      setIsSubmitting(true);
      const payload = { ...galleryForm, imageUrls: hasUploaded ? galleryImageUrls : (galleryForm.imageUrls || (galleryForm.imageUrl ? [galleryForm.imageUrl] : [])) };
      const url = editingId ? `${API_BASE}/api/admin/gallery/${editingId}` : `${API_BASE}/api/admin/gallery`;
      const method = editingId ? 'PUT' : 'POST';
      const success = await handleApiCall(url, method, payload);
      
      if (success) {
        setGalleryForm({ title: '', description: '', imageUrl: '', imageUrls: [], category: 'Travel', location: '', date: '', tags: '' });
        setGalleryImageUrls([]);
        setEditingId(null);
        setEditingType(null);
        showMessage(`Gallery item ${editingId ? 'updated' : 'created'} successfully!`, 'success');
        
        setTimeout(() => {
          const formElement = document.querySelector('.admin-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const testimonialHandlers = createHandlers(
    testimonialForm,
    setTestimonialForm,
    { name: '', position: '', company: '', message: '', rating: 5, featured: false, imageUrl: '' },
    'testimonials'
  );

  // Admin-side testimonials list and helpers (for Manage view)
  const [adminTestimonials, setAdminTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialsPage, setTestimonialsPage] = useState(1);
  const [testimonialsPageSize, setTestimonialsPageSize] = useState(10);

  const fetchAdminTestimonials = useCallback(async () => {
    try {
      setTestimonialsLoading(true);
      const { res, json, text } = await apiFetch('/api/admin/testimonials', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchAdminTestimonials non-ok:', res.status, text || json);
        showMessage('Failed to load testimonials', 'error');
        return;
      }
      // Some endpoints return { data: [...] } and some return raw array
      const items = (json && (json.data || json)) || [];
      setAdminTestimonials(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error('fetchAdminTestimonials error', e);
      showMessage('Failed to load testimonials', 'error');
    } finally {
      setTestimonialsLoading(false);
    }
  }, [apiFetch, token]);

  // Refresh admin testimonials when opening Manage tab or when token changes
  useEffect(() => {
    if (activeTestimonialsSubTab === 'manage') fetchAdminTestimonials();
  }, [activeTestimonialsSubTab, fetchAdminTestimonials]);

  // Override some testimonial handlers to refresh admin list after changes
  (function enhanceTestimonialHandlers() {
    const origEdit = testimonialHandlers.edit;
    const origSubmit = testimonialHandlers.submit;
    // Wrap edit to also open add tab
    testimonialHandlers.edit = (item) => {
      origEdit(item);
      setActiveTestimonialsSubTab('add');
    };

    // Wrap submit to refresh admin list after successful submit
    testimonialHandlers.submit = async (e) => {
      await origSubmit(e);
      // refresh list if visible
      if (activeTestimonialsSubTab === 'manage') await fetchAdminTestimonials();
    };

    // Replace confirmDelete to call API directly and refresh admin list
    testimonialHandlers.confirmDelete = async (id) => {
      try {
        const success = await handleApiCall(`${API_BASE}/api/admin/testimonials/${id}`, 'DELETE');
        if (success) {
          await fetchAdminTestimonials();
        }
      } catch (err) {
        console.error('confirmDelete testimonial error', err);
        showMessage('Failed to delete testimonial', 'error');
      } finally {
        setShowDeleteConfirm(null);
      }
    };
  }());

  // Toggle boolean fields (featured / approved) on a testimonial
  const toggleTestimonialFlag = async (id, updates) => {
    try {
      setIsSubmitting(true);
      const { res, json, text } = await apiFetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        console.error('toggleTestimonialFlag failed', res.status, text || json);
        showMessage('Failed to update testimonial', 'error');
        return;
      }
      showMessage('Testimonial updated', 'success');
      await fetchAdminTestimonials();
    } catch (err) {
      console.error(err);
      showMessage('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactHandlers = createHandlers(
    contactForm,
    setContactForm,
    { name: '', email: '', subject: '', message: '', status: 'unread', priority: 'normal' },
    'contacts'
  );

  const contactInfoHandlers = {
    submit: async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Check if contact info already exists
      const existingContactInfo = data?.contactinfo;
      const url = existingContactInfo 
        ? `${API_BASE}/api/admin/contact-info/${existingContactInfo.id}`
        : `${API_BASE}/api/admin/contact-info`;
      
      const method = existingContactInfo ? 'PUT' : 'POST';
      const success = await handleApiCall(url, method, contactInfoForm);
      
      if (success) {
        showMessage(`Contact information ${existingContactInfo ? 'updated' : 'created'} successfully!`, 'success');
        
        // Scroll to top of form after submission
        setTimeout(() => {
          const formElement = document.querySelector('.admin-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const serviceHandlers = createHandlers(
    serviceForm,
    setServiceForm,
    { title: '', description: '', icon: '', price: '', duration: '', featured: false },
    'services'
  );

  // ==================== FEATURED CONTENT HANDLERS ====================
  const handleToggleFeatured = async (collection, itemId, currentFeaturedStatus) => {
    try {
      const endpoint = currentFeaturedStatus ? 'unfeature' : 'feature';
      const url = `${API_BASE}/api/admin/${collection}/${itemId}/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage(`Item ${currentFeaturedStatus ? 'unfeatured' : 'featured'} successfully!`, 'success');
        await fetchData(); // Reload data
        return true;
      } else {
        const error = await response.json();
        showMessage(error.message || 'Failed to toggle featured status', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showMessage('Error: ' + error.message, 'error');
      return false;
    }
  };

  const handleResetFeatured = async (collection) => {
    if (!confirm(`Are you sure you want to unfeature ALL items in ${collection}? This cannot be undone.`)) {
      return;
    }

    try {
      const url = `${API_BASE}/api/admin/${collection}/reset-featured`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(result.message || 'All featured items reset successfully!', 'success');
        await fetchData(); // Reload data
        return true;
      } else {
        const error = await response.json();
        showMessage(error.message || 'Failed to reset featured items', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error resetting featured items:', error);
      showMessage('Error: ' + error.message, 'error');
      return false;
    }
  };

  // Enhanced image upload handler with both file upload and URL options
  const handleImageUpload = async (event, contentType, fieldName, setFormFunction) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      console.log('Starting image upload:', { fileName: file.name, size: file.size, type: file.type, contentType });
      
      const imageUrl = await handleFileUpload(file, contentType);
      
      if (imageUrl) {
        console.log('Image uploaded successfully, setting URL:', imageUrl);
        setFormFunction(prev => ({ ...prev, [fieldName]: imageUrl }));
        showMessage('Image uploaded successfully!', 'success');
      } else {
        console.error('Image upload returned null URL');
        showMessage('Error: Upload failed to return URL', 'error');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showMessage('Error uploading image: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload multiple files (sequentially) and collect URLs
  const handleMultipleFileUpload = async (event, contentType, setUrls, setUploading) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // declare progress setter outside try so finally can clear it
    let setProgressSetter = null;
    try {
      setUploading(true);
      const uploaded = [];
      // initialize progress array for this batch
      if (setUploading === setBlogFilesUploading) setProgressSetter = setBlogUploadProgress;
      else if (setUploading === setVlogFilesUploading) setProgressSetter = setVlogUploadProgress;
      else if (setUploading === setGalleryFilesUploading) setProgressSetter = setGalleryUploadProgress;

      if (setProgressSetter) setProgressSetter(Array(files.length).fill(0));

      // create batch entries so UI can show per-file progress and allow cancel/remove
      const batchEntries = files.map((f, i) => ({ id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}_${i}`, name: f.name, file: f, progress: 0, status: 'queued', url: null, xhr: null }));
      if (setUploading === setBlogFilesUploading) setBlogBatchFiles(batchEntries);
      else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(batchEntries);
      else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(batchEntries);

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const entryId = batchEntries[idx].id;

        // mark uploading
        if (setUploading === setBlogFilesUploading) setBlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploading' } : p));
        else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploading' } : p));
        else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploading' } : p));

        // upload with progress callback and registerXhr to store xhr on the batch entry for cancellation
        const url = await uploadFileWithProgress(file, contentType, (percent) => {
          // update both progress array and batch entry
          if (setProgressSetter) setProgressSetter(prev => {
            const next = Array.isArray(prev) ? [...prev] : Array(files.length).fill(0);
            next[idx] = percent;
            return next;
          });

          if (setUploading === setBlogFilesUploading) setBlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, progress: percent } : p));
          else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, progress: percent } : p));
          else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, progress: percent } : p));
        }, (xhr) => {
          // register xhr so we can abort later
          if (setUploading === setBlogFilesUploading) setBlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, xhr } : p));
          else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, xhr } : p));
          else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, xhr } : p));
        });

        if (url) {
          uploaded.push(url);
          // mark uploaded in batch
          if (setUploading === setBlogFilesUploading) setBlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploaded', url } : p));
          else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploaded', url } : p));
          else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'uploaded', url } : p));
        } else {
          // mark failed
          if (setUploading === setBlogFilesUploading) setBlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'failed' } : p));
          else if (setUploading === setVlogFilesUploading) setVlogBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'failed' } : p));
          else if (setUploading === setGalleryFilesUploading) setGalleryBatchFiles(prev => prev.map(p => p.id === entryId ? { ...p, status: 'failed' } : p));
          showMessage(`Failed to upload ${file.name}`, 'error');
        }
      }

      if (uploaded.length) {
        setUrls(prev => [ ...(prev || []), ...uploaded ]);
        showMessage(`${uploaded.length} file(s) uploaded`, 'success');
      }
    } catch (err) {
      console.error('Multiple upload error', err);
      showMessage('Error uploading files', 'error');
    } finally {
      setUploading(false);
      // clear progress indicators after finishing
      if (setProgressSetter) setProgressSetter([]);
    }
  };

  // Remove / cancel a file from the current batch (before submit)
  const handleRemoveBatchFile = (section, id) => {
    try {
      if (section === 'blog') {
        const entry = blogBatchFiles.find(b => b.id === id);
        if (!entry) return;
        if (entry.xhr && entry.status === 'uploading') {
          try { entry.xhr.abort(); } catch (e) { console.error('abort error', e); }
        }
        setBlogBatchFiles(prev => prev.filter(p => p.id !== id));
        if (entry.status === 'uploaded' && entry.url) {
          setBlogFileUrls(prev => (Array.isArray(prev) ? prev.filter(u => u !== entry.url) : []));
        }
      } else if (section === 'vlog') {
        const entry = vlogBatchFiles.find(b => b.id === id);
        if (!entry) return;
        if (entry.xhr && entry.status === 'uploading') {
          try { entry.xhr.abort(); } catch (e) { console.error('abort error', e); }
        }
        setVlogBatchFiles(prev => prev.filter(p => p.id !== id));
        if (entry.status === 'uploaded' && entry.url) {
          setVlogFileUrls(prev => (Array.isArray(prev) ? prev.filter(u => u !== entry.url) : []));
        }
      } else if (section === 'gallery') {
        const entry = galleryBatchFiles.find(b => b.id === id);
        if (!entry) return;
        if (entry.xhr && entry.status === 'uploading') {
          try { entry.xhr.abort(); } catch (e) { console.error('abort error', e); }
        }
        setGalleryBatchFiles(prev => prev.filter(p => p.id !== id));
        if (entry.status === 'uploaded' && entry.url) {
          setGalleryImageUrls(prev => (Array.isArray(prev) ? prev.filter(u => u !== entry.url) : []));
        }
      }
    } catch (err) { console.error('handleRemoveBatchFile error', err); }
  };

  // Upload a single file using XHR to obtain progress events
  const uploadFileWithProgress = (file, contentType, onProgress, registerXhr) => {
    return new Promise((resolve) => {
      (async () => {
        try {
          let authToken = token;
          if (!authToken) {
            authToken = await getIdToken();
            setToken(authToken);
          }

          const xhr = new XMLHttpRequest();
          const fd = new FormData();
          fd.append('file', file);
          fd.append('category', contentType);

          xhr.open('POST', `${API_BASE}/api/upload`);
          if (authToken) xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              if (onProgress) {
                try {
                  onProgress(percent);
                } catch (err) {
                  console.error('onProgress callback error', err);
                }
              }
            }
          };

          // allow caller to store xhr for possible abort/cancel
          try {
            if (registerXhr && typeof registerXhr === 'function') registerXhr(xhr);
          } catch (err) { console.error('registerXhr error', err); }

          xhr.onload = () => {
            try {
              const res = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300 && res && res.success) {
                const url = res.data?.url || res.data?.publicUrl || res.fileUrl;
                resolve(url || null);
              } else {
                console.error('Upload failed', res);
                resolve(null);
              }
            } catch (err) {
              console.error('Upload parse error', err);
              resolve(null);
            }
          };

          xhr.onerror = () => {
            console.error('Upload network error');
            resolve(null);
          };
          xhr.send(fd);
        } catch (err) {
          console.error('uploadFileWithProgress error', err);
          resolve(null);
        }
      })();
    });
  };

  // Helper function to update contact status
  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const { res: response, json, text } = await apiFetch(`/api/admin/contacts/${contactId}`, {
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
        console.error('updateContactStatus failed', response.status, text || json);
        showMessage('Failed to update contact status', 'error');
      }
    } catch (error) {
      console.error('Update contact error:', error);
      showMessage('Error updating contact status', 'error');
    }
  };

  // Refresh contacts specifically
  const refreshContacts = async () => {
    try {
      setIsLoading(true);
      const { res: response, json, text } = await apiFetch('/api/contacts', { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.ok) {
        const contacts = (json && json.data) || json || [];
        setData(prev => ({ ...prev, contacts }));
        showMessage('Contacts refreshed successfully', 'success');
      } else {
        console.error('refreshContacts failed', response.status, text || json);
        showMessage('Failed to refresh contacts', 'error');
      }
    } catch (error) {
      console.error('Refresh contacts error:', error);
      showMessage('Error refreshing contacts', 'error');
    } finally {
      setIsLoading(false);
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
      <div className="tab-header">
        <h2>Profile Information</h2>
        <p>Manage your personal and professional profile information</p>
      </div>
      
      <form onSubmit={handleProfileUpdate} className="admin-form profile-form">
        {/* Profile Picture Section */}
        <div className="form-section">
          <h3>Profile Picture</h3>
          <div className="profile-picture-container">
            
            {/* Circular Preview */}
            <div className="profile-preview-container">
              {profileForm.profilePicture ? (
                <img 
                  src={profileForm.profilePicture} 
                  alt="Profile Preview" 
                  className="profile-preview-circular"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showMessage('Invalid image URL or file', 'error');
                  }}
                />
              ) : (
                <div className="profile-preview-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>No Image</span>
                </div>
              )}
            </div>
            
            {/* Upload Controls */}
            <div className="profile-upload-controls">
              <div className="form-group">
                <label>Profile Picture</label>
                
                {/* File Upload Option */}
                <div className="upload-option">
                  <label className="upload-label">Upload File:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="form-input file-input"
                    disabled={isSubmitting}
                  />
                </div>
                
                {/* URL Input Option */}
                <div className="upload-option">
                  <label className="upload-label">Or Enter URL:</label>
                  <input
                    type="url"
                    value={typeof profileForm.profilePicture === 'string' && profileForm.profilePicture.startsWith('http') ? profileForm.profilePicture : ''}
                    onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })}
                    className="form-input"
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={profileForm.name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="form-input"
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Professional Title *</label>
              <input
                type="text"
                value={profileForm.title || ''}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="form-input"
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={profileForm.email || ''}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="form-input"
                placeholder="your.email@example.com"
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
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profileForm.location || ''}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              className="form-input"
              placeholder="City, State/Country"
            />
          </div>

          <div className="form-group">
            <label>Professional Bio *</label>
            <textarea
              value={profileForm.bio || ''}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="form-input"
              rows="5"
              placeholder="Tell us about yourself, your experience, and what drives your passion for technology..."
              required
            />
          </div>

          <div className="form-group">
            <label>Resume URL</label>
            <input
              type="url"
              value={profileForm.resume || ''}
              onChange={(e) => setProfileForm({ ...profileForm, resume: e.target.value })}
              className="form-input"
              placeholder="https://example.com/resume.pdf"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="form-section">
          <h3>Social Media Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={profileForm.socialLinks?.linkedin || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value }
                })}
                className="form-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={profileForm.socialLinks?.github || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, github: e.target.value }
                })}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                value={profileForm.socialLinks?.twitter || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                })}
                className="form-input"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input
                type="url"
                value={profileForm.socialLinks?.instagram || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, instagram: e.target.value }
                })}
                className="form-input"
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>YouTube</label>
            <input
              type="url"
              value={profileForm.socialLinks?.youtube || ''}
              onChange={(e) => setProfileForm({ 
                ...profileForm, 
                socialLinks: { ...profileForm.socialLinks, youtube: e.target.value }
              })}
              className="form-input"
              placeholder="https://youtube.com/c/username"
            />
          </div>
        </div>

        {/* Professional Platforms */}
        <div className="form-section">
          <h3>Professional Platforms</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Portfolio Website</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.portfolio || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, portfolio: e.target.value }
                })}
                className="form-input"
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className="form-group">
              <label>Personal Website</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.website || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, website: e.target.value }
                })}
                className="form-input"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Blog</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.blog || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, blog: e.target.value }
                })}
                className="form-input"
                placeholder="https://yourblog.com"
              />
            </div>
            <div className="form-group">
              <label>Stack Overflow</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.stackoverflow || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, stackoverflow: e.target.value }
                })}
                className="form-input"
                placeholder="https://stackoverflow.com/users/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>LeetCode</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.leetcode || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, leetcode: e.target.value }
                })}
                className="form-input"
                placeholder="https://leetcode.com/username"
              />
            </div>
            <div className="form-group">
              <label>CodePen</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.codepen || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, codepen: e.target.value }
                })}
                className="form-input"
                placeholder="https://codepen.io/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GitLab</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.gitlab || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, gitlab: e.target.value }
                })}
                className="form-input"
                placeholder="https://gitlab.com/username"
              />
            </div>
            <div className="form-group">
              <label>Bitbucket</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.bitbucket || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, bitbucket: e.target.value }
                })}
                className="form-input"
                placeholder="https://bitbucket.org/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Medium</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.medium || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, medium: e.target.value }
                })}
                className="form-input"
                placeholder="https://medium.com/@username"
              />
            </div>
            <div className="form-group">
              <label>Dev.to</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.devto || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, devto: e.target.value }
                })}
                className="form-input"
                placeholder="https://dev.to/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hashnode</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.hashnode || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, hashnode: e.target.value }
                })}
                className="form-input"
                placeholder="https://hashnode.com/@username"
              />
            </div>
            <div className="form-group">
              <label>Behance</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.behance || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, behance: e.target.value }
                })}
                className="form-input"
                placeholder="https://behance.net/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dribbble</label>
              <input
                type="url"
                value={profileForm.professionalContacts?.dribbble || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, dribbble: e.target.value }
                })}
                className="form-input"
                placeholder="https://dribbble.com/username"
              />
            </div>
            <div className="form-group">
              <label>Discord</label>
              <input
                type="text"
                value={profileForm.professionalContacts?.discord || ''}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  professionalContacts: { ...profileForm.professionalContacts, discord: e.target.value }
                })}
                className="form-input"
                placeholder="username#1234"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Slack</label>
            <input
              type="text"
              value={profileForm.professionalContacts?.slack || ''}
              onChange={(e) => setProfileForm({ 
                ...profileForm, 
                professionalContacts: { ...profileForm.professionalContacts, slack: e.target.value }
              })}
              className="form-input"
              placeholder="@username"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px', display: 'inline-block'}}></div>
                Updating Profile...
              </>
            ) : (
              <>
                💾 Update Profile
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="submit-btn secondary" 
            onClick={fetchData}
            disabled={isSubmitting}
            title="Refresh data from database"
          >
            🔄 Refresh Data
          </button>
          
          <button 
            type="button" 
            className="submit-btn secondary" 
            onClick={() => setProfileForm({
              name: '',
              title: '',
              bio: '',
              email: '',
              phone: '',
              location: '',
              profilePicture: '',
              resume: '',
              socialLinks: {
                linkedin: '',
                github: '',
                twitter: '',
                instagram: '',
                youtube: ''
              },
              professionalContacts: {
                github: '',
                gitlab: '',
                bitbucket: '',
                stackoverflow: '',
                leetcode: '',
                codepen: '',
                behance: '',
                dribbble: '',
                medium: '',
                devto: '',
                hashnode: '',
                website: '',
                portfolio: '',
                blog: '',
                resume: '',
                discord: '',
                slack: ''
              }
            })}
            disabled={isSubmitting}
          >
            �️ Clear Form
          </button>
        </div>
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
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
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
        {!data?.skills || (Array.isArray(data.skills) ? data.skills.length === 0 : Object.keys(data.skills).length === 0) ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>
            {searchTerm || filterCategory !== 'all' ? 'No skills match your search criteria.' : 'No skills added yet.'}
          </div>
        ) : (
          <div className="items-grid">
            {filterItems(Array.isArray(data.skills) ? data.skills : Object.values(data.skills).flat(), ['name', 'category', 'level']).map((skill, index) => (
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
          <div key={project.id} className="item-card">
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
              <button onClick={() => projectHandlers.delete(project.id)} className="delete-btn">
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
          <div key={experience.id} className="item-card">
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
              <button onClick={() => experienceHandlers.delete(experience.id)} className="delete-btn">
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
          <div key={education.id} className="item-card">
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
              <button onClick={() => educationHandlers.delete(education.id)} className="delete-btn">
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

            {/* Multiple media files for blog (images/videos/audio) */}
            <div style={{marginTop: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Upload Media Files (images / videos / audio) — multiple allowed</label>
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                onChange={(e) => handleMultipleFileUpload(e, 'blog', setBlogFileUrls, setBlogFilesUploading)}
                className="form-input"
                disabled={blogFilesUploading || isSubmitting}
              />
              {Array.isArray(blogFileUrls) && blogFileUrls.length > 0 && (
                <div style={{marginTop: '8px'}}>
                  <strong>Uploaded files:</strong>
                  <ul>
                    {blogFileUrls.map((u, i) => (
                      <li key={`blog-file-${i}`} style={{fontSize: '13px'}}>
                        <a href={u} target="_blank" rel="noreferrer">{u}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(blogBatchFiles) && blogBatchFiles.length > 0 && (
                <div style={{marginTop: '8px'}}>
                  <strong>Files in queue:</strong>
                  <ul>
                    {blogBatchFiles.map((f) => (
                      <li key={`blog-batch-${f.id}`} style={{fontSize: '13px', marginBottom: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
                          <div style={{flex: 1, minWidth: 0}}>
                            <div style={{fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{f.name}</div>
                            <div style={{background: '#eef2ff', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                              <div style={{width: `${f.progress || 0}%`, height: '100%', background: '#3b82f6'}} />
                            </div>
                          </div>
                          <div style={{marginLeft: '8px', textAlign: 'right'}}>
                            <div style={{fontSize: '12px', color: '#666'}}>{f.status}{f.progress !== undefined ? ` • ${f.progress}%` : ''}</div>
                            <div style={{marginTop: '6px'}}>
                              <button type="button" className="cancel-btn" onClick={() => handleRemoveBatchFile('blog', f.id)} style={{fontSize: '12px'}}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(blogFilesUploading || (Array.isArray(blogUploadProgress) && blogUploadProgress.length > 0)) && (
                (() => {
                  const percent = Array.isArray(blogUploadProgress) && blogUploadProgress.length ? Math.round(blogUploadProgress.reduce((a,b) => a + b, 0) / blogUploadProgress.length) : 0;
                  return (
                    <div style={{marginTop: '8px'}}>
                      <label style={{fontSize: '13px', color: '#666'}}>Upload Progress: {percent}%</label>
                      <div style={{background: '#e6edf3', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                        <div style={{width: `${percent}%`, height: '100%', background: '#3b82f6'}} />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
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
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || blogFilesUploading || (!((Array.isArray(blogFileUrls) && blogFileUrls.length > 0) || (Array.isArray(blogForm.media) && blogForm.media.length > 0) || (blogForm.coverImage && typeof blogForm.coverImage === 'string' && blogForm.coverImage.startsWith('http'))))}
          >
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
          <div key={blog.id} className="item-card">
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
              <button onClick={() => blogHandlers.delete(blog.id)} className="delete-btn">
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

            {/* Multiple video files for vlog (allow uploading several files) */}
            <div style={{marginTop: '10px'}}>
              <label style={{fontSize: '14px', color: '#666'}}>Upload Video Files (multiple allowed)</label>
              <input
                type="file"
                accept="video/*,audio/*"
                multiple
                onChange={(e) => handleMultipleFileUpload(e, 'vlog', setVlogFileUrls, setVlogFilesUploading)}
                className="form-input"
                disabled={vlogFilesUploading || isSubmitting}
              />
              {Array.isArray(vlogFileUrls) && vlogFileUrls.length > 0 && (
                <div style={{marginTop: '8px'}}>
                  <strong>Uploaded videos:</strong>
                  <ul>
                    {vlogFileUrls.map((u,i) => (
                      <li key={`vlog-file-${i}`} style={{fontSize: '13px'}}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(vlogBatchFiles) && vlogBatchFiles.length > 0 && (
                <div style={{marginTop: '8px'}}>
                  <strong>Files in queue:</strong>
                  <ul>
                    {vlogBatchFiles.map((f) => (
                      <li key={`vlog-batch-${f.id}`} style={{fontSize: '13px', marginBottom: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
                          <div style={{flex: 1, minWidth: 0}}>
                            <div style={{fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{f.name}</div>
                            <div style={{background: '#ecfdf5', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                              <div style={{width: `${f.progress || 0}%`, height: '100%', background: '#10b981'}} />
                            </div>
                          </div>
                          <div style={{marginLeft: '8px', textAlign: 'right'}}>
                            <div style={{fontSize: '12px', color: '#666'}}>{f.status}{f.progress !== undefined ? ` • ${f.progress}%` : ''}</div>
                            <div style={{marginTop: '6px'}}>
                              <button type="button" className="cancel-btn" onClick={() => handleRemoveBatchFile('vlog', f.id)} style={{fontSize: '12px'}}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(vlogFilesUploading || (Array.isArray(vlogUploadProgress) && vlogUploadProgress.length > 0)) && (
                (() => {
                  const percent = Array.isArray(vlogUploadProgress) && vlogUploadProgress.length ? Math.round(vlogUploadProgress.reduce((a,b) => a + b, 0) / vlogUploadProgress.length) : 0;
                  return (
                    <div style={{marginTop: '8px'}}>
                      <label style={{fontSize: '13px', color: '#666'}}>Upload Progress: {percent}%</label>
                      <div style={{background: '#e6edf3', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                        <div style={{width: `${percent}%`, height: '100%', background: '#10b981'}} />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
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
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || vlogFilesUploading || (!((Array.isArray(vlogFileUrls) && vlogFileUrls.length > 0) || (Array.isArray(vlogForm.videos) && vlogForm.videos.length > 0) || (vlogForm.videoUrl && typeof vlogForm.videoUrl === 'string' && vlogForm.videoUrl.startsWith('http'))))}
          >
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
          <div key={vlog.id} className="item-card">
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
              <button onClick={() => vlogHandlers.delete(vlog.id)} className="delete-btn">
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
            <label>Image Upload (multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleMultipleFileUpload(e, 'gallery', setGalleryImageUrls, setGalleryFilesUploading)}
              className="form-input"
              disabled={galleryFilesUploading || isSubmitting}
            />
            {Array.isArray(galleryImageUrls) && galleryImageUrls.length > 0 && (
              <div style={{marginTop: '8px'}}>
                <strong>Uploaded images:</strong>
                <ul>
                  {galleryImageUrls.map((u,i) => (
                    <li key={`gallery-file-${i}`} style={{fontSize: '13px'}}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(galleryBatchFiles) && galleryBatchFiles.length > 0 && (
              <div style={{marginTop: '8px'}}>
                <strong>Files in queue:</strong>
                <ul>
                  {galleryBatchFiles.map((f) => (
                    <li key={`gallery-batch-${f.id}`} style={{fontSize: '13px', marginBottom: '8px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{f.name}</div>
                          <div style={{background: '#fff7ed', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                            <div style={{width: `${f.progress || 0}%`, height: '100%', background: '#f97316'}} />
                          </div>
                        </div>
                        <div style={{marginLeft: '8px', textAlign: 'right'}}>
                          <div style={{fontSize: '12px', color: '#666'}}>{f.status}{f.progress !== undefined ? ` • ${f.progress}%` : ''}</div>
                          <div style={{marginTop: '6px'}}>
                            <button type="button" className="cancel-btn" onClick={() => handleRemoveBatchFile('gallery', f.id)} style={{fontSize: '12px'}}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(galleryFilesUploading || (Array.isArray(galleryUploadProgress) && galleryUploadProgress.length > 0)) && (
              (() => {
                const percent = Array.isArray(galleryUploadProgress) && galleryUploadProgress.length ? Math.round(galleryUploadProgress.reduce((a,b) => a + b, 0) / galleryUploadProgress.length) : 0;
                return (
                  <div style={{marginTop: '8px'}}>
                    <label style={{fontSize: '13px', color: '#666'}}>Upload Progress: {percent}%</label>
                    <div style={{background: '#e6edf3', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px'}}>
                      <div style={{width: `${percent}%`, height: '100%', background: '#f97316'}} />
                    </div>
                  </div>
                );
              })()
            )}
          </div>
          <div className="form-group">
            <label>Image URL (Alternative - single)</label>
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
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || galleryFilesUploading || (!((Array.isArray(galleryImageUrls) && galleryImageUrls.length > 0) || (Array.isArray(galleryForm.imageUrls) && galleryForm.imageUrls.length > 0) || (galleryForm.imageUrl && typeof galleryForm.imageUrl === 'string' && galleryForm.imageUrl.startsWith('http'))))}
          >
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
          <div key={image.id} className="gallery-item">
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
                <button onClick={() => galleryHandlers.delete(image.id)} className="delete-btn">
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
          <div key={service.id} className="item-card service-card">
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
              <button onClick={() => serviceHandlers.delete(service.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Viewer -> Editor management
  const renderViewerEditorTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Viewer → Editor Management</h2>
        <p>Generate one-time access keys for users to upgrade from viewer to editor role, manage access requests, and track role conversions.</p>
      </div>

      {/* Sub-tabs for Access Keys, Requests, Conversions */}
      <div className="sub-tabs" style={{marginBottom: '20px'}}>
        <button 
          className={activeSubTab === 'accessKeys' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveSubTab('accessKeys')}
        >
          🔑 Access Keys
        </button>
        <button 
          className={activeSubTab === 'adminRequests' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveSubTab('adminRequests')}
        >
          📥 Admin Requests
        </button>
        <button 
          className={activeSubTab === 'conversions' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveSubTab('conversions')}
        >
          📊 Conversions
        </button>
      </div>

      {/* Access Keys Section */}
      {activeSubTab === 'accessKeys' && (
        <div>
          <div className="form-section" style={{marginBottom: '24px'}}>
            <h3>Generate New Access Key</h3>
            <p>Create a one-time use key that allows a viewer to upgrade to editor role.</p>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <input
                type="text"
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                className="form-input"
                placeholder="e.g., For John Doe - expires in 7 days"
              />
            </div>
            <button onClick={handleGenerateKey} className="submit-btn">
              🔑 Generate Access Key
            </button>
          </div>

          <div className="items-list">
            <h3>Active Access Keys</h3>
            {accessKeys.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>
                No access keys generated yet. Create one above to allow users to upgrade to editor role.
              </div>
            ) : (
              accessKeys.map((keyObj) => (
                <div key={keyObj.id} className="item-card">
                  <div className="item-header">
                    <h4>Access Key</h4>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <span className={keyObj.used ? 'status-badge used' : 'status-badge active'}>
                        {keyObj.used ? 'Used' : 'Active'}
                      </span>
                      {keyObj.expiresAt && new Date(keyObj.expiresAt) < new Date() && (
                        <span className="status-badge expired">Expired</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f7fafc',
                    padding: '12px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    wordBreak: 'break-all',
                    marginBottom: '12px'
                  }}>
                    {keyObj.key}
                  </div>
                  {keyObj.notes && <p style={{color: '#666', marginBottom: '8px'}}>Notes: {keyObj.notes}</p>}
                  <div className="item-meta">
                    <span>Created: {new Date(keyObj.createdAt).toLocaleString()}</span>
                    {keyObj.expiresAt && <span>Expires: {new Date(keyObj.expiresAt).toLocaleString()}</span>}
                    {keyObj.usedBy && <span>Used by: {keyObj.usedBy}</span>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleCopy(keyObj.key)} className="edit-btn">
                      📋 Copy Key
                    </button>
                    {!keyObj.used && (
                      <button onClick={() => handleDeleteKey(keyObj.id)} className="delete-btn">
                        🗑️ Revoke Key
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin Requests Section */}
      {activeSubTab === 'adminRequests' && (
        <div className="items-list">
          <h3>Pending Admin Access Requests</h3>
          <p style={{marginBottom: '20px', color: '#666'}}>
            Users can request admin or editor access. Approve or reject requests below.
          </p>
          {adminRequests.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>
              No pending access requests at the moment.
            </div>
          ) : (
            adminRequests
              .filter(req => req.status === 'pending')
              .map((request) => (
                <div key={request.id} className="item-card">
                  <div className="item-header">
                    <div>
                      <h4>{request.userName || request.userEmail}</h4>
                      <p style={{color: '#666', fontSize: '14px'}}>{request.userEmail}</p>
                    </div>
                    <span className="status-badge pending">{request.status}</span>
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <strong>Requested Role:</strong> {request.requestedRole}
                  </div>
                  {request.reason && (
                    <div style={{
                      backgroundColor: '#f7fafc',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <strong>Reason:</strong>
                      <p style={{margin: '4px 0 0 0'}}>{request.reason}</p>
                    </div>
                  )}
                  <div className="item-meta">
                    <span>Requested: {new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleApproveRequest(request.id)} className="submit-btn">
                      ✅ Approve Request
                    </button>
                    <button onClick={() => handleRejectRequest(request.id)} className="delete-btn">
                      ❌ Reject Request
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Conversions Section */}
      {activeSubTab === 'conversions' && (
        <div className="items-list">
          <h3>Role Conversion History</h3>
          <p style={{marginBottom: '20px', color: '#666'}}>
            Track all viewer → editor role upgrades. You can revert users back to viewer role if needed.
          </p>
          {conversions.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>
              No role conversions recorded yet.
            </div>
          ) : (
            conversions.map((conversion) => (
              <div key={conversion.id} className="item-card">
                <div className="item-header">
                  <div>
                    <h4>{conversion.userName || 'User'}</h4>
                    <p style={{color: '#666', fontSize: '14px'}}>{conversion.userEmail}</p>
                  </div>
                  <span className="status-badge success">
                    {conversion.fromRole} → {conversion.toRole}
                  </span>
                </div>
                <div className="item-meta">
                  <span>Converted: {new Date(conversion.convertedAt).toLocaleString()}</span>
                  {conversion.method && <span>Method: {conversion.method}</span>}
                  {conversion.accessKeyUsed && <span>Access Key Used</span>}
                </div>
                {conversion.toRole === 'editor' && (
                  <div className="item-actions">
                    <button 
                      onClick={() => handleRevertUser(conversion.userId)} 
                      className="cancel-btn"
                    >
                      ↩️ Revert to Viewer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Render Testimonials Tab (split into Add / Manage)
  const renderTestimonialsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Testimonials Management</h2>
        <div className="sub-tabs" style={{ marginTop: '0.5rem' }}>
          <button 
            className={activeTestimonialsSubTab === 'add' ? 'sub-tab active' : 'sub-tab'}
            onClick={() => setActiveTestimonialsSubTab('add')}
            type="button"
          >
            Add Testimonial
          </button>
          <button 
            className={activeTestimonialsSubTab === 'manage' ? 'sub-tab active' : 'sub-tab'}
            onClick={() => setActiveTestimonialsSubTab('manage')}
            type="button"
          >
            Manage Testimonials
          </button>
        </div>
      </div>

      {/* Add Testimonial view */}
      {activeTestimonialsSubTab === 'add' && (
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
          <label>Testimonial Message</label>
          <textarea
            value={testimonialForm.message}
            onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
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
      )}

      {/* Manage Testimonials view */}
      {activeTestimonialsSubTab === 'manage' && (
        <div>
          {renderControls(['all'])}
          <div style={{ marginTop: '1rem' }}>
            {testimonialsLoading ? (
              <div className="loading"><div className="loading-spinner"></div><div className="loading-text">Loading testimonials...</div></div>
            ) : (
              <div className="items-list">
                {filterItems(adminTestimonials || [], ['name', 'company', 'content']).length === 0 && (
                  <div className="item-card">No testimonials found.</div>
                )}
                {filterItems(adminTestimonials || [], ['name', 'company', 'content']).map((testimonial) => (
                  <div key={testimonial.id} className="item-card testimonial-card">
                    <div className="testimonial-header">
                      <div className="testimonial-avatar">
                        {testimonial.imageUrl ? (
                          <img src={testimonial.imageUrl} alt={testimonial.name} />
                        ) : (
                          <div className="avatar-placeholder">{(testimonial.name || '').charAt(0)}</div>
                        )}
                      </div>
                      <div className="testimonial-info">
                        <h3>{testimonial.name}</h3>
                        <p>{testimonial.position} at {testimonial.company}</p>
                        <div className="rating">{'★'.repeat(testimonial.rating || 0)}{'☆'.repeat(5 - (testimonial.rating || 0))}</div>
                      </div>
                      {testimonial.featured && <span className="featured-badge">Featured</span>}
                    </div>
                    <p className="testimonial-content">"{testimonial.message}"</p>
                    <div className="item-actions">
                      <button onClick={() => { testimonialHandlers.edit(testimonial); setActiveTestimonialsSubTab('add'); }} className="edit-btn">Edit</button>
                      <button onClick={() => testimonialHandlers.delete(testimonial.id)} className="delete-btn">Delete</button>
                      <button onClick={() => toggleTestimonialFlag(testimonial.id, { featured: !testimonial.featured })} className="submit-btn" style={{ marginLeft: '8px' }}>{testimonial.featured ? 'Unfeature' : 'Feature'}</button>
                      <button onClick={() => toggleTestimonialFlag(testimonial.id, { approved: !testimonial.approved })} className="submit-btn" style={{ marginLeft: '8px' }}>{testimonial.approved ? 'Unapprove' : 'Approve'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Achievement handlers
  const achievementHandlers = {
    fetchAll: async () => {
      return fetchAchievements();
    },
    submit: async (e) => {
      e.preventDefault();
      try {
  const method = achievementEditingId ? 'PUT' : 'POST';
  const path = achievementEditingId ? `/api/admin/achievements/${achievementEditingId}` : '/api/admin/achievements';
        const body = JSON.stringify(achievementForm);
        const result = await apiFetch(path, { method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body });
        const res = result.res;
        if (!res || !res.ok) {
          showMessage('Failed to save achievement', 'error');
          return;
        }
        showMessage(achievementEditingId ? 'Achievement updated' : 'Achievement created', 'success');
        setAchievementForm({ title: '', description: '', category: '', date: '', organization: '', number: '', unit: '', verificationUrl: '' });
        setAchievementEditingId(null);
        await fetchAchievements();
      } catch (err) {
        console.error(err);
        showMessage('Error saving achievement', 'error');
      }
    },
    edit: (achievement) => {
      setAchievementForm({
        title: achievement.title || '',
        description: achievement.description || '',
        category: achievement.category || '',
        date: achievement.date ? new Date(achievement.date).toISOString().slice(0,10) : '',
        organization: achievement.organization || '',
        number: achievement.number || '',
        unit: achievement.unit || '',
        verificationUrl: achievement.verificationUrl || ''
      });
      setAchievementEditingId(achievement.id);
      setEditingType('achievements');
    },
    delete: async (id) => {
      try {
  const { res } = await apiFetch(`/api/admin/achievements/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) {
          showMessage('Failed to delete achievement', 'error');
          return;
        }
        showMessage('Achievement deleted', 'success');
        await fetchAchievements();
      } catch (e) { console.error(e); showMessage('Delete failed', 'error'); }
    },
    confirmDelete: (id) => setShowDeleteConfirm(id)
  };

  // Render Achievements Tab
  const renderAchievementsTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Achievements Management</h2>
        <p>Manage achievements shown on the portfolio home and dedicated page.</p>
      </div>

      <form onSubmit={achievementHandlers.submit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={achievementForm.title} onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })} className="form-input" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" value={achievementForm.category} onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={achievementForm.description} onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })} className="form-input" rows="3" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={achievementForm.date} onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })} className="form-input" />
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input type="text" value={achievementForm.organization} onChange={(e) => setAchievementForm({ ...achievementForm, organization: e.target.value })} className="form-input" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Number / Value</label>
            <input type="text" value={achievementForm.number} onChange={(e) => setAchievementForm({ ...achievementForm, number: e.target.value })} className="form-input" />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input type="text" value={achievementForm.unit} onChange={(e) => setAchievementForm({ ...achievementForm, unit: e.target.value })} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label>Verification URL</label>
          <input type="url" value={achievementForm.verificationUrl} onChange={(e) => setAchievementForm({ ...achievementForm, verificationUrl: e.target.value })} className="form-input" />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">{achievementEditingId ? 'Update Achievement' : 'Add Achievement'}</button>
          {achievementEditingId && <button type="button" onClick={() => { setAchievementEditingId(null); setAchievementForm({ title: '', description: '', category: '', date: '', organization: '', number: '', unit: '', verificationUrl: '' }); }} className="cancel-btn">Cancel</button>}
        </div>
      </form>

      <div className="items-list">
        {(achievementsList || data?.achievements || []).map(a => (
          <div key={a.id} className="item-card achievement-card">
            <div className="achievement-header">
              <h3>{a.title}</h3>
              <div className="achievement-meta">{a.category} {a.date && <span> • {new Date(a.date).toLocaleDateString()}</span>}</div>
            </div>
            <p>{a.description}</p>
            <div className="item-actions">
              <button onClick={() => achievementHandlers.edit(a)} className="edit-btn">Edit</button>
              <button onClick={() => achievementHandlers.delete(a.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  

  // Render Contacts Tab
  const renderContactsTab = () => (
    <div className="tab-content">
      <div className="contact-tabs">
        <div className="sub-tabs">
          <button 
            className={activeSubTab === 'contactInfo' ? 'sub-tab active' : 'sub-tab'} 
            onClick={() => setActiveSubTab('contactInfo')}
          >
            Contact Information
          </button>
          <button 
            className={activeSubTab === 'contactMessages' ? 'sub-tab active' : 'sub-tab'} 
            onClick={() => setActiveSubTab('contactMessages')}
          >
            Contact Messages
          </button>
        </div>
        
        {activeSubTab === 'contactInfo' ? renderContactInfoSection() : renderContactMessagesSection()}
      </div>
    </div>
  );

  // User management handlers
  const changeUserRole = async (userId, newRole) => {
    try {
      setIsSubmitting(true);
      const { res, json, text } = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (!res || !res.ok) {
        console.error('changeUserRole failed', res && res.status, text || json);
        showMessage('Failed to update user role', 'error');
        return false;
      }
      showMessage('User role updated', 'success');
      await fetchUsers();
      return true;
    } catch (e) {
      console.error('changeUserRole error', e);
      showMessage('Error updating role', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setIsSubmitting(true);
      const { res, json, text } = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res || !res.ok) {
        console.error('deleteUser failed', res && res.status, text || json);
        showMessage('Failed to delete user', 'error');
        return false;
      }
      showMessage('User deleted', 'success');
      await fetchUsers();
      return true;
    } catch (e) {
      console.error('deleteUser error', e);
      showMessage('Error deleting user', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Users Tab
  const renderUsersTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>User Management</h2>
        <p>View and manage registered users and their roles</p>
      </div>

      <div className="users-controls" style={{display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '12px'}}>
        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="form-input" style={{width: '160px'}}>
          <option value="all">All Roles</option>
          <option value="viewer">viewer</option>
          <option value="editor">editor</option>
          {/* 'admin' and 'root admin' are intentionally omitted from the filter/options to avoid exposing them in the UI */}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input" style={{width: '160px'}}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
        </select>
        <select value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} className="form-input" style={{width: '110px'}}>
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button className="submit-btn" onClick={() => { setPage(1); fetchUsers(); }} disabled={usersLoading}>Refresh</button>
      </div>

      <div className="items-list">
        {usersLoading ? (
          <div className="loading">Loading users...</div>
        ) : (!usersList || usersList.length === 0) ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>No users found.</div>
        ) : (
          (() => {
            // Filter out protected roles so they are not shown in the users list
            const protectedRoles = ['admin', 'root admin'];
            const filteredUsersList = Array.isArray(usersList)
              ? usersList.filter(u => !protectedRoles.includes((u.role || '').toLowerCase()))
              : [];

            const { paged, total, totalPages, currentPage } = applyUsersPipeline(filteredUsersList);
            if (total === 0) return <div style={{textAlign: 'center', padding: '40px', color: '#718096'}}>No users match filters.</div>;

            return (
              <>
                {paged.map((user) => {
                  const uid = user.id;
                  const localRole = editedRoles[uid] !== undefined ? editedRoles[uid] : (user.role || 'viewer');
                  const isProtected = ['admin', 'root admin'].includes((user.role || '').toLowerCase());
                  return (
                    <div key={uid} className="item-card user-card">
                      <div className="item-info">
                        <h4>{user.name || 'Unnamed'}</h4>
                        <p>{user.email}</p>
                        <p style={{fontSize: '12px', color: '#666'}}>Role: <strong>{user.role}</strong></p>
                        <p style={{fontSize: '12px', color: '#666'}}>UserID: <strong>{user.userId || uid}</strong></p>
                        <p style={{fontSize: '11px', color: '#999'}}>Created: {new Date(user.createdAt || Date.now()).toLocaleString()}</p>
                      </div>
                      <div className="item-actions" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        {/* If a user is protected (admin/root admin) show the role as text and disable actions */}
                        {isProtected ? (
                          <div style={{padding: '8px 12px', borderRadius: '6px', background: '#f5f5f5', color: '#333', fontSize: '13px'}}>{user.role}</div>
                        ) : (
                          <select value={localRole} onChange={(e) => handleLocalRoleChange(uid, e.target.value)} className="form-input" style={{width: '140px'}}>
                            <option value="viewer">viewer</option>
                            <option value="editor">editor</option>
                          </select>
                        )}

                        <button onClick={() => saveUserRole(uid)} className="submit-btn" disabled={isSubmitting || !(editedRoles[uid]) || isProtected}>Save</button>
                        <button onClick={() => { if (!isProtected) setShowDeleteConfirm(uid); }} className="delete-btn" disabled={isProtected}>Delete</button>
                        <button onClick={() => assignUserId(uid)} className="submit-btn" title="Assign/Generate a userId" disabled={isProtected}>Assign ID</button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination controls */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px'}}>
                  <div style={{color: '#555'}}>{`Showing ${paged.length} of ${total} users`}</div>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <button className="cancel-btn" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
                    <span style={{minWidth: '60px', textAlign: 'center'}}>Page {currentPage} / {totalPages}</span>
                    <button className="submit-btn" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                  </div>
                </div>
              </>
            );
          })()
        )}
      </div>
    </div>
  );

  // Render Contact Info Management Section
  const renderContactInfoSection = () => (
    <div className="sub-tab-content">
      <div className="tab-header">
        <h2>Contact Information Management</h2>
        <p>Manage your contact details that will be displayed on your portfolio based on visibility settings</p>
        <div className="header-actions">
          <div className="info-badge">
            <span>📄</span>
            Single Record System - Updates overwrite previous data
          </div>
        </div>
      </div>
      
      <form onSubmit={contactInfoHandlers.submit} className="admin-form contact-info-form">
        {/* Basic Contact Information */}
        <div className="form-section">
          <h3>📧 Basic Contact Information</h3>
          <p className="section-description">Primary contact methods for potential clients and employers</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>Primary Email *</label>
              <input
                type="email"
                value={contactInfoForm.email || ''}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, email: e.target.value })}
                className="form-input"
                placeholder="your.professional@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Primary Phone</label>
              <input
                type="tel"
                value={contactInfoForm.phone || ''}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, phone: e.target.value })}
                className="form-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Alternate Email</label>
              <input
                type="email"
                value={contactInfoForm.alternateEmail || ''}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, alternateEmail: e.target.value })}
                className="form-input"
                placeholder="alternative@email.com"
              />
            </div>
            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                value={contactInfoForm.alternatePhone || ''}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, alternatePhone: e.target.value })}
                className="form-input"
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>🏠 Address Information</h3>
          <p className="section-description">Physical location information for local opportunities</p>
          
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={contactInfoForm.address?.street || ''}
              onChange={(e) => setContactInfoForm({ 
                ...contactInfoForm, 
                address: { ...contactInfoForm.address, street: e.target.value }
              })}
              className="form-input"
              placeholder="123 Professional Street"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={contactInfoForm.address?.city || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  address: { ...contactInfoForm.address, city: e.target.value }
                })}
                className="form-input"
                placeholder="Your City"
              />
            </div>
            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                value={contactInfoForm.address?.state || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  address: { ...contactInfoForm.address, state: e.target.value }
                })}
                className="form-input"
                placeholder="State/Province"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>ZIP/Postal Code</label>
              <input
                type="text"
                value={contactInfoForm.address?.zipCode || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  address: { ...contactInfoForm.address, zipCode: e.target.value }
                })}
                className="form-input"
                placeholder="12345"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={contactInfoForm.address?.country || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  address: { ...contactInfoForm.address, country: e.target.value }
                })}
                className="form-input"
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="form-section">
          <h3>💼 Professional Details</h3>
          <p className="section-description">Availability and professional communication preferences</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>Availability Status</label>
              <select
                value={contactInfoForm.availability || 'available'}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, availability: e.target.value })}
                className="form-input"
              >
                <option value="available">🟢 Available for Work</option>
                <option value="busy">🟡 Busy (Limited Availability)</option>
                <option value="unavailable">🔴 Currently Unavailable</option>
                <option value="open">💼 Open to Opportunities</option>
              </select>
            </div>
            <div className="form-group">
              <label>Response Time</label>
              <select
                value={contactInfoForm.responseTime || '24 hours'}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, responseTime: e.target.value })}
                className="form-input"
              >
                <option value="Same day">Same day</option>
                <option value="24 hours">24 hours</option>
                <option value="48 hours">48 hours</option>
                <option value="72 hours">72 hours</option>
                <option value="1 week">1 week</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Timezone</label>
              <select
                value={contactInfoForm.timezone || 'UTC'}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, timezone: e.target.value })}
                className="form-input"
              >
                <option value="EST">EST (Eastern)</option>
                <option value="CST">CST (Central)</option>
                <option value="MST">MST (Mountain)</option>
                <option value="PST">PST (Pacific)</option>
                <option value="UTC">UTC</option>
                <option value="GMT">GMT</option>
                <option value="IST">IST (India)</option>
                <option value="JST">JST (Japan)</option>
                <option value="AEST">AEST (Australia)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Website URL</label>
              <input
                type="url"
                value={contactInfoForm.website || ''}
                onChange={(e) => setContactInfoForm({ ...contactInfoForm, website: e.target.value })}
                className="form-input"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="form-section">
          <h3>⏰ Business Hours</h3>
          <p className="section-description">Your preferred hours for professional communication</p>
          
          <div className="business-hours-grid">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <div key={day} className="form-group business-hour-item">
                <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                <input
                  type="text"
                  value={contactInfoForm.businessHours?.[day] || ''}
                  onChange={(e) => setContactInfoForm({ 
                    ...contactInfoForm, 
                    businessHours: { ...contactInfoForm.businessHours, [day]: e.target.value }
                  })}
                  className="form-input"
                  placeholder="9:00 AM - 5:00 PM or 'Closed'"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="form-section">
          <h3>🔗 Social Media Links</h3>
          <p className="section-description">Professional social media profiles and networking platforms</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>🔗 LinkedIn</label>
              <input
                type="url"
                value={contactInfoForm.socialLinks?.linkedin || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  socialLinks: { ...contactInfoForm.socialLinks, linkedin: e.target.value }
                })}
                className="form-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label>🐙 GitHub</label>
              <input
                type="url"
                value={contactInfoForm.socialLinks?.github || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  socialLinks: { ...contactInfoForm.socialLinks, github: e.target.value }
                })}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>🐦 Twitter</label>
              <input
                type="url"
                value={contactInfoForm.socialLinks?.twitter || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  socialLinks: { ...contactInfoForm.socialLinks, twitter: e.target.value }
                })}
                className="form-input"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="form-group">
              <label>📷 Instagram</label>
              <input
                type="url"
                value={contactInfoForm.socialLinks?.instagram || ''}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  socialLinks: { ...contactInfoForm.socialLinks, instagram: e.target.value }
                })}
                className="form-input"
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>📺 YouTube</label>
            <input
              type="url"
              value={contactInfoForm.socialLinks?.youtube || ''}
              onChange={(e) => setContactInfoForm({ 
                ...contactInfoForm, 
                socialLinks: { ...contactInfoForm.socialLinks, youtube: e.target.value }
              })}
              className="form-input"
              placeholder="https://youtube.com/c/username"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="form-section">
          <h3>💬 Call to Action</h3>
          <p className="section-description">Customize the call-to-action message on your contact section</p>
          
          <div className="form-group">
            <label>CTA Title</label>
            <input
              type="text"
              value={contactInfoForm.callToAction?.title || ''}
              onChange={(e) => setContactInfoForm({ 
                ...contactInfoForm, 
                callToAction: { ...contactInfoForm.callToAction, title: e.target.value }
              })}
              className="form-input"
              placeholder="Let's Build Something Amazing!"
            />
          </div>
          
          <div className="form-group">
            <label>CTA Subtitle</label>
            <input
              type="text"
              value={contactInfoForm.callToAction?.subtitle || ''}
              onChange={(e) => setContactInfoForm({ 
                ...contactInfoForm, 
                callToAction: { ...contactInfoForm.callToAction, subtitle: e.target.value }
              })}
              className="form-input"
              placeholder="Ready to bring your ideas to life? Let's discuss your project!"
            />
          </div>
          
          <div className="form-group">
            <label>Button Text</label>
            <input
              type="text"
              value={contactInfoForm.callToAction?.buttonText || ''}
              onChange={(e) => setContactInfoForm({ 
                ...contactInfoForm, 
                callToAction: { ...contactInfoForm.callToAction, buttonText: e.target.value }
              })}
              className="form-input"
              placeholder="Get In Touch"
            />
          </div>
        </div>

        {/* Display Settings */}
        <div className="form-section">
          <h3>👁️ Display Settings</h3>
          <p className="section-description">Control what contact information is visible on your public portfolio</p>
          
          <div className="checkbox-grid">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showEmail"
                checked={contactInfoForm.displaySettings?.showEmail || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showEmail: e.target.checked }
                })}
              />
              <label htmlFor="showEmail">📧 Show Email</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showAddress"
                checked={contactInfoForm.displaySettings?.showAddress || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showAddress: e.target.checked }
                })}
              />
              <label htmlFor="showAddress">🏠 Show Address</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showPhone"
                checked={contactInfoForm.displaySettings?.showPhone || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showPhone: e.target.checked }
                })}
              />
              <label htmlFor="showPhone">📱 Show Phone</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showBusinessHours"
                checked={contactInfoForm.displaySettings?.showBusinessHours || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showBusinessHours: e.target.checked }
                })}
              />
              <label htmlFor="showBusinessHours">⏰ Show Business Hours</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showSocialLinks"
                checked={contactInfoForm.displaySettings?.showSocialLinks || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showSocialLinks: e.target.checked }
                })}
              />
              <label htmlFor="showSocialLinks">🔗 Show Social Links</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showAvailability"
                checked={contactInfoForm.displaySettings?.showAvailability || false}
                onChange={(e) => setContactInfoForm({ 
                  ...contactInfoForm, 
                  displaySettings: { ...contactInfoForm.displaySettings, showAvailability: e.target.checked }
                })}
              />
              <label htmlFor="showAvailability">💼 Show Availability</label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px', display: 'inline-block'}}></div>
                Saving Contact Information...
              </>
            ) : (
              <>
                💾 {data?.contactInfo ? 'Update Contact Information' : 'Save Contact Information'}
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="submit-btn secondary" 
            onClick={() => fetchData()}
            disabled={isSubmitting}
          >
            🔄 Reload Data
          </button>
        </div>
      </form>
    </div>
  );

  // Render Contact Messages Section
  const renderContactMessagesSection = () => (
    <div className="sub-tab-content">
      <div className="tab-header">
        <h2>Contact Messages</h2>
        <div className="header-actions">
          <button 
            onClick={refreshContacts}
            className="refresh-contacts-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Refreshing...
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh Contacts
              </>
            )}
          </button>
          {renderControls(['unread', 'read', 'replied', 'archived'])}
        </div>
      </div>

      {isLoading ? (
        <div className="contact-loading">
          <div className="spinner"></div>
          <span>Loading contacts...</span>
        </div>
      ) : (
        <div className="items-list">
          {filterItems(data?.contacts || [], ['name', 'email', 'subject', 'message']).length > 0 ? (
            filterItems(data?.contacts || [], ['name', 'email', 'subject', 'message']).map((contact) => (
              <div key={contact.id} className={`item-card contact-card ${contact.status}`}>
                <div className="contact-header">
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <p>{contact.email}</p>
                    <p className="contact-subject">{contact.subject}</p>
                  </div>
                  <div className="contact-badges">
                    <span className={`status-badge ${contact.status || 'unread'}`}>
                      {contact.status || 'unread'}
                    </span>
                    {contact.priority && (
                      <span className={`priority-badge ${contact.priority}`}>
                        {contact.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="contact-message">
                  <p>{contact.message}</p>
                </div>
                <div className="contact-meta">
                  <span>📅 Received: {new Date(contact.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  {contact.phone && <span>📞 Phone: {contact.phone}</span>}
                  {contact.company && <span>🏢 Company: {contact.company}</span>}
                  {contact.source && <span>🌐 Source: {contact.source}</span>}
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => {
                      setContactForm(contact);
                      setEditingId(contact.id);
                      setEditingType('contacts');
                    }} 
                    className="edit-btn"
                  >
                    📝 Update Status
                  </button>
                  <select
                    value={contact.status || 'unread'}
                    onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                    className="status-select"
                    style={{marginLeft: '10px', padding: '5px'}}
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button onClick={() => contactHandlers.delete(contact.id)} className="delete-btn">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-contacts">
              <div className="no-contacts-icon">📬</div>
              <h3>No contact messages found</h3>
              <p>
                {searchTerm || filterCategory !== 'all' 
                  ? 'No contacts match your current filters.' 
                  : 'No contact messages available yet.'
                }
              </p>
            </div>
          )}
        </div>
      )}

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
      {/* Mobile Header */}
      <div className="mobile-header">
        {!isMobileMenuOpen ? (
          <>
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div className="mobile-title">Portfolio Admin</div>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <button onClick={() => window.location.href = '/'} className="mobile-home-btn">
                Home
              </button>
              <button onClick={logout} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mobile-title">Navigation</div>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <button className="mobile-close-btn admin-mobile-close" onClick={closeMobileMenu} aria-label="Close navigation">
                <svg className="close-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                  <path d="M6 6 L18 18 M6 18 L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileMenu}
      ></div>

      {/* Left Sidebar Navigation */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Portfolio Admin</h2>
          <div className="status-indicator online"></div>
          <span className="status-text">Connected</span>
          {/* left/floating sidebar close button removed to avoid duplicate close icon when navbar opens */}
          <div className="sidebar-actions">
            <button onClick={() => window.location.href = '/'} className="home-btn">
              Home
            </button>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
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
            <button 
              className={activeTab === 'achievements' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('achievements')}
            >
              <span>🏆</span> Achievements
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
              className={activeTab === 'viewer-editor' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('viewer-editor')}
            >
              <span>🔐</span> Viewer → Editor
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
            <button
              className={activeTab === 'users' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab('users')}
            >
              <span>👥</span> Users
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
                          achievements: achievementHandlers,
                        contacts: contactHandlers,
                        services: serviceHandlers
                      , users: { confirmDelete: deleteUser }
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
          {activeTab === 'viewer-editor' && renderViewerEditorTab()}
          {activeTab === 'testimonials' && renderTestimonialsTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'contacts' && renderContactsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


