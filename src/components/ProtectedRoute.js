import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = sessionStorage.getItem('role');
  const isAuthenticated = sessionStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(role?.toUpperCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;