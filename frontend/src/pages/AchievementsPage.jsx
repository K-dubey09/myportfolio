import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, Search, Calendar, Target } from 'lucide-react';
import './PagesStyles.css';

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/achievements`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      const json = await response.json();
      if (Array.isArray(json)) setAchievements(json);
      else setAchievements(json.achievements || json.data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const achievementYear = achievement.date ? new Date(achievement.date).getFullYear().toString() : '';
    const matchesYear = yearFilter === 'all' || achievementYear === yearFilter;
    return matchesSearch && matchesCategory && matchesYear;
  });

  const categories = ['all', ...new Set(achievements.map(achievement => achievement.category).filter(Boolean))];
  const years = ['all', ...new Set(achievements.map(achievement => 
    achievement.date ? new Date(achievement.date).getFullYear().toString() : ''
  ).filter(Boolean)).sort((a, b) => b - a)];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dedicated-page">
      <div className="page-header">
        <h1>Achievements & Milestones</h1>
        <p>Key accomplishments and milestones throughout my journey</p>
      </div>

      <div className="page-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search achievements..."
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

        <select
          className="filter-select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year === 'all' ? 'All Years' : year}
            </option>
          ))}
        </select>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="no-results">
          <Trophy size={64} />
          <p>No achievements found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => (
              <div key={achievement._id} className="achievement-card">
                <div className="achievement-icon">
                  {achievement.icon || '🏆'}
                </div>
                
                {achievement.number || achievement.value ? (
                  <div className="achievement-number">
                    {achievement.number || achievement.value}
                    {achievement.unit && <span className="unit">{achievement.unit}</span>}
                  </div>
                ) : null}
                
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                
                {achievement.category && (
                  <div className="achievement-category">
                    {achievement.category}
                  </div>
                )}

                <div className="achievement-meta">
                  {achievement.date && (
                    <div className="achievement-date">
                      <Calendar size={16} />
                      <span>{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {achievement.organization && (
                    <div className="achievement-org">
                      <Target size={16} />
                      <span>{achievement.organization}</span>
                    </div>
                  )}
                </div>

                {achievement.details && achievement.details.length > 0 && (
                  <div className="achievement-details">
                    <h4>Details:</h4>
                    <ul>
                      {achievement.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {achievement.impact && (
                  <div className="achievement-impact">
                    <h4>Impact:</h4>
                    <p>{achievement.impact}</p>
                  </div>
                )}

                {achievement.verificationUrl && (
                  <div className="achievement-verification">
                    <a 
                      href={achievement.verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="verify-btn"
                    >
                      <Star size={16} />
                      Verify Achievement
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="achievements-summary">
            <h3>Achievement Statistics</h3>
            <div className="summary-stats">
              <div className="stat">
                <div className="stat-number">{achievements.length}</div>
                <div className="stat-label">Total Achievements</div>
              </div>
              <div className="stat">
                <div className="stat-number">{categories.length - 1}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat">
                <div className="stat-number">{years.length - 1}</div>
                <div className="stat-label">Years Active</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {achievements.filter(a => a.verificationUrl).length}
                </div>
                <div className="stat-label">Verified</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementsPage;