import React, { useState, useEffect } from 'react';
import './NotificationsBell.css';

const NotificationsBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 5 minutes
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Skip if not authenticated
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/admin/notifications/unread-count`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      // Silently fail - user may not be authenticated
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/admin/notifications?status=unread`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      // Silently fail - user may not be authenticated
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/admin/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/admin/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      // Silently fail
    }
  };

  const triggerManualCheck = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to trigger content check');
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/admin/notifications/trigger-check`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('Content check triggered! Check your email for warnings.');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error triggering check:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'Just now';
    const date = new Date(timestamp._seconds * 1000);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="notifications-bell">
      <button className="bell-button" onClick={handleBellClick}>
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
          <div className="notifications-dropdown">
            <div className="dropdown-header">
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="mark-all-btn">
                  Mark all read
                </button>
              )}
            </div>

            <div className="notifications-list">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <p>🎉 All caught up!</p>
                  <small>No new notifications</small>
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon">⚠️</div>
                    <div className="notification-content">
                      <h4>Low Content Warning</h4>
                      <p>
                        {notification.sections && notification.sections.length} section(s) need attention
                      </p>
                      {notification.sections && (
                        <div className="sections-list">
                          {notification.sections.map((section, idx) => (
                            <span key={idx} className="section-tag">
                              {section.displayName} ({section.count}/{3})
                            </span>
                          ))}
                        </div>
                      )}
                      <small className="notification-time">
                        {formatDate(notification.createdAt)}
                      </small>
                    </div>
                    <button
                      className="close-notification"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="dropdown-footer">
              <button onClick={triggerManualCheck} className="trigger-check-btn">
                🔍 Check Now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
