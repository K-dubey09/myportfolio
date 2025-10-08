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

  // API base URL
  const API_BASE = 'http://localhost:5000/api';

  const verifyToken = useCallback(async () => {
    try {
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
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
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
  }, [token]);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token, verifyToken]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return { success: false, error: errorData.error || 'Login failed' };
      }

      const data = await response.json();

      if (data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
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

  const register = async (email, password, name, role = 'viewer') => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
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
    logout,
    updateProfile,
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