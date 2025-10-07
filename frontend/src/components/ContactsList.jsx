import React, { useState, useEffect } from 'react';
import './ContactsList.css';

const API_BASE_URL = 'http://localhost:5000';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/contacts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#ff6b6b';
      case 'read': return '#4ecdc4';
      case 'replied': return '#45b7d1';
      case 'archived': return '#96ceb4';
      default: return '#6c5ce7';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'normal': return '#2ecc71';
      case 'low': return '#95a5a6';
      default: return '#3498db';
    }
  };

  if (loading) {
    return (
      <div className="contacts-loading">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contacts-error">
        <p>Error: {error}</p>
        <button onClick={fetchContacts} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h2>Contact Information</h2>
        <p className="contacts-count">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </p>
      </div>
      
      {contacts.length === 0 ? (
        <div className="no-contacts">
          <div className="no-contacts-icon">📭</div>
          <p>No contacts found</p>
          <small>Contact messages will appear here when submitted</small>
        </div>
      ) : (
        <div className="contacts-grid">
          {contacts.map((contact) => (
            <div key={contact._id} className="contact-card">
              <div className="contact-header">
                <div className="contact-title">
                  <h3>{contact.name}</h3>
                  <div className="contact-badges">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(contact.status) }}
                    >
                      {contact.status}
                    </span>
                    <span 
                      className="priority-badge" 
                      style={{ backgroundColor: getPriorityColor(contact.priority) }}
                    >
                      {contact.priority}
                    </span>
                  </div>
                </div>
                <span className="contact-date">
                  {formatDate(contact.createdAt)}
                </span>
              </div>
              
              <div className="contact-details">
                <div className="contact-item">
                  <strong>Email:</strong>
                  <a href={`mailto:${contact.email}`} className="contact-link">
                    {contact.email}
                  </a>
                </div>
                
                {contact.phone && (
                  <div className="contact-item">
                    <strong>Phone:</strong>
                    <a href={`tel:${contact.phone}`} className="contact-link">
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.company && (
                  <div className="contact-item">
                    <strong>Company:</strong>
                    <span>{contact.company}</span>
                  </div>
                )}
                
                <div className="contact-item">
                  <strong>Subject:</strong>
                  <span>{contact.subject}</span>
                </div>
                
                <div className="contact-item message-item">
                  <strong>Message:</strong>
                  <p className="contact-message">{contact.message}</p>
                </div>
                
                {contact.source && (
                  <div className="contact-item">
                    <strong>Source:</strong>
                    <span className="source-tag">{contact.source}</span>
                  </div>
                )}
                
                {contact.tags && contact.tags.length > 0 && (
                  <div className="contact-item">
                    <strong>Tags:</strong>
                    <div className="tags-container">
                      {contact.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {contact.notes && (
                  <div className="contact-item">
                    <strong>Notes:</strong>
                    <p className="contact-notes">{contact.notes}</p>
                  </div>
                )}
                
                {contact.replied && contact.repliedAt && (
                  <div className="contact-item replied-info">
                    <strong>Replied:</strong>
                    <span>✅ {formatDate(contact.repliedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsList;