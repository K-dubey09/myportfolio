import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeSelector = () => {
  const { theme, isAnimated, setSpecificTheme, toggleAnimations, themes } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const themeLabels = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    blue: '🌊 Ocean',
    purple: '🌌 Cosmic',
    green: '🌿 Nature'
  }

  const currentThemeLabel = themeLabels[theme]

  const handleThemeSelect = (selectedTheme) => {
    setSpecificTheme(selectedTheme)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <div className="theme-dropdown-container">
        {/* Theme Dropdown */}
        <div className="theme-dropdown">
          <button
            onClick={toggleDropdown}
            className="theme-dropdown-trigger"
            title="Select Theme"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <span className="current-theme">{currentThemeLabel}</span>
            <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          
          {isDropdownOpen && (
            <div className="theme-dropdown-menu" role="menu">
              {themes.map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeSelect(themeOption)}
                  className={`theme-option ${theme === themeOption ? 'active' : ''}`}
                  title={themeLabels[themeOption]}
                  role="menuitem"
                >
                  <span className="theme-icon">{themeLabels[themeOption].split(' ')[0]}</span>
                  <span className="theme-name">{themeLabels[themeOption].split(' ')[1]}</span>
                  {theme === themeOption && <span className="active-indicator">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Animation Toggle */}
        <div className="animation-control">
          <button
            onClick={toggleAnimations}
            className={`animation-btn ${isAnimated ? 'active' : ''}`}
            title={isAnimated ? 'Disable Animations' : 'Enable Animations'}
            aria-label={isAnimated ? 'Disable Animations' : 'Enable Animations'}
          >
            <span className="animation-icon">{isAnimated ? '🎬' : '⏸️'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeSelector