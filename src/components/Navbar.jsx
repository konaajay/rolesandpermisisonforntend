import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { permissions, modules, hasPermission, isModuleEnabled, isPlatformAdmin } = usePermissions();

  const userEmail = user?.email || '';
  const tenantInfo = user?.tenantCode ? user.tenantCode : (user?.tenantId ? `Tenant ${user.tenantId}` : '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand font-weight-bold" to="/">RBAC Test Console</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
            
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Dashboard</Link>
                </li>
                {isPlatformAdmin && hasPermission('TENANT_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/tenants">Tenants</Link>
                  </li>
                )}
                {hasPermission('ROLE_CREATE') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-role">Roles</Link>
                  </li>
                )}
                {hasPermission('PERMISSION_CREATE') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/permissions">Permissions</Link>
                  </li>
                )}
                {hasPermission('ROLE_UPDATE') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/role-mapping">Map Permissions</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/role-hierarchy">Hierarchy</Link>
                </li>
                {isModuleEnabled('EMPLOYEE') && hasPermission('USER_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/users">Users</Link>
                  </li>
                )}
                {isModuleEnabled('LEAD') && hasPermission('LEAD_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">Leads</Link>
                  </li>
                )}
                {isModuleEnabled('COURSE') && hasPermission('COURSE_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">Courses</Link>
                  </li>
                )}
                {isModuleEnabled('HRMS') && hasPermission('HRMS_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">HRMS</Link>
                  </li>
                )}
                {isModuleEnabled('PAYROLL') && hasPermission('PAYROLL_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">Payroll</Link>
                  </li>
                )}
                {isModuleEnabled('ATTENDANCE') && hasPermission('ATTENDANCE_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">Attendance</Link>
                  </li>
                )}
                {isModuleEnabled('LMS') && hasPermission('LMS_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="#dummy">LMS</Link>
                  </li>
                )}
                {hasPermission('USER_VIEW') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/settings">Settings</Link>
                  </li>
                )}
              </>
            )}
          </ul>
          {isAuthenticated && (
            <div className="d-flex align-items-center">
              <span className="text-light me-3 small" style={{ opacity: 0.9 }}>
                <i className="bi bi-person-circle me-1"></i> <strong>{userEmail}</strong> 
                <span className="badge bg-secondary ms-2">{tenantInfo}</span>
              </span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
