import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user && user.role !== 'admin') {
    // Redirect to main feed if trying to access admin page without admin role
    return <Navigate to="/" replace />;
  }

  // Render children routes
  return <Outlet />;
};

export default ProtectedRoute;
