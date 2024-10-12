import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        return React.createElement(Navigate, { to: "/admin", replace: true });
    }
    return React.createElement(React.Fragment, null, children);
};
