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


// vendor module 
import { useAppStore } from './store/useAppStore';
import MainLayout from './layouts/MainLayout';
import VendorAnalyticsDashboard from './pages/VendorAnalyticsDashboard';
import Vendors from './pages/Vendors';
import Procurement from './pages/Procurement';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import Performance from './pages/Performance';
import RiskCompliance from './pages/RiskCompliance';


import VendorPortal from './pages/VendorPortal';
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
  const isPublicRoute = ['/login', '/signup', '/register', '/unauthorized'].includes(location.pathname) || location.pathname.startsWith('/verify/');

  if (isVendorRoute || isPublicRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify/:identifier" element={<PublicVerificationPage />} />
        
        <Route path="/vendor-portal" element={<VendorProtectedRoute><VendorPortal /></VendorProtectedRoute>} />
        <Route path="/vendor-dashboard" element={<StaffProtectedRoute><MainLayout /></StaffProtectedRoute>}>
          <Route index element={<Navigate to="/vendor-dashboard/analytics" replace />} />
          <Route path="analytics" element={<VendorAnalyticsDashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="invoices" element={<Invoices />} />
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

              {/* ── Users ── */}
              <Route path="/users" element={<ProtectedRoute element={<UserList />} permission="USER_VIEW" />} />
              <Route path="/users/create" element={<ProtectedRoute element={<UserForm />} permission="USER_CREATE" />} />
              <Route path="/users/edit/:id" element={<ProtectedRoute element={<UserForm />} permission="USER_UPDATE" />} />

              {/* ── Roles ── */}
              <Route path="/roles" element={<ProtectedRoute element={<RoleList />} permission="ROLE_CREATE" />} />
              <Route path="/roles/create" element={<ProtectedRoute element={<RoleForm />} permission="ROLE_CREATE" />} />
              <Route path="/roles/edit/:id" element={<ProtectedRoute element={<RoleForm />} permission="ROLE_CREATE" />} />

              {/* ── Permissions & hierarchy ── */}
              <Route path="/permissions" element={<ProtectedRoute element={<Permissions />} permission="PERMISSION_CREATE" />} />
              <Route path="/role-mapping" element={<ProtectedRoute element={<RoleMapping />} permission="ROLE_CREATE" />} />
              <Route path="/role-hierarchy" element={<ProtectedRoute element={<RoleHierarchy />} />} />

              {/* ── Tenants (Platform Admin) ── */}
              <Route path="/tenants" element={<ProtectedRoute element={<TenantsList />} permission="TENANT_VIEW" />} />
              <Route path="/tenants/:id" element={<ProtectedRoute element={<TenantDetails />} permission="TENANT_VIEW" />} />
              <Route path="/create-tenant" element={<ProtectedRoute element={<CreateTenant />} permission="TENANT_CREATE" />} />

              {/* ── Settings ── */}
              <Route path="/settings/company-profile" element={<ProtectedRoute element={<CompanyProfilePage />} />} />
              <Route path="/settings/id-generation" element={<ProtectedRoute element={<IdGenerationSettings />} />} />
              <Route path="/settings/templates" element={<ProtectedRoute element={<TemplatesPage />} />} />
              <Route path="/settings/templates/create" element={<ProtectedRoute element={<TemplateFormPage />} />} />
              <Route path="/settings/templates/edit/:id" element={<ProtectedRoute element={<TemplateFormPage />} />} />
              <Route path="/settings/certificates" element={<ProtectedRoute element={<CertificatesList />} />} />
              <Route path="/settings/*" element={<Navigate to="/settings/id-generation" replace />} />

              {/* ── HRMS ── */}
              <Route path="/hrms/branches" element={<ProtectedRoute element={<BranchList />} />} />
              <Route path="/hrms/branches/create" element={<ProtectedRoute element={<BranchForm />} />} />
              <Route path="/hrms/branches/edit/:id" element={<ProtectedRoute element={<BranchForm />} />} />

              <Route path="/hrms/shifts" element={<ProtectedRoute element={<ShiftList />} />} />
              <Route path="/hrms/shifts/create" element={<ProtectedRoute element={<ShiftForm />} />} />
              <Route path="/hrms/shifts/edit/:id" element={<ProtectedRoute element={<ShiftForm />} />} />

              {/* ── CRM ── */}
              <Route path="/crm/stages" element={<ProtectedRoute element={<LeadStageList />} />} />
              <Route path="/crm/stages/create" element={<ProtectedRoute element={<LeadStageForm />} />} />
              <Route path="/crm/stages/edit/:id" element={<ProtectedRoute element={<LeadStageForm />} />} />

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
