import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterUser from './pages/RegisterUser';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ title }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 m-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-slate-500">This module is currently under development.</p>
  </div>
);

// Users
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';

// Roles
import RoleList from './pages/RoleList';
import RoleForm from './pages/RoleForm';

// Permissions
import Permissions from './pages/Permissions';
import RoleMapping from './pages/RoleMapping';
import RoleHierarchy from './pages/RoleHierarchy';

// Tenants (Platform Admin)
import TenantsList from './pages/TenantsList';
import TenantDetails from './pages/TenantDetails';
import CreateTenant from './pages/CreateTenant';

// Settings — Branches
import BranchList from './pages/BranchList';
import BranchForm from './pages/BranchForm';

// Settings — Shifts
import ShiftList from './pages/ShiftList';
import ShiftForm from './pages/ShiftForm';

// Settings — Lead Stages
import LeadStageList from './pages/LeadStageList';
import LeadStageForm from './pages/LeadStageForm';

// Settings — ID Formats
import IdGenerationSettings from './pages/IdGenerationSettings';

// Settings — New Modules
import TemplatesPage from './pages/TemplatesPage';
import TemplateFormPage from './pages/TemplateFormPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import CertificatesList from './pages/CertificatesList';
import PublicVerificationPage from './pages/PublicVerificationPage';

// Settings — Entities & Departments
import BusinessEntityList from './pages/BusinessEntityList';
import BusinessEntityForm from './pages/BusinessEntityForm';
import DepartmentList from './pages/DepartmentList';
import DepartmentForm from './pages/DepartmentForm';


import { useAppStore } from './store/useAppStore';
import MainLayout from './layouts/MainLayout';
import VendorAnalyticsDashboard from './pages/VendorAnalyticsDashboard';
import Vendors from './pages/Vendors';
import Requirements from './pages/Requirements';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import Performance from './pages/Performance';
import RiskCompliance from './pages/RiskCompliance';
import Billing from './pages/Billing';
import Receipt from './pages/Receipt';
import VendorPortal from './pages/VendorPortal';

// Marketing
import MarketingApp from './pages/marketing/App';
import LandingPage from './pages/marketing/components/pages/LandingPage';
const StaffProtectedRoute = ({ children }) => {
  const { currentUser, userRole } = useAppStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (userRole === 'VENDOR') {
    return <Navigate to="/vendor-portal" replace />;
  }
  return children;
};

// Protected Route Component for Vendor
const VendorProtectedRoute = ({ children }) => {
  const { currentUser, userRole } = useAppStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== 'VENDOR') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isVendorRoute = location.pathname.startsWith('/vendor');
  const isPublicRoute = ['/login', '/signup', '/register', '/unauthorized'].includes(location.pathname) || location.pathname.startsWith('/verify/') || location.pathname.startsWith('/landing/');

  if (isVendorRoute || isPublicRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify/:identifier" element={<PublicVerificationPage />} />
        <Route path="/landing/:slug" element={<LandingPage />} />
        
        <Route path="/vendor-portal" element={<VendorProtectedRoute><VendorPortal /></VendorProtectedRoute>} />
        <Route path="/vendor-dashboard" element={<StaffProtectedRoute><MainLayout /></StaffProtectedRoute>}>
          <Route index element={<Navigate to="/vendor-dashboard/analytics" replace />} />
          <Route path="analytics" element={<VendorAnalyticsDashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id/receipt" element={<Receipt />} />
          <Route path="performance" element={<Performance />} />
          <Route path="risk-compliance" element={<RiskCompliance />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        <Navbar />
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            <Routes>
              {/* ── Dashboard ── */}
              <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />

              {/* ── Tenants (Platform Admin) ── */}
              <Route path="/tenants" element={<ProtectedRoute element={<TenantsList />} permission="TENANT_VIEW" />} />
              <Route path="/tenants/:id" element={<ProtectedRoute element={<TenantDetails />} permission="TENANT_VIEW" />} />
              <Route path="/create-tenant" element={<ProtectedRoute element={<CreateTenant />} permission="TENANT_CREATE" />} />
              <Route path="/tenant-settings" element={<ProtectedRoute element={<Placeholder title="Tenant Settings" />} permission="TENANT_SETTINGS_VIEW" />} />
              <Route path="/tenant-modules" element={<ProtectedRoute element={<Placeholder title="Tenant Modules" />} permission="TENANT_MODULES_VIEW" />} />
              <Route path="/settings/billing" element={<ProtectedRoute element={<Billing />} permission="SUBSCRIPTION_MANAGE" />} />

              {/* ── User & Access Management ── */}
              <Route path="/users" element={<ProtectedRoute element={<UserList />} permission="USER_VIEW" />} />
              <Route path="/users/create" element={<ProtectedRoute element={<UserForm />} permission="USER_CREATE" />} />
              <Route path="/users/edit/:id" element={<ProtectedRoute element={<UserForm />} permission="USER_UPDATE" />} />
              <Route path="/roles" element={<ProtectedRoute element={<RoleList />} permission="ROLE_VIEW" />} />
              <Route path="/roles/create" element={<ProtectedRoute element={<RoleForm />} permission="ROLE_CREATE" />} />
              <Route path="/roles/edit/:id" element={<ProtectedRoute element={<RoleForm />} permission="ROLE_CREATE" />} />
              <Route path="/permissions" element={<ProtectedRoute element={<Permissions />} permission="PERMISSION_VIEW" />} />
              <Route path="/role-mapping" element={<ProtectedRoute element={<RoleMapping />} permission="ROLE_PERMISSION_VIEW" />} />
              <Route path="/role-permissions" element={<ProtectedRoute element={<Placeholder title="Role Permissions" />} permission="ROLE_PERMISSION_VIEW" />} />
              <Route path="/user-permissions" element={<ProtectedRoute element={<Placeholder title="User Permissions" />} permission="USER_PERMISSION_VIEW" />} />
              <Route path="/role-hierarchy" element={<ProtectedRoute element={<RoleHierarchy />} permission="ROLE_VIEW" />} />

              {/* ── Vendor Management ── */}
              <Route path="/vendors" element={<ProtectedRoute element={<Vendors />} permission="VENDOR_VIEW" />} />
              <Route path="/vendor-categories" element={<ProtectedRoute element={<Placeholder title="Vendor Categories" />} permission="VENDOR_VIEW" />} />
              <Route path="/vendor-settings" element={<ProtectedRoute element={<Placeholder title="Vendor Settings" />} permission="VENDOR_VIEW" />} />
              <Route path="/vendor-reports" element={<ProtectedRoute element={<Placeholder title="Vendor Reports" />} permission="VENDOR_VIEW" />} />

              {/* ── Integration Management ── */}
              <Route path="/integrations" element={<ProtectedRoute element={<Placeholder title="Integrations" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/api-keys" element={<ProtectedRoute element={<Placeholder title="API Keys" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/webhooks" element={<ProtectedRoute element={<Placeholder title="Webhooks" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/google" element={<ProtectedRoute element={<Placeholder title="Google Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/meta" element={<ProtectedRoute element={<Placeholder title="Meta Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/whatsapp" element={<ProtectedRoute element={<Placeholder title="WhatsApp Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/zapier" element={<ProtectedRoute element={<Placeholder title="Zapier Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/zoom" element={<ProtectedRoute element={<Placeholder title="Zoom Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integrations/cashfree" element={<ProtectedRoute element={<Placeholder title="Cashfree Integration" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/integration-logs" element={<ProtectedRoute element={<Placeholder title="Integration Logs" />} permission="INTEGRATION_VIEW" />} />
              <Route path="/sync-history" element={<ProtectedRoute element={<Placeholder title="Sync History" />} permission="INTEGRATION_VIEW" />} />

              {/* ── Legacy Settings & Others ── */}
              <Route path="/settings/company-profile" element={<ProtectedRoute element={<CompanyProfilePage />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/settings/id-generation" element={<ProtectedRoute element={<IdGenerationSettings />} permission="SETTINGS_MANAGE_ID_FORMATS" />} />
              <Route path="/settings/templates" element={<ProtectedRoute element={<TemplatesPage />} permission="SETTINGS_MANAGE_TEMPLATES" />} />
              <Route path="/settings/templates/create" element={<ProtectedRoute element={<TemplateFormPage />} permission="SETTINGS_MANAGE_TEMPLATES" />} />
              <Route path="/settings/templates/edit/:id" element={<ProtectedRoute element={<TemplateFormPage />} permission="SETTINGS_MANAGE_TEMPLATES" />} />
              <Route path="/settings/certificates" element={<ProtectedRoute element={<CertificatesList />} permission="SETTINGS_MANAGE_TEMPLATES" />} />
              <Route path="/settings/entities" element={<ProtectedRoute element={<BusinessEntityList />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/settings/entities/create" element={<ProtectedRoute element={<BusinessEntityForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/settings/entities/edit/:id" element={<ProtectedRoute element={<BusinessEntityForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/settings/departments" element={<ProtectedRoute element={<DepartmentList />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/settings/departments/create" element={<ProtectedRoute element={<DepartmentForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/settings/departments/edit/:id" element={<ProtectedRoute element={<DepartmentForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/settings/*" element={<Navigate to="/settings/company-profile" replace />} />

              <Route path="/hrms/branches" element={<ProtectedRoute element={<BranchList />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/hrms/branches/create" element={<ProtectedRoute element={<BranchForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/hrms/branches/edit/:id" element={<ProtectedRoute element={<BranchForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/hrms/shifts" element={<ProtectedRoute element={<ShiftList />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/hrms/shifts/create" element={<ProtectedRoute element={<ShiftForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/hrms/shifts/edit/:id" element={<ProtectedRoute element={<ShiftForm />} permission="COMPANY_PROFILE_UPDATE" />} />

              <Route path="/crm/stages" element={<ProtectedRoute element={<LeadStageList />} permission="COMPANY_PROFILE_VIEW" />} />
              <Route path="/crm/stages/create" element={<ProtectedRoute element={<LeadStageForm />} permission="COMPANY_PROFILE_UPDATE" />} />
              <Route path="/crm/stages/edit/:id" element={<ProtectedRoute element={<LeadStageForm />} permission="COMPANY_PROFILE_UPDATE" />} />

              <Route path="/marketing/*" element={<ProtectedRoute element={<MarketingApp />} permission="MARKETING_VIEW" />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { theme } = useAppStore();

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
