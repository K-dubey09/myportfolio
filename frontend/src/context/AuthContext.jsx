import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithCustomToken, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification
} from 'firebase/auth';

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

  // Traditional registration with email, password, and email verification
  const requestEmailVerification = async (email, name, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Backend response:', data);
        
        // Sign in with the custom token received from backend
        const userCredential = await signInWithCustomToken(auth, data.customToken);
        console.log('✅ User signed in successfully');
        
        // Get the user and send verification email
        const user = userCredential.user;
        if (user) {
          console.log('� User details:', {
            email: user.email,
            uid: user.uid,
            emailVerified: user.emailVerified
          });
          
          console.log('�📧 Attempting to send verification email to:', email);
          
          // Action code settings for the verification email
          const actionCodeSettings = {
            url: 'http://localhost:5176/email-verification',
            handleCodeInApp: false
          };
          
          try {
            await sendEmailVerification(user, actionCodeSettings);
            console.log('✅✅✅ VERIFICATION EMAIL SENT SUCCESSFULLY! ✅✅✅');
            console.log('📬 Check your email inbox (and spam folder)');
            
            // IMPORTANT: Sign out the user immediately after sending email
            // They should only be logged in after email verification
            await firebaseSignOut(auth);
            console.log('🚪 User signed out - must verify email to log in');
            
          } catch (emailError) {
            console.error('❌ Failed to send verification email');
            console.error('Error code:', emailError.code);
            console.error('Error message:', emailError.message);
            
            // Sign out even if email fails
            await firebaseSignOut(auth);
            throw emailError;
          }
        } else {
          console.error('❌ No user found after sign-in');
          return { success: false, error: 'Authentication failed' };
        }
        
        return { 
          success: true, 
          expiresIn: data.expiresIn,
          uid: data.uid,
          email: data.email
        };
      } else {
        return { success: false, error: data.message || 'Failed to send verification email' };
      }
    } catch (error) {
      console.error('Request email verification error:', error);
      console.error('Error details:', error.code, error.message);
      
      // Provide more specific error messages
      if (error.code === 'auth/network-request-failed') {
        return { success: false, error: 'Network error. Please check your connection.' };
      } else if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }
      
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // Complete registration after email verification
  const verifyEmailRegistration = async (uid, oobCode = null) => {
    try {
      const payload = oobCode ? { oobCode } : { uid };
      
      const response = await fetch(`${API_BASE}/auth/register/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Email verification successful, logging in user...');
        await signInWithCustomToken(auth, data.customToken);
        console.log('✅✅ USER AUTOMATICALLY LOGGED IN AFTER EMAIL VERIFICATION! ✅✅');
        console.log('👤 User details:', data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Email verification failed' };
      }
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // Passwordless login using email link (optional login method)
  const sendEmailLinkForLogin = async (email) => {
    try {
      // Configure action code settings
      const actionCodeSettings = {
        url: window.location.origin + '/email-verification',
        handleCodeInApp: true,
      };

      // Send sign-in link using Firebase client SDK
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email locally
      window.localStorage.setItem('emailForSignIn', email);

      return { 
        success: true, 
        message: 'Sign-in link sent! Check your email.'
      };
    } catch (error) {
      console.error('Send email link error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send sign-in link' 
      };
    }
  };

  // Complete email link sign-in (for passwordless login)
  const completeEmailLinkSignIn = async (emailFromUser = null) => {
    try {
      // Check if the current URL is a sign-in link
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return { 
          success: false, 
          error: 'Invalid sign-in link' 
        };
      }

      // Get email from storage or user input
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email && emailFromUser) {
        email = emailFromUser;
      }
      
      if (!email) {
        return { 
          success: false, 
          error: 'Email is required to complete sign-in' 
        };
      }

      // Sign in with email link
      const result = await signInWithEmailLink(auth, email, window.location.href);
      const user = result.user;

      // Clear stored email
      window.localStorage.removeItem('emailForSignIn');

      // Sync with backend
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE}/auth/email-link-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken,
          email: user.email,
          name: user.displayName || 'User'
        })
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          user: data.user
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to complete sign-in' 
        };
      }
    } catch (error) {
      console.error('Complete email link sign-in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to complete sign-in' 
      };
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
    requestEmailVerification,
    verifyEmailRegistration,
    sendEmailLinkForLogin,
    completeEmailLinkSignIn,
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
