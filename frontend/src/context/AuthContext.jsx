import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../config/firebase';
import { signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export { AuthContext };

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
  const [firebaseUser, setFirebaseUser] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const idTokenResult = await fbUser.getIdTokenResult();
        
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          role: idTokenResult.claims.role || 'viewer',
          permissions: idTokenResult.claims.permissions || {}
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      await signInWithCustomToken(auth, data.customToken);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (response.ok) {
        await signInWithCustomToken(auth, data.customToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const requestRegisterOTP = async (email, name) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, expiresIn: data.expiresIn };
      } else {
        return { success: false, error: data.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const verifyRegisterOTP = async (email, otp, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
      });

      const data = await response.json();

      if (response.ok) {
        await signInWithCustomToken(auth, data.customToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const googleSignIn = async (idToken) => {
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (response.ok) {
        await signInWithCustomToken(auth, data.customToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Google sign-in failed' };
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getIdToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  const updateProfile = async (profileData) => {
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, ...data.user }));
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const hasPermission = (permission) => user?.permissions?.[permission] || false;
  const hasRole = (role) => user?.role === role;
  const isAdmin = () => hasRole('admin');
  const isEditor = () => hasRole('editor');
  const isViewer = () => hasRole('viewer');

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    requestRegisterOTP,
    verifyRegisterOTP,
    googleSignIn,
    logout,
    updateProfile,
    changePassword,
    getIdToken,
    hasPermission,
    hasRole,
    isAdmin,
    isEditor,
    isViewer,
    canCreatePosts: () => hasPermission('canCreatePosts'),
    canEditPosts: () => hasPermission('canEditPosts'),
    canDeletePosts: () => hasPermission('canDeletePosts'),
    canManageUsers: () => hasPermission('canManageUsers'),
    canUploadFiles: () => hasPermission('canUploadFiles'),
    canEditProfile: () => hasPermission('canEditProfile'),
    canViewAnalytics: () => hasPermission('canViewAnalytics')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
