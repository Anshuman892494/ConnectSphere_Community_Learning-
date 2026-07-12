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
import Profile from '../pages/Profile';
import QuestionDetail from '../pages/QuestionDetail';
import Users from '../pages/Users';
import Tags from '../pages/Tags';
import AskQuestion from '../pages/AskQuestion';
import SocialSpace from '../pages/SocialSpace';

// Layout Components
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PhoneVerificationModal from '../components/common/PhoneVerificationModal';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <div className="flex-1 flex w-full max-w-[1264px] mx-auto mt-[50px] relative justify-center">
        <Sidebar />
        <main className="flex-1 max-w-[1100px] w-full bg-white sm:p-6 p-4 md:border-l border-gray-200 min-h-screen">
          <Outlet />
          <PhoneVerificationModal />
        </main>
      </div>
      <Footer />
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
          <Route path="/questions" element={<Feed />} />
          <Route path="/social" element={<SocialSpace />} />
          <Route path="/questions/ask" element={<AskQuestion />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/users" element={<Users />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
