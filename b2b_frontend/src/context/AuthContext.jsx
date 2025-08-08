import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../common/api';
import { Navigate } from 'react-router-dom';
import Axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authAPI.getToken();
        const storedUser = authAPI.getCurrentUser();

        if (storedToken && storedUser) {
          Axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          const result = await authAPI.verifyToken();

          if (result.success) {
            setToken(storedToken);
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            authAPI.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  
const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    
    if (response && response.success) {
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        user: response.user,
        token: response.token,
        requirePasswordChange: response.requirePasswordChange // ✅ Add this
      };
    } else {
      const errorMessage = response?.message || 
                         response?.error || 
                         response?.data?.message ||
                         'Login failed. Please check your credentials.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  } catch (error) {
      console.error('Login error in AuthContext:', error);
      
      // Handle different error response formats
      let errorMessage = 'An error occurred during login.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error ||
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = error.message || 'Login failed.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };
  const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
  try {
    const response = await authAPI.changePassword(currentPassword, newPassword, newPasswordConfirmation);
    
    if (response.success) {
      // Update user in state and localStorage
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true };
    }
    
    return { success: false, error: response.message };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Failed to change password' 
    };
  }
};

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);

      if (response && response.success) {
        return { success: true, user: response.user };
      } else {
        const errorMessage = response?.message || 
                           response?.error ||
                           'Registration failed.';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error ||
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Registration failed.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasRole = (role) => {
    return user?.role === role || user?.role === 'admin';
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && !user?.role?.includes(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};