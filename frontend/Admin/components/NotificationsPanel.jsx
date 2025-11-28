import React, { useState, useEffect, useCallback } from 'react';
import './NotificationsPanel.css';

const NotificationsPanel = ({ token }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });

  const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        return;
      }
      
      console.log('Fetching notifications with filter:', filter);
      console.log('API URL:', `${API_URL}/api/admin/notifications?status=${filter}`);
      
      const response = await fetch(
        `${API_URL}/api/admin/notifications?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Received data:', data);
      console.log('Notifications array:', data.notifications);
      
      setNotifications(data.notifications || []);
      
      // Calculate stats
      const total = data.notifications?.length || 0;
      const unread = data.notifications?.filter(n => !n.read).length || 0;
      const read = total - unread;
      
      console.log('Stats - Total:', total, 'Unread:', unread, 'Read:', read);
      
      setStats({ total, unread, read });
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token, filter, API_URL]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      if (!token) return;
      
      const response = await fetch(
        `${API_URL}/api/admin/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!token) return;
      
      const response = await fetch(
        `${API_URL}/api/admin/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      // Update local state
      setNotifications(notifications.map(n => ({ 
        ...n, 
        read: true, 
        readAt: new Date() 
      })));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      if (!token) return;
      
      const response = await fetch(
        `${API_URL}/api/admin/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      // Update stats
      setStats(prev => ({
        total: prev.total - 1,
        unread: deletedNotification.read ? prev.unread : prev.unread - 1,
        read: deletedNotification.read ? prev.read - 1 : prev.read
      }));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleTriggerCheck = async () => {
    try {
      if (!token) {
        alert('Please log in to trigger content check');
        return;
      }
      
      const response = await fetch(
        `${API_URL}/api/admin/notifications/trigger-check`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger check');
      }

      const result = await response.json();
      
      // Refresh notifications
      await fetchNotifications();
      
      alert(result.message || 'Content check completed');
    } catch (err) {
      console.error('Error triggering check:', err);
      alert('Failed to trigger content check');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      searchTerm === '' ||
      notification.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sections?.some(s => 
        s.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="notifications-panel">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-panel">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchNotifications} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-panel">
      <div className="panel-header">
        <div className="header-top">
          <h2>📧 Email Notifications</h2>
          <div className="header-actions">
            <button 
              onClick={handleTriggerCheck} 
              className="trigger-button"
              title="Manually trigger content check"
            >
              🔍 Check Now
            </button>
            {stats.unread > 0 && (
              <button 
                onClick={handleMarkAllAsRead} 
                className="mark-all-button"
              >
                ✓ Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item unread">
            <span className="stat-value">{stats.unread}</span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat-item read">
            <span className="stat-value">{stats.read}</span>
            <span className="stat-label">Read</span>
          </div>
        </div>

        <div className="controls-bar">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread {stats.unread > 0 && `(${stats.unread})`}
            </button>
            <button 
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read {stats.read > 0 && `(${stats.read})`}
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notifications found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : filter === 'unread'
                ? 'All caught up! No unread notifications.'
                : 'No notifications to display.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-header">
                <div className="notification-type">
                  <span className="type-icon">⚠️</span>
                  <span className="type-text">Low Content Warning</span>
                  {!notification.read && <span className="unread-badge">New</span>}
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="action-btn mark-read-btn"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="action-btn delete-btn"
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="notification-body">
                <div className="recipient-info">
                  <strong>To:</strong> {notification.recipient?.email || 'N/A'}
                  {notification.recipient?.name && (
                    <span className="recipient-name"> ({notification.recipient.name})</span>
                  )}
                </div>

                <div className="sections-affected">
                  <strong>Affected Sections ({notification.sections?.length || 0}):</strong>
                  <div className="sections-grid">
                    {notification.sections?.map((section, index) => (
                      <div key={index} className="section-tag">
                        <span className="section-name">{section.displayName}</span>
                        <span className="section-count">
                          {section.count}/{section.count + section.needed} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notification-footer">
                  <div className="timestamps">
                    <span className="timestamp sent">
                      📤 Sent: {formatTimestamp(notification.sentAt || notification.createdAt)}
                    </span>
                    {notification.read && notification.readAt && (
                      <span className="timestamp read-time">
                        👁️ Read: {formatTimestamp(notification.readAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
