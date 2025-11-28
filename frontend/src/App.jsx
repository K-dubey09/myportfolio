import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Navigation from './components/Navigation'
import PortfolioSite from './components/PortfolioSite'
import AdminPanel from '../Admin/AdminPanel'
import RegistrationPage from './components/RegistrationPage'
import EmailVerification from './components/EmailVerification'
import EmailVerificationHandler from './components/EmailVerificationHandler';
import ProfileCompletionPage from './components/ProfileCompletionPage'
import Login from './components/Login'
import ProjectsPage from './pages/ProjectsPage'
import BlogsPage from './pages/BlogsPage'
import TestimonialsPage from './pages/TestimonialsPage'
import ExperiencePage from './pages/ExperiencePage'
import EducationPage from './pages/EducationPage'
import SkillsPage from './pages/SkillsPage'
import GalleryPage from './pages/GalleryPage'
import VlogsPage from './pages/VlogsPage'
import ServicesPage from './pages/ServicesPage'
import AchievementsPage from './pages/AchievementsPage'
import CertificationsPage from './pages/CertificationsPage'
import StatisticsPage from './pages/StatisticsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import './App.css'
import './modern-dark-styles.css'
import './modern-sections.css'
import './modern-hero.css'

const LoginRoute = () => {
  const navigate = useNavigate()
  return <Login onClose={() => navigate('/')} />
}

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  // Require authentication
  if (!user) {
    return <Login onClose={() => navigate('/')} />
  }

  // Check role-based access if roles are specified
  // Admin always has access to everything
  if (allowedRoles && allowedRoles.length > 0 && user.role !== 'admin') {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => navigate('/')} style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Go Home
          </button>
        </div>
      )
    }
  }

  return children
}

const AdminRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  // Only allow admin users to access admin panel
  if (!user || user.role !== 'admin') {
    return <PortfolioSite />
  }

  return <AdminPanel />
}

const ProfileRoute = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  // Ensure hooks run unconditionally: useEffect declared before any early returns
  React.useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      navigate('/admin')
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Login onClose={() => navigate('/')} />
  }

  // Redirect admin users to admin panel instead of profile page
  if (!user) {
    return <Login onClose={() => navigate('/')} />
  }

  if (user.role === 'admin') return null

  return <ProfilePage />
}

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <ConditionalNavigation />
          <Routes>
            <Route path="/" element={<PortfolioSite />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/email-verification-pending" element={<EmailVerificationHandler />} />
            <Route path="/complete-profile" element={<ProfileCompletionPage />} />
            <Route path="/admin" element={<AdminPanelWrapper />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/vlogs" element={<VlogsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

// Separate component so we can use location hook outside of main App return JSX above
const ConditionalNavigation = () => {
  const location = useLocation()
  const { user } = useAuth()
  // Hide navigation ONLY when actually inside the admin panel for an authenticated admin user
  if (location.pathname.startsWith('/admin') && user && user.role === 'admin') {
    return null
  }
  return <Navigation />
}

// Hide Navigation on AdminPanel
const AdminPanelWrapper = () => {
  return (
    <>
      <AdminPanel />
    </>
  );
};

export default App
