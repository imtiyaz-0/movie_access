import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element, movieId }) => {
  const {isAuthenticated} = useContext(AuthContext);

  if (isAuthenticated) {
    return element;
  } else {
    return <Navigate to="/login" state={{ from: `/movie/${movieId}` }} replace />;
  }
};

export default PrivateRoute;

