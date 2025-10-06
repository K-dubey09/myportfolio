import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Code, Star, Search, TrendingUp, BarChart } from 'lucide-react';
import './PagesStyles.css';

const SkillsPage = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('proficiency'); // proficiency or name

  const fetchSkills = React.useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/skills', {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = skills.filter(skill => 
    skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(skill => 
    filterCategory === '' || skill.category === filterCategory
  ).sort((a, b) => {
    if (sortBy === 'proficiency') {
      return b.proficiency - a.proficiency;
    }
    return a.name.localeCompare(b.name);
  });

  const categories = [...new Set(skills.map(skill => skill.category))];

  const getProficiencyLabel = (level) => {
    if (level >= 90) return 'Expert';
    if (level >= 75) return 'Advanced';
    if (level >= 60) return 'Intermediate';
    if (level >= 40) return 'Beginner';
    return 'Learning';
  };

  const getProficiencyColor = (level) => {
    if (level >= 90) return '#10b981'; // green
    if (level >= 75) return '#3b82f6'; // blue
    if (level >= 60) return '#f59e0b'; // yellow
    if (level >= 40) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading skills...</p>
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
        <h1>Skills & Technologies</h1>
        <p>My technical expertise and proficiency levels</p>
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
            placeholder="Search skills..."
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

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="proficiency">Sort by Proficiency</option>
          <option value="name">Sort by Name</option>
        </select>
      </motion.div>

      <motion.div 
        className="skills-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredSkills.map((skill, index) => (
          <motion.div
            key={skill._id}
            className="skill-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="skill-header">
              <div className="skill-icon">
                {skill.category === 'Programming' && <Code size={24} />}
                {skill.category === 'Framework' && <TrendingUp size={24} />}
                {skill.category === 'Tools' && <BarChart size={24} />}
                {!['Programming', 'Framework', 'Tools'].includes(skill.category) && <Star size={24} />}
              </div>
              <h3>{skill.name}</h3>
              <span className="skill-category">{skill.category}</span>
            </div>
            
            <div className="skill-proficiency">
              <div className="proficiency-bar">
                <div 
                  className="proficiency-fill"
                  style={{ 
                    width: `${skill.proficiency}%`,
                    backgroundColor: getProficiencyColor(skill.proficiency)
                  }}
                ></div>
              </div>
              <div className="proficiency-info">
                <span className="proficiency-percentage">{skill.proficiency}%</span>
                <span 
                  className="proficiency-label"
                  style={{ color: getProficiencyColor(skill.proficiency) }}
                >
                  {getProficiencyLabel(skill.proficiency)}
                </span>
              </div>
            </div>

            {skill.experience && (
              <div className="skill-experience">
                <span>Experience: {skill.experience}</span>
              </div>
            )}

            {skill.description && (
              <p className="skill-description">{skill.description}</p>
            )}

            {skill.projects && skill.projects.length > 0 && (
              <div className="skill-projects">
                <h4>Used in projects:</h4>
                <div className="project-tags">
                  {skill.projects.slice(0, 3).map((project, idx) => (
                    <span key={idx} className="project-tag">{project}</span>
                  ))}
                  {skill.projects.length > 3 && (
                    <span className="project-tag more">+{skill.projects.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {filteredSkills.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No skills found matching your criteria.</p>
        </motion.div>
      )}

      <motion.div 
        className="skills-summary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3>Skills Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-number">{skills.length}</span>
            <span className="stat-label">Total Skills</span>
          </div>
          <div className="stat">
            <span className="stat-number">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat">
            <span className="stat-number">{skills.filter(s => s.proficiency >= 75).length}</span>
            <span className="stat-label">Advanced+</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillsPage;