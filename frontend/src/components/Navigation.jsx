import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, BookOpen, MessageSquare, Star, Video, LogIn, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, clearRateLimit } = useAuth();

  const handleClearRateLimit = async () => {
    if (user && user.role === 'admin') {
      try {
        const result = await clearRateLimit();
        if (result.success) {
          alert('Rate limits cleared successfully!');
        } else {
          alert('Failed to clear rate limits: ' + result.error);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'Projects', path: '/projects', icon: Briefcase, public: true },
    { name: 'Blogs', path: '/blogs', icon: BookOpen, public: true },
    { name: 'Testimonials', path: '/testimonials', icon: MessageSquare, public: true },
    ...(user ? [
      { name: 'Vlogs', path: '/vlogs', icon: Video, public: false },
      ...(user.role === 'admin' ? [
        { name: 'Admin Panel', path: '/admin', icon: Settings, public: false }
      ] : [])
    ] : [
      { name: 'Login', path: '/login', icon: LogIn, public: true }
    ])
  ];

  return (
    <motion.nav 
      className="main-navigation"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-container">
        <motion.div 
          className="nav-brand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <a href="/" className="brand-link">
            <User size={24} />
            <span>Portfolio</span>
          </a>
        </motion.div>

        <div className="nav-links">
          {navigationItems.map((item, index) => (
            <motion.a
              key={item.path}
              href={item.path}
              className="nav-link"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, color: '#4a90e2' }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </motion.a>
          ))}
          
          {user && (
            <motion.button
              onClick={logout}
              className="nav-logout"
              whileHover={{ scale: 1.05, backgroundColor: '#ff6b6b' }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          )}

          {user && user.role === 'admin' && (
            <motion.button
              onClick={handleClearRateLimit}
              className="nav-logout"
              style={{ backgroundColor: '#ffa500', borderColor: '#ffa500' }}
              whileHover={{ scale: 1.05, backgroundColor: '#ff8c00' }}
              whileTap={{ scale: 0.95 }}
              title="Clear Rate Limits"
            >
              Clear Limits
            </motion.button>
          )}
        </div>

        {user && (
          <motion.div 
            className="user-info"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.username} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-details">
              <span className="username">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;