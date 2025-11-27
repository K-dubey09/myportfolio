import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Play, Calendar, Eye, Clock, Search } from 'lucide-react';
import { API_URL } from '../config/env';
import './PagesStyles.css';

const VlogsPage = () => {
  const { user } = useAuth();
  const [vlogs, setVlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedVlog, setSelectedVlog] = useState(null);

  const fetchVlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/vlogs`, {
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${user.token}` } : {})
        }
      });
      
      if (response.ok) {
        const json = await response.json();
        const vlogsArray = Array.isArray(json) ? json : (json.data || json.vlogs || []);
        setVlogs(vlogsArray);
        console.log('Vlogs loaded:', vlogsArray);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch vlogs: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch vlogs:', error);
      setError(error.message);
      setVlogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVlogs();
  }, [fetchVlogs]);

  const filteredVlogs = vlogs.filter(vlog => 
    vlog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vlog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vlog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(vlog => 
    filterCategory === '' || vlog.category === filterCategory
  );

  const categories = [...new Set(vlogs.map(vlog => vlog.category).filter(Boolean))];

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading vlogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Play size={64} />
          <h2>Error Loading Vlogs</h2>
          <p>{error}</p>
          <button onClick={fetchVlogs} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dedicated-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Video Blog</h1>
        <p>Watch my journey, tutorials, and behind-the-scenes content</p>
      </motion.div>

      <motion.div 
        className="page-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search vlogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </motion.div>

      <motion.div 
        className="vlogs-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredVlogs.map((vlog, index) => (
          <motion.div
            key={vlog._id}
            className="vlog-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedVlog(vlog)}
          >
            <div className="vlog-thumbnail">
              {vlog.thumbnailUrl ? (
                <img 
                  src={vlog.thumbnailUrl} 
                  alt={vlog.title} 
                  loading="lazy"
                />
              ) : vlog.coverImage ? (
                <img 
                  src={vlog.coverImage} 
                  alt={vlog.title} 
                  loading="lazy"
                />
              ) : (
                <div className="thumbnail-placeholder">
                  <Play size={48} />
                  <span>No Thumbnail</span>
                </div>
              )}
              <div className="play-overlay">
                <Play size={32} />
              </div>
              {vlog.duration && (
                <div className="duration-badge">
                  <Clock size={12} />
                  {formatDuration(vlog.duration)}
                </div>
              )}
            </div>
            
            <div className="vlog-content">
              <h3>{vlog.title}</h3>
              {vlog.description && (
                <p className="vlog-description">
                  {vlog.description.length > 120 
                    ? `${vlog.description.substring(0, 120)}...` 
                    : vlog.description
                  }
                </p>
              )}
              
              <div className="vlog-meta">
                {vlog.category && (
                  <span className="vlog-category">{vlog.category}</span>
                )}
                <span className="vlog-date">
                  <Calendar size={14} />
                  {new Date(vlog.publishedDate || vlog.createdAt).toLocaleDateString()}
                </span>
                {vlog.views && (
                  <span className="vlog-views">
                    <Eye size={14} />
                    {vlog.views} views
                  </span>
                )}
              </div>
              
              {vlog.tags && vlog.tags.length > 0 && (
                <div className="vlog-tags">
                  {vlog.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="vlog-tag">{tag}</span>
                  ))}
                  {vlog.tags.length > 3 && (
                    <span className="vlog-tag more">+{vlog.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredVlogs.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No vlogs found matching your criteria.</p>
        </motion.div>
      )}

      {/* Vlog Modal */}
      {selectedVlog && (
        <motion.div 
          className="vlog-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedVlog(null)}
        >
          <motion.div 
            className="modal-content vlog-modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setSelectedVlog(null)}
            >
              ×
            </button>
            
            <div className="modal-video">
              {selectedVlog.videoUrl ? (
                selectedVlog.videoUrl.includes('youtube.com') || selectedVlog.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedVlog.videoUrl.replace('watch?v=', 'embed/')}
                    title={selectedVlog.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls>
                    <source src={selectedVlog.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="video-placeholder">
                  <Play size={64} />
                  <span>Video not available</span>
                </div>
              )}
            </div>
            
            <div className="modal-info">
              <h3>{selectedVlog.title}</h3>
              {selectedVlog.description && (
                <p>{selectedVlog.description}</p>
              )}
              
              <div className="modal-meta">
                {selectedVlog.category && (
                  <span>Category: {selectedVlog.category}</span>
                )}
                <span>Published: {new Date(selectedVlog.publishedDate || selectedVlog.createdAt).toLocaleDateString()}</span>
                {selectedVlog.views && (
                  <span>Views: {selectedVlog.views}</span>
                )}
                {selectedVlog.duration && (
                  <span>Duration: {formatDuration(selectedVlog.duration)}</span>
                )}
              </div>
              
              {selectedVlog.tags && selectedVlog.tags.length > 0 && (
                <div className="modal-tags">
                  {selectedVlog.tags.map((tag, idx) => (
                    <span key={idx} className="modal-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default VlogsPage;