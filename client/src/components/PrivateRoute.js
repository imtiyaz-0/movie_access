import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, movieId }) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (isAuthenticated) {
    return element;
  } else {
    return <Navigate to="/login" state={{ from: `/movie/${movieId}` }} replace />;
  }
};

export default PrivateRoute;
