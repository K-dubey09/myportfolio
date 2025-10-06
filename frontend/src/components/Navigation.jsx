import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, BookOpen, MessageSquare, Star, Video, LogIn, Settings, Award, Layers, BarChart3, GraduationCap, Images, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const __motionRefNav = typeof motion === 'undefined' ? null : motion; // linter usage hint
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Main navigation links matching admin panel structure
  const mainNavLinks = [
    { name: 'Home', target: 'top', icon: Home },
    { name: 'Services', target: 'services', icon: Layers },
    { name: 'Projects', target: 'projects', icon: Briefcase },
    { name: 'Experience', target: 'experience', icon: Briefcase },
    { name: 'Education', target: 'education', icon: GraduationCap },
    { name: 'Blogs', target: 'blogs', icon: BookOpen },
    { name: 'Contact', target: 'contact', icon: MessageSquare },
  ];

  const additionalPages = [
    { name: 'Gallery', path: '/gallery', icon: Images, protected: true },
    { name: 'Skills', path: '/skills', icon: Star, protected: true },
  ];

  const scrollToSection = useCallback((id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSectionClick = (target) => {
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      // Delay scroll until after navigation to home has rendered
      setTimeout(() => scrollToSection(target), 60);
    } else {
      scrollToSection(target);
    }
  };

  const goToPage = (item) => {
    if (item.protected && !user) {
      navigate('/login');
      return;
    }
    navigate(item.path);
  };

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
          {mainNavLinks.map((item, index) => (
            <motion.button
              key={item.target}
              onClick={() => handleSectionClick(item.target)}
              className="nav-link nav-btn"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </motion.button>
          ))}
          
          {user && (
            <>
              {additionalPages.map((item, index) => (
                <motion.button
                  key={item.path}
                  onClick={() => goToPage(item)}
                  className="nav-link nav-btn"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </motion.button>
              ))}
              
              {/* Admin button in nav-links */}
              {user.role === 'admin' && (
                <motion.button
                  onClick={() => navigate('/admin')}
                  className="nav-link nav-btn admin-link"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </motion.button>
              )}
              
              {/* Logout button in nav-links */}
              <motion.button
                onClick={logout}
                className="nav-logout"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.6 }}
                whileHover={{ scale: 1.05, backgroundColor: '#ff6b6b' }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={18} />
                <span>Logout</span>
              </motion.button>
            </>
          )}
          
          {!user && (
            <motion.button
              onClick={() => navigate('/login')}
              className="nav-login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={18} />
              <span>Login</span>
            </motion.button>
          )}
        </div>
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
    </motion.nav>
  );
};

export default Navigation;