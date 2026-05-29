import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const userEmail = user?.email || '';
  const tenantInfo = user?.tenantCode ? user.tenantCode : (user?.tenantId ? `Tenant ${user.tenantId}` : '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar bg-white border-bottom shadow-sm px-4" style={{ height: '60px' }}>
        <span className="navbar-brand fw-bold text-dark m-0">RBAC Console</span>
      </nav>
    );
  }

  return (
    <nav className="navbar bg-white border-bottom px-4 d-flex justify-content-end align-items-center m-0 py-0" style={{ height: '60px' }}>
      <div className="d-flex align-items-center">
        <div className="text-end me-3">
          <div className="fw-medium text-dark small lh-1">{userEmail}</div>
          <div className="text-muted" style={{ fontSize: '11px' }}>{tenantInfo || 'Platform Admin'}</div>
        </div>
        <button className="btn btn-light border btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
