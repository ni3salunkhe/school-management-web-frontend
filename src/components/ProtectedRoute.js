import { jwtDecode } from 'jwt-decode';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  
  // Check if token exists and is valid
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return <Navigate to="/" replace />;
  }

  let role;
  try {
    // Safely decode the token
    const decodedToken = jwtDecode(token);
    role = decodedToken?.role;
    
    // Optional: Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      sessionStorage.removeItem('token');
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error('Error decoding token in ProtectedRoute:', error);
    // Clear invalid token and redirect to login
    sessionStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role?.toUpperCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;