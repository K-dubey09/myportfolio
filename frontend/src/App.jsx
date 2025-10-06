import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navigation from './components/Navigation'
import PortfolioSite from './components/PortfolioSite'
import AdminPanel from '../Admin/AdminPanel'
import RegistrationPage from './components/RegistrationPage'
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
import './App.css'
import './App.css'

const LoginRoute = () => {
  const navigate = useNavigate()
  return <Login onClose={() => navigate('/')} />
}

const ProtectedRoute = ({ children }) => {
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

  if (!user) {
    return <Login onClose={() => navigate('/')} />
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ConditionalNavigation />
          <Routes>
            <Route path="/" element={<PortfolioSite />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute>
                <BlogsPage />
              </ProtectedRoute>
            } />
            <Route path="/testimonials" element={
              <ProtectedRoute>
                <TestimonialsPage />
              </ProtectedRoute>
            } />
            <Route path="/experience" element={
              <ProtectedRoute>
                <ExperiencePage />
              </ProtectedRoute>
            } />
            <Route path="/education" element={
              <ProtectedRoute>
                <EducationPage />
              </ProtectedRoute>
            } />
            <Route path="/skills" element={
              <ProtectedRoute>
                <SkillsPage />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } />
            <Route path="/vlogs" element={
              <ProtectedRoute>
                <VlogsPage />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            } />
            <Route path="/certifications" element={
              <ProtectedRoute>
                <CertificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <StatisticsPage />
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
