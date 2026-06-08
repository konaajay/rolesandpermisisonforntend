import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

export default function VendorSidebar() {
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
      ? 'flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
      : 'flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors';
  };

  const SectionTitle = ({ children }) => (
    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 first:mt-0">
      {children}
    </div>
  );

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-y-auto custom-scrollbar flex-shrink-0 z-30">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center h-[60px]">
        <h5 className="font-bold text-slate-100 text-lg m-0">Enterprise SaaS</h5>
      </div>

      <div className="p-4 flex-grow pb-20">
        {isPlatformAdmin && (
          <>
            <SectionTitle>Platform Dashboard</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/')} to="/">Dashboard</Link>
            </div>

            <SectionTitle>Tenant Management</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/tenants', false)} to="/tenants">Tenants</Link>
            </div>
          </>
        )}

        {!isPlatformAdmin && (
          <>
            <SectionTitle>Tenant Admin</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/')} to="/">Dashboard</Link>
            </div>
          </>
        )}

        {(hasPermission('USER_VIEW') || hasPermission('ROLE_CREATE') || hasPermission('PERMISSION_CREATE')) && (
          <>
            <SectionTitle>Access Control</SectionTitle>
            <div className="space-y-1">
              {hasPermission('USER_VIEW') && isModuleEnabled('EMPLOYEE') && <Link className={isActive('/users', false)} to="/users">Users</Link>}
              {hasPermission('ROLE_CREATE') && <Link className={isActive('/roles', false)} to="/roles">Roles</Link>}
              {hasPermission('PERMISSION_CREATE') && <Link className={isActive('/permissions')} to="/permissions">Permissions</Link>}
              <Link className={isActive('/role-hierarchy')} to="/role-hierarchy">Role Hierarchy</Link>
            </div>
          </>
        )}

        {hasPermission('USER_VIEW') && (
          <>
            <SectionTitle>Settings</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/settings/company-profile', false)} to="/settings/company-profile">Company Profile</Link>
              <Link className={isActive('/settings/id-generation', false)} to="/settings/id-generation">ID Generation</Link>
              <Link className={isActive('/settings/templates', false)} to="/settings/templates">Templates</Link>
              <Link className={isActive('/settings/certificates', false)} to="/settings/certificates">Certificates</Link>
            </div>

            {isModuleEnabled('HRMS') && (
              <>
                <SectionTitle>HRMS</SectionTitle>
                <div className="space-y-1">
                  <Link className={isActive('/hrms/branches', false)} to="/hrms/branches">Branches</Link>
                  <Link className={isActive('/hrms/shifts', false)} to="/hrms/shifts">Attendance Shifts</Link>
                </div>
              </>
            )}

            {isModuleEnabled('CRM') && (
              <>
                <SectionTitle>CRM</SectionTitle>
                <div className="space-y-1">
                  <Link className={isActive('/crm/stages', false)} to="/crm/stages">Lead Stages</Link>
                </div>
              </>
            )}
          </>
        )}

        {isModuleEnabled('VENDOR') && (hasPermission('VENDOR_VIEW') || hasPermission('VENDOR_CREATE')) && (
          <>
            <SectionTitle>Vendor Management</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/vendor-dashboard', false)} to="/vendor-dashboard">Vendor Portal</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
