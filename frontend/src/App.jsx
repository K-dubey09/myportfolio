import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navigation from './components/Navigation'
import PortfolioSite from './components/PortfolioSite'
import AdminPanel from '../Admin/AdminPanel'
import RegistrationPage from './components/RegistrationPage'
import EmailVerification from './components/EmailVerification'
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <ConditionalNavigation />
            <Routes>
            <Route path="/" element={<PortfolioSite />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/projects" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <BlogsPage />
              </ProtectedRoute>
            } />
            <Route path="/testimonials" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <TestimonialsPage />
              </ProtectedRoute>
            } />
            <Route path="/experience" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <ExperiencePage />
              </ProtectedRoute>
            } />
            <Route path="/education" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <EducationPage />
              </ProtectedRoute>
            } />
            <Route path="/skills" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <SkillsPage />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <GalleryPage />
              </ProtectedRoute>
            } />
            <Route path="/vlogs" element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <VlogsPage />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <AchievementsPage />
              </ProtectedRoute>
            } />
            <Route path="/certifications" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                <CertificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute allowedRoles={['admin', 'viewer']}>
                <StatisticsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
      </AuthProvider>
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

export default App
