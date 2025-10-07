import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Briefcase, BookOpen, MessageSquare, Star, Video, LogIn, Settings, Award, Layers, BarChart3, GraduationCap, Images, ShieldCheck, Palette, ChevronDown, ChevronLeft, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const __motionRefNav = typeof motion === 'undefined' ? null : motion; // linter usage hint
  const { user, logout } = useAuth();
  const { theme, isAnimated, setSpecificTheme, toggleAnimations, themes } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const themeTimeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clear any pending timeouts on cleanup
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (themeTimeoutRef.current) {
        clearTimeout(themeTimeoutRef.current);
      }
    };
  }, []);

  // Theme labels for display
  const themeLabels = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    blue: '🌊 Ocean',
    purple: '🌌 Cosmic',
    green: '🌿 Nature'
  };

  // Handle theme selection
  const handleThemeSelect = (selectedTheme) => {
    setSpecificTheme(selectedTheme);
    setIsThemeDropdownOpen(false);
    setIsDropdownOpen(false);
  };

  // Handle mouse enter for theme dropdown
  const handleThemeMouseEnter = (e) => {
    e.stopPropagation();
    if (themeTimeoutRef.current) {
      clearTimeout(themeTimeoutRef.current);
    }
    setIsThemeDropdownOpen(true);
  };

  // Handle mouse leave for theme dropdown
  const handleThemeMouseLeave = (e) => {
    e.stopPropagation();
    themeTimeoutRef.current = setTimeout(() => {
      setIsThemeDropdownOpen(false);
    }, 300); // 300ms delay before hiding
  };

  // Handle mouse enter for main dropdown
  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  // Handle mouse leave for main dropdown
  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      setIsThemeDropdownOpen(false);
    }, 300); // 300ms delay before hiding
  };

  // Touch and click handler for dropdown (backup for touch devices)
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsThemeDropdownOpen(false);
  };

  // Dropdown menu items
  const dropdownItems = [
    { name: 'Profile', icon: UserCircle, action: () => navigate('/profile') },
    { name: 'Settings', icon: Settings, action: () => navigate('/settings') },
    { 
      name: 'Theme', 
      icon: Palette, 
      action: () => {}, // No action needed for hover-triggered dropdown
      isThemeSelector: true,
      hasSubmenu: true
    },
    { 
      name: 'Animations', 
      icon: Star, 
      action: toggleAnimations,
      isToggler: true,
      isActive: isAnimated
    },
    { name: 'Logout', icon: LogOut, action: logout, danger: true }
  ];

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
        <div 
          className="user-dropdown" 
          ref={dropdownRef}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <motion.div 
            className="user-info"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleDropdownToggle}
            onTouchEnd={handleDropdownToggle}
            style={{ cursor: 'pointer', touchAction: 'manipulation' }}
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
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                className="user-dropdown-menu"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {dropdownItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className={`dropdown-item ${item.danger ? 'danger' : ''} ${item.isToggler ? 'toggler' : ''} ${item.hasSubmenu ? 'has-submenu' : ''}`}
                    onClick={item.action}
                    onMouseEnter={item.hasSubmenu ? handleThemeMouseEnter : undefined}
                    onMouseLeave={item.hasSubmenu ? handleThemeMouseLeave : undefined}
                    whileHover={{ backgroundColor: item.danger ? '#fee2e2' : '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                    {item.isToggler && (
                      <div className={`theme-toggle ${item.isActive ? 'active' : ''}`}>
                        <div className="toggle-slider"></div>
                      </div>
                    )}
                    {item.hasSubmenu && (
                      <>
                        <ChevronLeft size={16} className="submenu-arrow" />
                        {item.isThemeSelector && isThemeDropdownOpen && (
                          <motion.div
                            className="theme-submenu"
                            initial={{ opacity: 0, x: 10, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => e.stopPropagation()}
                            onMouseLeave={(e) => e.stopPropagation()}
                          >
                            <div className="theme-submenu-header">
                              <Palette size={16} />
                              <span>Select Theme</span>
                            </div>
                            <div className="theme-options">
                              {themes.map((themeOption) => (
                                <motion.div
                                  key={themeOption}
                                  className={`theme-option ${theme === themeOption ? 'active' : ''}`}
                                  onClick={() => handleThemeSelect(themeOption)}
                                  whileHover={{ backgroundColor: '#f8f9fa' }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="theme-icon">{themeLabels[themeOption].split(' ')[0]}</span>
                                  <span className="theme-name">{themeLabels[themeOption].split(' ')[1]}</span>
                                  {theme === themeOption && <span className="active-indicator">✓</span>}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.nav>
  );
};

export default Navigation;