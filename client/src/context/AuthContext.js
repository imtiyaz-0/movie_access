import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
 
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:${process.env.REACT_APP_PORT}/api/auth/check-session`,
          { withCredentials: true }
        );
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);


  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const deleteAccount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        // Handle successful deletion, possibly by logging the user out
        logout();
      } else {
        // Handle errors
        console.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated,setIsAuthenticated, logout,deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
