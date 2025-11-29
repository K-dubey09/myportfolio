import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Calendar, MapPin, Award, Search } from 'lucide-react';
import './PagesStyles.css';

const EducationPage = () => {
  const { user } = useAuth();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState('');

  const fetchEducation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/education', {
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${user.token}` } : {})
        }
      });
      
      if (response.ok) {
        const json = await response.json();
        const educationArray = Array.isArray(json) ? json : (json.data || json.education || []);
        setEducation(educationArray);
        console.log('Education loaded:', educationArray);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch education: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch education:', error);
      setError(error.message);
      setEducation([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const filteredEducation = education.filter(edu => 
    edu.degree?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edu.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edu.field?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(edu => 
    filterDegree === '' || edu.degree === filterDegree
  );

  const degrees = [...new Set(education.map(edu => edu.degree))];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading education...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <GraduationCap size={64} />
          <h2>Error Loading Education</h2>
          <p>{error}</p>
          <button onClick={fetchEducation} className="retry-btn">
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
        <h1>Education & Qualifications</h1>
        <p>My academic journey and certifications</p>
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
            placeholder="Search education..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterDegree} 
          onChange={(e) => setFilterDegree(e.target.value)}
          className="filter-select"
        >
          <option value="">All Degrees</option>
          {degrees.map(degree => (
            <option key={degree} value={degree}>{degree}</option>
          ))}
        </select>
      </motion.div>

      <motion.div 
        className="education-timeline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredEducation.map((edu, index) => (
          <motion.div
            key={edu._id}
            className="timeline-item education-item"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="timeline-marker">
              <GraduationCap size={20} />
            </div>
            <div className="timeline-content">
              <div className="education-header">
                <h3>{edu.degree}</h3>
                <h4>{edu.field}</h4>
                <div className="education-meta">
                  <span className="institution">
                    <GraduationCap size={16} />
                    {edu.institution}
                  </span>
                  <span className="location">
                    <MapPin size={16} />
                    {edu.location}
                  </span>
                  <span className="duration">
                    <Calendar size={16} />
                    {new Date(edu.startDate).toLocaleDateString()} - 
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                  </span>
                </div>
              </div>
              
              {edu.gpa && (
                <div className="gpa">
                  <Award size={16} />
                  <span>GPA: {edu.gpa}</span>
                </div>
              )}
              
              {edu.description && (
                <p className="education-description">{edu.description}</p>
              )}
              
              {edu.achievements && edu.achievements.length > 0 && (
                <div className="achievements">
                  <h4>Achievements & Awards:</h4>
                  <ul>
                    {edu.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {edu.coursework && edu.coursework.length > 0 && (
                <div className="coursework">
                  <h4>Relevant Coursework:</h4>
                  <div className="course-tags">
                    {edu.coursework.map((course, idx) => (
                      <span key={idx} className="course-tag">{course}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredEducation.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No education records found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};

export default EducationPage;