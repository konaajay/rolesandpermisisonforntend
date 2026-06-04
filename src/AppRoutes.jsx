import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayOut';
import Loading from '../components/common/Loading';

// Lazy Load Pages
const Home = lazy(() => import('../pages/Home/Home'));
const Marketing = lazy(() => import('../pages/marketing/App'));
const MyApp = lazy(() => import('../pages/MyApp/MyApp'));
const Affiliates = lazy(() => import('../pages/Affiliates/Affiliates'));
const AffiliateRegister = lazy(() => import('../pages/Affiliates/AffiliateRegister'));
const AffiliatePortal = lazy(() => import('../pages/Affiliates/AffiliatePortal'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/affiliate/join" element={<AffiliateRegister />} />

        {/* ================= DASHBOARD ROUTES ================= */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/affiliate/portal" element={<AffiliatePortal />} />
          <Route path="/marketing/*" element={<Marketing />} />
          <Route path="/myapp" element={<MyApp />} />
          <Route path="/settings" element={<Settings />} />

          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
