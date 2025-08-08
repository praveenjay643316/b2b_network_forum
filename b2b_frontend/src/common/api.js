import Axios from '../utils/axios';
import SummaryApi from './Summaryapi';

export const authAPI = {
 login: async (email, password) => {
  try {
    const response = await Axios({
      ...SummaryApi.login,
      data: { email, password },
    });

    if (response.data.success) {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return response.data;
  } catch (error) {
    // Create a proper Error object
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Login failed';
    
    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
},
changePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
  try {
    const response = await Axios({
      ...SummaryApi.changePassword,
      data: { 
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to change password';
    
    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
},
  logout: async () => {
    try {
      await Axios(SummaryApi.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete Axios.defaults.headers.common['Authorization'];
    }
  },

  register: async (data) => {
    try {
      const response = await Axios({
        ...SummaryApi.register,
        data,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyToken: async () => {
    try {
      const response = await Axios(SummaryApi.verifyToken);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!(authAPI.getToken() && authAPI.getCurrentUser());
  },
};