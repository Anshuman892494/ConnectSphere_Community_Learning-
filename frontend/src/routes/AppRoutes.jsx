import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Feed from '../pages/Feed';
import Verify from '../pages/Verify';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PageContainer from '../components/layout/PageContainer';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg transition-colors duration-200">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Verification page (accessible only to logged in but unverified users) */}
      <Route element={<ProtectedRoute allowUnverified={true} />}>
        <Route path="/verify" element={<Verify />} />
      </Route>

      {/* Protected Routes Group */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main User Dashboard / Feed */}
          <Route path="/" element={<Feed />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
