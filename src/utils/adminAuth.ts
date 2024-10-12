import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        return React.createElement(Navigate, { to: "/admin/login", replace: true });
    }

    // You might want to add a check here to verify the token's validity
    // For now, we'll just assume it's valid if it exists

    return React.createElement(React.Fragment, null, children);
};
