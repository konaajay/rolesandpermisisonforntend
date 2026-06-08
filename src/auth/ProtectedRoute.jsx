import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePermissions } from './usePermissions';

export default function ProtectedRoute({ element, permission, module }) {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, isModuleEnabled } = usePermissions();

  console.log(`[ProtectedRoute] Checking permission: ${permission}. User has permissions:`, usePermissions().permissions);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (module && !isModuleEnabled(module)) {
    console.log(`[ProtectedRoute] Redirecting to /unauthorized because module ${module} is not enabled.`);
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !hasPermission(permission)) {
    console.log(`[ProtectedRoute] Redirecting to /unauthorized because permission ${permission} is not granted.`);
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}
