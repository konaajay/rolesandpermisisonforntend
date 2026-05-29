import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const { isPlatformAdmin, hasPermission, isModuleEnabled } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // exact=true for strict match, exact=false for prefix match
  const isActive = (path, exact = true) => {
    const matched = exact
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + '/');
    return matched
      ? 'active text-primary bg-primary-subtle border-end border-3 border-primary'
      : 'text-secondary';
  };

  const link = "nav-link py-2 px-3 fw-medium d-flex align-items-center mb-1 rounded-start";
  const section = "text-muted small fw-bold mb-2 text-uppercase";
  const sectionStyle = { fontSize: '11px', letterSpacing: '0.5px' };
  const ul = "nav flex-column mb-4";

  return (
    <div className="bg-white border-end d-flex flex-column" style={{ width: '240px', height: '100vh', overflowY: 'auto' }}>
      {/* Brand */}
      <div className="p-3 border-bottom d-flex align-items-center" style={{ height: '60px' }}>
        <h5 className="fw-bold text-dark m-0">Enterprise SaaS</h5>
      </div>

      <div className="p-3 flex-grow-1">
        {isPlatformAdmin ? (
          <>
            <div className={section} style={sectionStyle}>Platform Admin</div>
            <ul className={ul}>
              <li className="nav-item"><Link className={`${link} ${isActive('/')}`} to="/">Dashboard</Link></li>
            </ul>

            <div className={section} style={sectionStyle}>Tenants</div>
            <ul className={ul}>
              <li className="nav-item"><Link className={`${link} ${isActive('/tenants', false)}`} to="/tenants">Tenant List</Link></li>
            </ul>

            <div className={section} style={sectionStyle}>System</div>
            <ul className={ul}>
              <li className="nav-item"><Link className={`${link} ${isActive('/settings/formats', false)}`} to="/settings/formats">Settings</Link></li>
            </ul>
          </>
        ) : (
          <>
            <div className={section} style={sectionStyle}>Tenant Admin</div>
            <ul className={ul}>
              <li className="nav-item"><Link className={`${link} ${isActive('/')}`} to="/">Dashboard</Link></li>
            </ul>

            {(hasPermission('USER_VIEW') || hasPermission('ROLE_CREATE') || hasPermission('PERMISSION_CREATE')) && (
              <>
                <div className={section} style={sectionStyle}>Access Control</div>
                <ul className={ul}>
                  {hasPermission('USER_VIEW') && isModuleEnabled('EMPLOYEE') && <li className="nav-item"><Link className={`${link} ${isActive('/users', false)}`} to="/users">Users</Link></li>}
                  {hasPermission('ROLE_CREATE') && <li className="nav-item"><Link className={`${link} ${isActive('/roles', false)}`} to="/roles">Roles</Link></li>}
                  {hasPermission('PERMISSION_CREATE') && <li className="nav-item"><Link className={`${link} ${isActive('/permissions')}`} to="/permissions">Permissions</Link></li>}
                </ul>
              </>
            )}

            {hasPermission('USER_VIEW') && (
              <>
                <div className={section} style={sectionStyle}>Settings</div>
                <ul className={ul}>
                  <li className="nav-item"><Link className={`${link} ${isActive('/settings/company-profile', false)}`} to="/settings/company-profile">Company Profile</Link></li>
                  <li className="nav-item"><Link className={`${link} ${isActive('/settings/id-generation', false)}`} to="/settings/id-generation">ID Generation</Link></li>
                  <li className="nav-item"><Link className={`${link} ${isActive('/settings/templates', false)}`} to="/settings/templates">Templates</Link></li>
                </ul>

                {isModuleEnabled('HRMS') && (
                  <>
                    <div className={section} style={sectionStyle}>HRMS</div>
                    <ul className={ul}>
                      <li className="nav-item"><Link className={`${link} ${isActive('/hrms/branches', false)}`} to="/hrms/branches">Branches</Link></li>
                      <li className="nav-item"><Link className={`${link} ${isActive('/hrms/shifts', false)}`} to="/hrms/shifts">Attendance Shifts</Link></li>
                    </ul>
                  </>
                )}

                {isModuleEnabled('CRM') && (
                  <>
                    <div className={section} style={sectionStyle}>CRM</div>
                    <ul className={ul}>
                      <li className="nav-item"><Link className={`${link} ${isActive('/crm/stages', false)}`} to="/crm/stages">Lead Stages</Link></li>
                    </ul>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
