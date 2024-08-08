import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, movieId }) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (isAuthenticated) {
    return element;
  } else {
    // Pass the movieId in state to redirect back after login
    return <Navigate to="/login" state={{ from: `/movie/${movieId}` }} />;
  }
};

export default PrivateRoute;
