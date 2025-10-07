import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Code, Star, Search, TrendingUp, BarChart } from 'lucide-react';
import './PagesStyles.css';

const SkillsPage = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('level'); // level or name

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/skills', {
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${user.token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const skillsArray = Array.isArray(data) ? data : (data.skills || []);
        setSkills(skillsArray);
        console.log('Skills loaded:', skillsArray);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch skills: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      setError(error.message);
      setSkills([]);
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
    if (sortBy === 'level') {
      // Map level strings to numbers for sorting
      const levelMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
      return (levelMap[b.level] || 0) - (levelMap[a.level] || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const categories = [...new Set(skills.map(skill => skill.category))];

  const getLevelColor = (level) => {
    switch(level) {
      case 'Expert': return '#10b981';
      case 'Advanced': return '#3b82f6';
      case 'Intermediate': return '#f59e0b';
      case 'Beginner': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Code size={64} />
          <h2>Error Loading Skills</h2>
          <p>{error}</p>
          <button onClick={fetchSkills} className="retry-btn">
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
          <option value="level">Sort by Level</option>
          <option value="name">Sort by Name</option>
        </select>
      </motion.div>

      {filteredSkills.length === 0 ? (
        <div className="no-results">
          <Code size={64} />
          <p>No skills found matching your criteria.</p>
        </div>
      ) : (
        <>
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
              >
                <div className="skill-header">
                  <div className="skill-icon">
                    <Code size={24} />
                  </div>
                  <h3>{skill.name}</h3>
                </div>

                <div className="skill-level">
                  <div 
                    className="level-badge"
                    style={{ backgroundColor: getLevelColor(skill.level) }}
                  >
                    {skill.level}
                  </div>
                </div>

                <div className="skill-category">
                  <span className="category-badge">{skill.category}</span>
                </div>

                <div className="skill-stats">
                  <div className="stat">
                    <Star size={16} />
                    <span>Level: {skill.level}</span>
                  </div>
                  <div className="stat">
                    <TrendingUp size={16} />
                    <span>Category: {skill.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="skills-summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3>Skills Overview</h3>
            <div className="summary-stats">
              <div className="stat">
                <div className="stat-number">{skills.length}</div>
                <div className="stat-label">Total Skills</div>
              </div>
              <div className="stat">
                <div className="stat-number">{categories.length}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {skills.filter(s => s.level === 'Expert').length}
                </div>
                <div className="stat-label">Expert Level</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {skills.filter(s => s.level === 'Advanced').length}
                </div>
                <div className="stat-label">Advanced Level</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SkillsPage;