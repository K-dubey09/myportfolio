import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Building, ExternalLink, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import './PagesStyles.css';

const ExperiencePage = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/experiences', {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch experiences: ${response.status}`);
      }
      
      const json = await response.json();
      // Handle both direct array and wrapped response formats
      const data = Array.isArray(json) ? json : (json.data || json.experiences || []);
      setExperiences(data);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      const errorMessage = error.message || 'Failed to load experiences';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const filteredExperiences = experiences.filter(exp => 
    exp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(exp => 
    filterCompany === '' || exp.company === filterCompany
  );

  const companies = [...new Set(experiences.map(exp => exp.company))];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading experiences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Building size={64} />
          <h2>Error Loading Experiences</h2>
          <p>{error}</p>
          <button onClick={fetchExperiences} className="retry-btn">
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
        <h1>Professional Experience</h1>
        <p>My career journey and professional achievements</p>
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
            placeholder="Search experiences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterCompany} 
          onChange={(e) => setFilterCompany(e.target.value)}
          className="filter-select"
        >
          <option value="">All Companies</option>
          {companies.map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
      </motion.div>

      <motion.div 
        className="experiences-timeline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredExperiences.map((experience, index) => (
          <motion.div
            key={experience._id}
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="experience-header">
                <h3>{experience.position}</h3>
                <div className="experience-meta">
                  <span className="company">
                    <Building size={16} />
                    {experience.company}
                  </span>
                  <span className="location">
                    <MapPin size={16} />
                    {experience.location}
                  </span>
                  <span className="duration">
                    <Calendar size={16} />
                    {new Date(experience.startDate).toLocaleDateString()} - 
                    {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}
                  </span>
                </div>
              </div>
              
              <p className="experience-description">{experience.description}</p>
              
              {experience.achievements && experience.achievements.length > 0 && (
                <div className="achievements">
                  <h4>Key Achievements:</h4>
                  <ul>
                    {experience.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {experience.technologies && experience.technologies.length > 0 && (
                <div className="technologies">
                  <h4>Technologies Used:</h4>
                  <div className="tech-tags">
                    {experience.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {experience.companyUrl && (
                <a 
                  href={experience.companyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="company-link"
                >
                  <ExternalLink size={16} />
                  Visit Company
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredExperiences.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No experiences found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};

export default ExperiencePage;