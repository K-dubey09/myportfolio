/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext();

export { AuthContext }; // Export the context

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // API base URL from environment variable
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  // Exchange refresh cookie for a new access token (must be defined before verifyToken)
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        setToken(data.accessToken);
        return true;
      }
    } catch (err) {
      console.error('refreshAccessToken failed', err);
    }
    return false;
  }, [API_BASE]);

  const verifyToken = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Try to refresh via cookie
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [token, refreshAccessToken, API_BASE]);

  // Expose a refreshUser helper to re-fetch the current user profile and update context
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
    } catch (err) {
      console.error('refreshUser failed', err);
    }
    return null;
  }, [token, API_BASE]);

  useEffect(() => {
    const init = async () => {
      if (token) {
        await verifyToken();
      } else {
        // Try refresh using cookie
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Token will be set by refreshAccessToken, triggering this effect again
        } else {
          setLoading(false);
        }
      }
    };
    init();
  }, [token, verifyToken, refreshAccessToken]);

  // Auto-refresh token every 45 minutes (before 1h expiry)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const refreshInterval = setInterval(async () => {
      console.log('Auto-refreshing token...');
      await refreshAccessToken();
    }, 45 * 60 * 1000); // 45 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, token, refreshAccessToken]);

  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return { success: false, error: errorData.error || 'Login failed' };
      }

      const data = await response.json();

      if (data.accessToken && data.user) {
        localStorage.setItem('authToken', data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Invalid response' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Network error - check if backend is running' };
    }
  };

  const register = async (email, password, username, name, role = 'viewer') => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username, name, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration initiated, now needs email verification
        return { 
          success: true, 
          requiresVerification: data.requiresVerification,
          userId: data.userId,
          email: data.email,
          message: data.message
        };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        logout(); // Clear auth state
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Clear rate limit function (admin only)
  const clearRateLimit = async (identifier = null) => {
    try {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const response = await fetch(`${API_BASE}/admin/clear-rate-limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ identifier })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Clear rate limit failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions for permission checking
  const hasPermission = (permission) => {
    return user?.permissions?.[permission] || false;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isEditor = () => hasRole('editor');
  const isViewer = () => hasRole('viewer');

  const canCreatePosts = () => hasPermission('canCreatePosts');
  const canEditPosts = () => hasPermission('canEditPosts');
  const canDeletePosts = () => hasPermission('canDeletePosts');
  const canManageUsers = () => hasPermission('canManageUsers');
  const canUploadFiles = () => hasPermission('canUploadFiles');
  const canEditProfile = () => hasPermission('canEditProfile');
  const canViewAnalytics = () => hasPermission('canViewAnalytics');

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    verifyEmail,
    resendOTP,
    logout,
    updateProfile,
    refreshUser,
    changePassword,
    deleteAccount,
    clearRateLimit,
    
    // Permission helpers
    hasPermission,
    hasRole,
    isAdmin,
    isEditor,
    isViewer,
    canCreatePosts,
    canEditPosts,
    canDeletePosts,
    canManageUsers,
    canUploadFiles,
    canEditProfile,
    canViewAnalytics
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};