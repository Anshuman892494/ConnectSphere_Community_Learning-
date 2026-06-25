import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Feed from '../pages/Feed';
import QAList from '../pages/QAList';
import QADetails from '../pages/QADetails';
import Profile from '../pages/Profile';
import PointTransferPage from '../pages/PointTransferPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import SecurityMonitoring from '../pages/SecurityMonitoring';
import AdminDashboard from '../pages/AdminDashboard';

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

      {/* Protected Routes Group */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main User Pages */}
          <Route path="/" element={<Feed />} />
          <Route path="/qa" element={<QAList />} />
          <Route path="/qa/:id" element={<QADetails />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/transfer" element={<PointTransferPage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/security" element={<SecurityMonitoring />} />
          
          {/* Admin Moderation Page */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
