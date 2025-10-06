import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import PortfolioSite from './components/PortfolioSite'
import AdminPanel from '../Admin/AdminPanel'
import RegistrationPage from './components/RegistrationPage'
import Login from './components/Login'
import './App.css'

const LoginRoute = () => {
  const navigate = useNavigate()
  return <Login onClose={() => navigate('/')} />
}

const AdminRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Only admin users can access admin panel
  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
        <button onClick={() => window.location.href = '/'}>
          Return to Home
        </button>
      </div>
    )
  }

  return <AdminPanel />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<PortfolioSite />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/admin" element={<AdminRoute />} />
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

export default App
