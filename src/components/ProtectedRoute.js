import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading } = useAuth();

  // If still loading, display nothing or a spinner
  if (loading) {
    return null; // Optionally replace with a loading spinner
  }

  // Debugging: Log user, role, and adminOnly
  // console.log('ProtectedRoute: user', user);
  // console.log('ProtectedRoute: role', role);
  // console.log('ProtectedRoute: adminOnly', adminOnly);

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If route is admin-only and user is not an admin, redirect to dashboard
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // If all checks pass, render the children components
  return children;
};

export default ProtectedRoute;
