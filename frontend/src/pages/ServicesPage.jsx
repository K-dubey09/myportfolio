import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Star, Search, DollarSign, Clock } from 'lucide-react';
import './PagesStyles.css';

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/services', {
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${user.token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both array response and object with services property
        const servicesArray = Array.isArray(data) ? data : (data.services || []);
        setServices(servicesArray);
        console.log('Services loaded:', servicesArray);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch services: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(services.map(service => service.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Settings size={64} />
          <h2>Error Loading Services</h2>
          <p>{error}</p>
          <button onClick={fetchServices} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dedicated-page">
      <div className="page-header">
        <h1>My Services</h1>
        <p>Professional services I offer to help bring your projects to life</p>
      </div>

      <div className="page-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {filteredServices.length === 0 ? (
        <div className="no-results">
          <Settings size={64} />
          <p>No services found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div key={service._id} className="service-card">
                {service.image && (
                  <div className="service-image">
                    <img 
                      src={service.image.startsWith('http') ? service.image : `http://localhost:5000/api/files/${service.image}`} 
                      alt={service.title}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                
                <div className="service-icon">
                  {service.icon || '🔧'}
                </div>
                
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  
                  {service.category && (
                    <div className="service-category">
                      <span className="category-badge">{service.category}</span>
                      {service.featured && <span className="featured-badge">⭐ Featured</span>}
                    </div>
                  )}

                  {service.features && service.features.length > 0 && (
                    <div className="service-features-section">
                      <h4>What's Included:</h4>
                      <ul className="service-features">
                        {service.features.map((feature, featIndex) => (
                          <li key={featIndex}>✓ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="service-details">
                    {service.duration && (
                      <div className="service-duration">
                        <Clock size={16} />
                        <span>{service.duration}</span>
                      </div>
                    )}
                    
                    {service.price && (
                      <div className="service-price">
                        <DollarSign size={16} />
                        <span>{service.price}</span>
                      </div>
                    )}
                  </div>

                  {service.images && service.images.length > 0 && (
                    <div className="service-gallery">
                      <h5>Portfolio Examples:</h5>
                      <div className="image-gallery">
                        {service.images.slice(0, 3).map((img, imgIndex) => (
                          <img 
                            key={imgIndex} 
                            src={img.startsWith('http') ? img : `http://localhost:5000/api/files/${img}`}
                            alt={`${service.title} example ${imgIndex + 1}`}
                            className="gallery-thumb"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="service-actions">
                    <button className="contact-btn primary">
                      Get Quote
                    </button>
                    <button className="contact-btn secondary">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="services-summary">
            <h3>Service Statistics</h3>
            <div className="summary-stats">
              <div className="stat">
                <div className="stat-number">{services.length}</div>
                <div className="stat-label">Total Services</div>
              </div>
              <div className="stat">
                <div className="stat-number">{categories.length - 1}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {services.filter(s => s.featured).length}
                </div>
                <div className="stat-label">Featured</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {services.filter(s => s.price).length}
                </div>
                <div className="stat-label">With Pricing</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesPage;