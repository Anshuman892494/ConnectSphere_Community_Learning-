import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Feed from '../pages/Feed';
import Verify from '../pages/Verify';
import ForgotPassword from '../pages/ForgotPassword';
import Settings from '../pages/Settings';

// Layout Components
import Sidebar from '../components/layout/Sidebar';
import PageContainer from '../components/layout/PageContainer';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Verification page (accessible only to logged in but unverified users) */}
      <Route element={<ProtectedRoute allowUnverified={true} />}>
        <Route path="/verify" element={<Verify />} />
      </Route>

      {/* Protected Routes Group */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main User Dashboard / Feed */}
          <Route path="/" element={<Feed />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
