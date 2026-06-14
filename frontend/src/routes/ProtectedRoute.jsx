import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role'); // e.g. 'guru', 'admin', 'super-admin', 'petugas-perbaikan', 'kepala-yayasan'

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not allowed, redirect back to their own dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`Unauthorized role access: ${userRole} attempted to access route allowed for ${allowedRoles}. Redirecting...`);
    
    // Fallback URL based on actual role
    if (userRole === 'super-admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'guru') return <Navigate to="/guru/dashboard" replace />;
    if (userRole === 'petugas-perbaikan') return <Navigate to="/petugas-perbaikan/dashboard" replace />;
    if (userRole === 'kepala-yayasan') return <Navigate to="/kepala-yayasan/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  // If permitted, render the child routes
  return <Outlet />;
}
