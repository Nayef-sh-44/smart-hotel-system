import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Protects routes based on authenticated user's role
export function RoleGuard({ children, allowedRoles, allowUnauthenticated = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Very important: Do not redirect or render unauthorized content while auth is still resolving.
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    if (allowUnauthenticated) return children;
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'system_admin') return <Navigate to="/admin" replace />;
    if (user.role === 'hotel_manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/hotels" replace />;
  }

  return children;
}

// Redirects logged-in users away from /login and /register back to their correct portals
export function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'admin' || user.role === 'system_admin') return <Navigate to="/admin" replace />;
    if (user.role === 'hotel_manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/hotels" replace />;
  }

  return children;
}
