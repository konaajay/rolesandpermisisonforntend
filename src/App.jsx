import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import CreateTenant from './pages/CreateTenant';
import CreateRole from './pages/CreateRole';
import Permissions from './pages/Permissions';
import RoleMapping from './pages/RoleMapping';
import RoleHierarchy from './pages/RoleHierarchy';
import UserManager from './pages/UserManager';
import TenantsList from './pages/TenantsList';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { getDefaultRoute } from './auth/routeUtils';

function RootRedirect() {
  const { isAuthenticated, user, permissions, loading } = useAuth();

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

  return <Navigate to={getDefaultRoute(user, permissions)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/create-tenant" element={<ProtectedRoute element={<CreateTenant />} permission="TENANT_CREATE" />} />
            <Route path="/create-role" element={<ProtectedRoute element={<CreateRole />} permission="ROLE_CREATE" />} />
            <Route path="/permissions" element={<ProtectedRoute element={<Permissions />} permission="PERMISSION_CREATE" />} />
            <Route path="/role-mapping" element={<ProtectedRoute element={<RoleMapping />} permission="ROLE_CREATE" />} />
            <Route path="/role-hierarchy" element={<ProtectedRoute element={<RoleHierarchy />} />} />
            <Route path="/users" element={<ProtectedRoute element={<UserManager />} permission="USER_VIEW" module="EMPLOYEE" />} />
            <Route path="/tenants" element={<ProtectedRoute element={<TenantsList />} permission="TENANT_VIEW" />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} permission="USER_VIEW" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
