import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (role && user.role !== role) {
    return <div style={{ color: 'var(--danger)', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>Access Denied</div>;
  }
  return children;
};

export default ProtectedRoute;
