import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Star, Search, DollarSign, Clock } from 'lucide-react';
import './PagesStyles.css';

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
            {filteredServices.map((service, index) => (
              <div key={service._id} className="service-card">
                <div className="service-icon">
                  {service.icon || '🔧'}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                
                {service.category && (
                  <div className="service-category">
                    {service.category}
                  </div>
                )}

                {service.features && service.features.length > 0 && (
                  <div className="service-features-section">
                    <h4>What's Included:</h4>
                    <ul className="service-features">
                      {service.features.map((feature, featIndex) => (
                        <li key={featIndex}>{feature}</li>
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
                      <span>Starting at ${service.price}</span>
                    </div>
                  )}
                </div>

                {service.testimonials && service.testimonials.length > 0 && (
                  <div className="service-testimonial">
                    <Star size={16} fill="gold" />
                    <p>"{service.testimonials[0].text}"</p>
                    <span>- {service.testimonials[0].client}</span>
                  </div>
                )}

                {service.contactInfo && (
                  <div className="service-contact">
                    <a 
                      href={`mailto:${service.contactInfo}?subject=Inquiry about ${service.title}`}
                      className="contact-btn"
                    >
                      Get Quote
                    </a>
                  </div>
                )}
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