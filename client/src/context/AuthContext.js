import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const logout = async () => {
    try {
      await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/api/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
