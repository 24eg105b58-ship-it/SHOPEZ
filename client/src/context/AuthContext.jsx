import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user state from local storage on load
  useEffect(() => {
    const storedUser = localStorage.getItem('shopez_userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data);
        localStorage.setItem('shopez_userInfo', JSON.stringify(data));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      if (data.success) {
        setUser(data);
        localStorage.setItem('shopez_userInfo', JSON.stringify(data));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopez_userInfo');
    localStorage.removeItem('shopez_cart');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      if (data.success) {
        // Preserve token if the server returns a new one or if we merge
        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
          role: data.role,
          wishlist: data.wishlist,
          token: data.token || user.token,
        };
        setUser(updatedUser);
        localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.',
      };
    }
  };

  // Refresh user data (wishlist/role)
  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        const refreshedUser = {
          ...user,
          name: data.name,
          email: data.email,
          role: data.role,
          wishlist: data.wishlist,
        };
        setUser(refreshedUser);
        localStorage.setItem('shopez_userInfo', JSON.stringify(refreshedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  // Toggle wishlist item handler
  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, message: 'Please login to add items to wishlist' };
    try {
      const { data } = await API.post(`/users/wishlist/${productId}`);
      if (data.success) {
        const updatedUser = {
          ...user,
          wishlist: data.wishlist,
        };
        setUser(updatedUser);
        localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
        return { success: true, message: data.message, wishlist: data.wishlist };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle wishlist item.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
