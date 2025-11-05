import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Image, Calendar, Eye, Download, Search, Filter } from 'lucide-react';
import './PagesStyles.css';

const GalleryPage = () => {
  const { user } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/gallery', {
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${user.token}` } : {})
        }
      });
      
      if (response.ok) {
        const json = await response.json();
        const galleryArray = Array.isArray(json) ? json : (json.data || json.gallery || []);
        setGallery(galleryArray);
        console.log('Gallery loaded:', galleryArray);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch gallery: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
      setError(error.message);
      setGallery([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filteredGallery = gallery.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(item => 
    filterCategory === '' || item.category === filterCategory
  );

  const categories = [...new Set(gallery.map(item => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Image size={64} />
          <h2>Error Loading Gallery</h2>
          <p>{error}</p>
          <button onClick={fetchGallery} className="retry-btn">
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
        <h1>Gallery</h1>
        <p>Visual showcase of my work and creative projects</p>
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
            placeholder="Search gallery..."
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
        className="gallery-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredGallery.map((item, index) => (
          <motion.div
            key={item._id}
            className="gallery-item"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedImage(item)}
          >
            <div className="gallery-image">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  loading="lazy"
                />
              ) : (
                <div className="image-placeholder">
                  <Image size={48} />
                  <span>No Image</span>
                </div>
              )}
              <div className="gallery-overlay">
                <Eye size={24} />
              </div>
            </div>
            
            <div className="gallery-content">
              <h3>{item.title}</h3>
              {item.description && (
                <p className="gallery-description">
                  {item.description.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description
                  }
                </p>
              )}
              
              <div className="gallery-meta">
                {item.category && (
                  <span className="gallery-category">{item.category}</span>
                )}
                <span className="gallery-date">
                  <Calendar size={14} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="gallery-tags">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="gallery-tag">{tag}</span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="gallery-tag more">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredGallery.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No gallery items found matching your criteria.</p>
        </motion.div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <motion.div 
          className="image-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            
            <div className="modal-image">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title}
              />
            </div>
            
            <div className="modal-info">
              <h3>{selectedImage.title}</h3>
              {selectedImage.description && (
                <p>{selectedImage.description}</p>
              )}
              
              <div className="modal-meta">
                {selectedImage.category && (
                  <span>Category: {selectedImage.category}</span>
                )}
                <span>Date: {new Date(selectedImage.createdAt).toLocaleDateString()}</span>
              </div>
              
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div className="modal-tags">
                  {selectedImage.tags.map((tag, idx) => (
                    <span key={idx} className="modal-tag">{tag}</span>
                  ))}
                </div>
              )}
              
              {selectedImage.imageUrl && (
                <button 
                  className="download-btn"
                  onClick={() => window.open(selectedImage.imageUrl, '_blank')}
                >
                  <Download size={16} />
                  View Full Size
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GalleryPage;