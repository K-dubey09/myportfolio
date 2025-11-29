import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('portfolio-theme')
    return savedTheme || 'light'
  })

  const [isAnimated, setIsAnimated] = useState(() => {
    // Get animation preference from localStorage or default to true
    const savedAnimations = localStorage.getItem('portfolio-animations')
    return savedAnimations !== 'false'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    // Apply animation preference to document
    document.documentElement.setAttribute('data-animations', isAnimated ? 'enabled' : 'disabled')
    localStorage.setItem('portfolio-animations', isAnimated.toString())
  }, [isAnimated])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const themes = ['light', 'dark', 'blue', 'purple', 'green']
      const currentIndex = themes.indexOf(prevTheme)
      const nextIndex = (currentIndex + 1) % themes.length
      return themes[nextIndex]
    })
  }

  const setSpecificTheme = (newTheme) => {
    const themes = ['light', 'dark', 'blue', 'purple', 'green']
    if (themes.includes(newTheme)) {
      setTheme(newTheme)
    }
  }

  const toggleAnimations = () => {
    setIsAnimated(prev => !prev)
  }

  const value = {
    theme,
    isAnimated,
    toggleTheme,
    setSpecificTheme,
    toggleAnimations,
    themes: ['light', 'dark', 'blue', 'purple', 'green']
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}