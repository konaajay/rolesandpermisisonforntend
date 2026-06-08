import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const { isPlatformAdmin, hasPermission, isModuleEnabled } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) return null;

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
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-y-hidden flex-shrink-0 z-30">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center h-[60px] flex-shrink-0">
        <h5 className="font-bold text-slate-100 text-lg m-0">Enterprise SaaS</h5>
      </div>

      <div className="p-4 flex-grow pb-20 overflow-y-auto custom-scrollbar">
        
        {/* Dashboard */}
        <div className="space-y-1">
            <Link className={isActive('/')} to="/">Dashboard</Link>
        </div>

        {/* 1. Tenant Management */}
        {isPlatformAdmin && (
          <>
            <SectionTitle>Tenant Management</SectionTitle>
            <div className="space-y-1">
              {hasPermission('TENANT_VIEW') && <Link className={isActive('/tenants', false)} to="/tenants">Tenants</Link>}
              {hasPermission('TENANT_SETTINGS_VIEW') && <Link className={isActive('/tenant-settings', false)} to="/tenant-settings">Tenant Settings</Link>}
              {hasPermission('TENANT_MODULES_VIEW') && <Link className={isActive('/tenant-modules', false)} to="/tenant-modules">Tenant Modules</Link>}
              {(hasPermission('SUBSCRIPTION_MANAGE') || isPlatformAdmin) && (
                <Link className={isActive('/settings/billing', false)} to="/settings/billing">Subscription</Link>
              )}
            </div>
          </>
        )}

        {/* 2. User & Access Management */}
        {(hasPermission('USER_VIEW') || hasPermission('ROLE_VIEW') || hasPermission('PERMISSION_VIEW')) && (
          <>
            <SectionTitle>User & Access Management</SectionTitle>
            <div className="space-y-1">
              {hasPermission('USER_VIEW') && <Link className={isActive('/users', false) || isActive('/roles', false) || isActive('/permissions', false) || isActive('/role-hierarchy', false) ? "block px-4 py-2 mt-1 text-sm rounded transition-colors bg-primary bg-opacity-10 text-primary font-medium" : "block px-4 py-2 mt-1 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"} to="/users">Users & Access</Link>}
            </div>
          </>
        )}

        {/* 3. Vendor Management */}
        {isModuleEnabled('VENDOR') && hasPermission('VENDOR_VIEW') && (
          <>
            <SectionTitle>Vendor Management</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/vendor-dashboard', false)} to="/vendor-dashboard">Vendor Portal</Link>
            </div>
          </>
        )}

        {/* 4. Integration Management */}
        {isModuleEnabled('INTEGRATION') && hasPermission('INTEGRATION_VIEW') && (
          <>
            <SectionTitle>Integration Management</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/integrations', true)} to="/integrations">Integrations</Link>
              <Link className={isActive('/api-keys', false)} to="/api-keys">API Keys</Link>
              <Link className={isActive('/webhooks', false)} to="/webhooks">Webhooks</Link>
              <Link className={isActive('/integrations/google', false)} to="/integrations/google">Google</Link>
              <Link className={isActive('/integrations/meta', false)} to="/integrations/meta">Meta</Link>
              <Link className={isActive('/integrations/whatsapp', false)} to="/integrations/whatsapp">WhatsApp</Link>
              <Link className={isActive('/integrations/zapier', false)} to="/integrations/zapier">Zapier</Link>
              <Link className={isActive('/integrations/zoom', false)} to="/integrations/zoom">Zoom</Link>
              <Link className={isActive('/integrations/cashfree', false)} to="/integrations/cashfree">Cashfree</Link>
              <Link className={isActive('/integration-logs', false)} to="/integration-logs">Integration Logs</Link>
              <Link className={isActive('/sync-history', false)} to="/sync-history">Sync History</Link>
            </div>
          </>
        )}

        {/* 5. Marketing Management */}
        {isModuleEnabled('MARKETING') && hasPermission('MARKETING_VIEW') && (
          <>
            <SectionTitle>Marketing Management</SectionTitle>
            <div className="space-y-1">
              <Link className={isActive('/marketing', false)} to="/marketing">Marketing Portal</Link>
            </div>
          </>
        )}

        {/* 6. System Settings - single entry point, nav handled by SettingsNav top bar */}
        {(hasPermission('COMPANY_PROFILE_VIEW') || hasPermission('SETTINGS_MANAGE_TEMPLATES') || hasPermission('SETTINGS_MANAGE_ID_FORMATS')) && (
        <>
          <SectionTitle>Settings</SectionTitle>
          <div className="space-y-1">
            <Link className={isActive('/settings/company-profile', false) || isActive('/settings/id-generation', false) || isActive('/settings/templates', false) || isActive('/settings/certificates', false) || isActive('/hrms/branches', false) || isActive('/hrms/shifts', false) || isActive('/crm/stages', false) ? 'flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors'} to="/settings/company-profile">System Settings</Link>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
