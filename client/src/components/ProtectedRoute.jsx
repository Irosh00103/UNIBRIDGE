import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="container page empty-state">
                <p>Access Denied. You do not have permission to view this page.</p>
            </div>
        );
    }
    
    return children;
};

export default ProtectedRoute;
