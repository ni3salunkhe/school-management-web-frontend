import { jwtDecode } from 'jwt-decode';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const role = jwtDecode(token)?.role;
  const isAuthenticated = token ? true : false;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(role?.toUpperCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;