import { create } from 'zustand';
import { authAPI } from '../api/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  userRole: null, // 'patient' or 'doctor'
  token: localStorage.getItem('token') || null,
  error: null,

  login: async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user details
      const userResponse = await authAPI.getMe();
      const userData = userResponse.data;

      set({
        user: userData,
        isAuthenticated: true,
        userRole: userData.role,
        token: access_token,
        error: null
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      set({ error: error.response?.data?.detail || 'Invalid credentials' });
      return false;
    }
  },

  signup: async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        // Fetch user details immediately after signup
        const userResponse = await authAPI.getMe();
        const userDetails = userResponse.data;

        set({
          user: userDetails,
          isAuthenticated: true,
          userRole: userDetails.role,
          token: access_token,
          error: null
        });
        return true;
      }
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      set({ error: error.response?.data?.detail || 'Signup failed' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
      userRole: null,
      token: null
    });
  },
}));

export default useAuthStore;
