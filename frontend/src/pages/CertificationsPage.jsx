import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Search, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
import './PagesStyles.css';

const CertificationsPage = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCertifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/certifications', {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      const json = await response.json();
      const data = Array.isArray(json) ? json : (json.data || json.certifications || []);
      setCertifications(data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getStatus = (cert) => {
    if (!cert.expiryDate) return 'permanent';
    return isExpired(cert.expiryDate) ? 'expired' : 'active';
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIssuer = issuerFilter === 'all' || cert.issuer === issuerFilter;
    const status = getStatus(cert);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesIssuer && matchesStatus;
  });

  const issuers = ['all', ...new Set(certifications.map(cert => cert.issuer).filter(Boolean))];

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dedicated-page">
      <div className="page-header">
        <h1>Professional Certifications</h1>
        <p>Industry-recognized certifications and credentials</p>
      </div>

      <div className="page-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={issuerFilter}
          onChange={(e) => setIssuerFilter(e.target.value)}
        >
          {issuers.map(issuer => (
            <option key={issuer} value={issuer}>
              {issuer === 'all' ? 'All Issuers' : issuer}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="permanent">Permanent</option>
        </select>
      </div>

      {filteredCertifications.length === 0 ? (
        <div className="no-results">
          <Award size={64} />
          <p>No certifications found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="certifications-grid">
            {filteredCertifications.map((cert) => {
              const status = getStatus(cert);
              return (
                <div key={cert._id} className={`certification-card ${status}`}>
                  {cert.logo && (
                    <div className="cert-logo">
                      <img src={cert.logo} alt={cert.issuer} />
                    </div>
                  )}
                  
                  <div className="cert-content">
                    <div className="cert-status-badge">
                      <CheckCircle size={16} />
                      <span className={`status-${status}`}>
                        {status === 'active' ? 'Active' : 
                         status === 'expired' ? 'Expired' : 'Permanent'}
                      </span>
                    </div>
                    
                    <h3>{cert.name}</h3>
                    <p className="cert-issuer">{cert.issuer}</p>
                    
                    {cert.description && (
                      <p className="cert-description">{cert.description}</p>
                    )}

                    <div className="cert-meta">
                      <div className="cert-date">
                        <Calendar size={16} />
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                      
                      {cert.expiryDate && (
                        <div className={`cert-expiry ${isExpired(cert.expiryDate) ? 'expired' : ''}`}>
                          <Calendar size={16} />
                          <span>
                            {isExpired(cert.expiryDate) ? 'Expired: ' : 'Expires: '}
                            {new Date(cert.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {cert.credentialId && (
                      <div className="cert-credential">
                        <strong>Credential ID:</strong> {cert.credentialId}
                      </div>
                    )}

                    {cert.skills && cert.skills.length > 0 && (
                      <div className="cert-skills">
                        <h4>Skills Covered:</h4>
                        <div className="skill-tags">
                          {cert.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="cert-actions">
                      {cert.verificationUrl && (
                        <a 
                          href={cert.verificationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="cert-verify-btn"
                        >
                          <ExternalLink size={16} />
                          Verify Credential
                        </a>
                      )}
                      
                      {cert.certificateUrl && (
                        <a 
                          href={cert.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="cert-view-btn"
                        >
                          <Award size={16} />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="certifications-summary">
            <h3>Certification Statistics</h3>
            <div className="summary-stats">
              <div className="stat">
                <div className="stat-number">{certifications.length}</div>
                <div className="stat-label">Total Certifications</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {certifications.filter(cert => getStatus(cert) === 'active').length}
                </div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {certifications.filter(cert => getStatus(cert) === 'permanent').length}
                </div>
                <div className="stat-label">Permanent</div>
              </div>
              <div className="stat">
                <div className="stat-number">{issuers.length - 1}</div>
                <div className="stat-label">Issuers</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificationsPage;