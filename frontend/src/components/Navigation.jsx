import React, { useCallback, useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Briefcase, BookOpen, MessageSquare, Star, LogIn, Settings,
  GraduationCap, Images, Palette, ChevronDown, ChevronLeft, LogOut, UserCircle, Layers, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, isAnimated, setSpecificTheme, toggleAnimations } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suppressMobileControls, setSuppressMobileControls] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const themeTimeoutRef = useRef(null);

  useEffect(() => {
    // copy refs to locals so cleanup uses stable values (avoids linter warning)
    const dtRef = dropdownTimeoutRef;
    const ttRef = themeTimeoutRef;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsThemeDropdownOpen(false);
        setShowAdvanced(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      const dt = dtRef.current;
      const tt = ttRef.current;
      if (dt) clearTimeout(dt);
      if (tt) clearTimeout(tt);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Listen for admin mobile menu open events so we can suppress our own mobile controls
  useEffect(() => {
    const onAdminMobile = (e) => {
      try {
        setSuppressMobileControls(Boolean(e?.detail));
      } catch {
        setSuppressMobileControls(false);
      }
    };

    window.addEventListener('admin-mobile-open', onAdminMobile);
    return () => window.removeEventListener('admin-mobile-open', onAdminMobile);
  }, []);

  const themeLabels = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    blue: '🌊 Ocean',
    purple: '🌌 Cosmic',
    green: '🌿 Nature'
  };

  const handleThemeSelect = (selectedTheme) => {
    setSpecificTheme(selectedTheme);
    setIsThemeDropdownOpen(false);
    setIsDropdownOpen(false);
    setShowAdvanced(false);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      setIsThemeDropdownOpen(false);
      setShowAdvanced(false);
    }, 300);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsThemeDropdownOpen(false);
    setShowAdvanced(false);
  };

  // Dropdown menu items (conditionally include Profile based on user role)
  const dropdownItems = [
    // Only show Profile option for non-admin users 
    // (admin users should use the Profile tab in the admin panel instead)
    ...(user && user.role !== 'admin' ? [{ name: 'Profile', icon: UserCircle, action: () => navigate('/profile') }] : []),
    { name: 'Settings', icon: Settings, action: () => navigate('/settings') },
    {
      name: 'Theme',
      icon: Palette,
      action: () => setIsThemeDropdownOpen((prev) => !prev),
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
      setTimeout(() => scrollToSection(target), 60);
    } else {
      scrollToSection(target);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const goToPage = (item) => {
    if (item.protected && !user) {
      navigate('/login');
      return;
    }
    navigate(item.path);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
  <motion.nav className="main-navigation" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="nav-container">
          <motion.div className="nav-brand" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="/" className="brand-link">
              <User size={24} />
              <span>Portfolio</span>
            </a>
          </motion.div>

          {/* Mobile Menu Toggle */}
          {!suppressMobileControls && (
            <motion.button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          )}

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
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

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMobileMenu}
            >
              <motion.div
                className="mobile-nav-menu"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mobile-nav-header">
                  <h3>Navigation</h3>
                  {!suppressMobileControls && (
                    <button onClick={toggleMobileMenu} className="mobile-close-btn">
                      <X size={24} />
                    </button>
                  )}
                </div>

                <div className="mobile-nav-links">
                  {mainNavLinks.map((item, index) => (
                    <motion.button
                      key={item.target}
                      onClick={() => handleSectionClick(item.target)}
                      className="mobile-nav-link"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </motion.button>
                  ))}

                  {user && (
                    <>
                      <div className="mobile-nav-divider"></div>
                      {additionalPages.map((item, index) => (
                        <motion.button
                          key={item.path}
                          onClick={() => goToPage(item)}
                          className="mobile-nav-link"
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: (mainNavLinks.length + index) * 0.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon size={20} />
                          <span>{item.name}</span>
                        </motion.button>
                      ))}

                      {user.role === 'admin' && (
                        <motion.button
                          onClick={() => navigate('/admin')}
                          className="mobile-nav-link admin-link"
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: (mainNavLinks.length + additionalPages.length) * 0.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Settings size={20} />
                          <span>Admin Panel</span>
                        </motion.button>
                      )}

                      <div className="mobile-nav-divider"></div>

                      {/* Mobile User Menu */}
                      {dropdownItems.map((item, index) => (
                        <motion.button
                          key={item.name}
                          onClick={() => {
                            item.action?.();
                            if (!item.isThemeSelector) {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`mobile-nav-link ${item.danger ? 'danger' : ''}`}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: (mainNavLinks.length + additionalPages.length + 1 + index) * 0.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon size={20} />
                          <span>{item.name}</span>
                          {item.isToggler && (
                            <div className={`mobile-toggle ${item.isActive ? 'active' : ''}`}>
                              <div className="mobile-toggle-slider"></div>
                            </div>
                          )}
                        </motion.button>
                      ))}

                      {/* Mobile Theme Selector */}
                      <div className="mobile-theme-section">
                        <h4>Themes</h4>
                        <div className="mobile-theme-grid">
                          {Object.entries(themeLabels).map(([key, label]) => (
                            <motion.button
                              key={key}
                              onClick={() => {
                                handleThemeSelect(key);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`mobile-theme-option ${theme === key ? 'active' : ''}`}
                              whileTap={{ scale: 0.95 }}
                            >
                              {label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {!user && (
                    <>
                      <div className="mobile-nav-divider"></div>
                      <motion.button
                        onClick={() => {
                          navigate('/login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="mobile-nav-link login-link"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: mainNavLinks.length * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogIn size={20} />
                        <span>Login</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Desktop User Dropdown */}
      {user && (
        <div
          className="user-dropdown desktop-only"
          ref={dropdownRef}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          style={{ position: 'relative', zIndex: 1000 }}
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
            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
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
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  minWidth: '160px',
                  maxWidth: '200px',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  zIndex: 9999
                }}
              >
                {dropdownItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className={`dropdown-item ${item.danger ? 'danger' : ''} ${item.isToggler ? 'toggler' : ''} ${item.hasSubmenu ? 'has-submenu' : ''} ${item.isThemeSelector && isThemeDropdownOpen ? 'submenu-open' : ''}`}
                    onClick={() => {
                      item.action?.();
                      if (item.isThemeSelector) {
                        setIsThemeDropdownOpen((prev) => !prev);
                      }
                    }}
                    onMouseEnter={item.isThemeSelector ? () => setIsThemeDropdownOpen(true) : undefined}
                    onMouseLeave={item.isThemeSelector ? () => setTimeout(() => setIsThemeDropdownOpen(false), 300) : undefined}
                    whileHover={{ backgroundColor: item.danger ? '#fee2e2' : '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ position: 'relative' }}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>

                    {item.hasSubmenu && (
                      <>
                        <ChevronLeft size={16} className="submenu-arrow" />
                        <AnimatePresence>
                          {item.isThemeSelector && isThemeDropdownOpen && (
                            <motion.div
                              className="theme-submenu"
                              style={{
                                position: 'absolute',
                                left: '-100%',
                                top: '0',
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                padding: '12px',
                                zIndex: 9999,
                                minWidth: '160px',
                                maxWidth: '200px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                borderRadius: '8px'
                              }}
                              initial={{ opacity: 0, x: 10, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: 10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => e.stopPropagation()}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                setTimeout(() => setIsThemeDropdownOpen(false), 300);
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                                <h4 style={{ marginBottom: '8px' }}>Select Theme</h4>
                                {Object.entries(themeLabels).map(([key, label]) => (
                                  <div
                                    key={key}
                                    style={{ position: 'relative' }}
                                    onMouseEnter={() => key === 'purple' && setShowAdvanced(true)}
                                    onMouseLeave={() => key === 'purple' && setTimeout(() => setShowAdvanced(false), 300)}
                                  >
                                    <button
                                      onClick={() => handleThemeSelect(key)}
                                      style={{
                                        padding: '8px 12px',
                                        backgroundColor: theme === key ? '#e0f7e9' : '#f9f9f9',
                                        border: 'none',
                                        borderRadius: '4px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontWeight: theme === key ? 'bold' : 'normal',
                                        width: '100%'
                                      }}
                                    >
                                      {label}
                                    </button>

                                    {key === 'purple' && showAdvanced && (
                                      <motion.div
                                        className="advanced-submenu"
                                        style={{
                                          position: 'absolute',
                                          right: '100%',
                                          top: '0',
                                          backgroundColor: '#fff',
                                          border: '1px solid #ccc',
                                          padding: '12px',
                                          zIndex: 9999,
                                          minWidth: '140px',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                          borderRadius: '8px'
                                        }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <h4 style={{ marginBottom: '8px' }}>Advanced</h4>
                                        <button onClick={() => console.log('Cosmic Dust')}>Cosmic Dust</button>
                                        <button onClick={() => console.log('Nebula Pulse')}>Nebula Pulse</button>
                                      </motion.div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Navigation;