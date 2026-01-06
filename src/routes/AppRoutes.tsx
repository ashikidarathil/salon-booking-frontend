import { Routes, Route } from 'react-router-dom';

// Public Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyPhoneOtpPage from '@/pages/auth/VerifyPhoneOtpPage';
import VerifyResetOtpPage from '@/pages/auth/VerifyResetOtpPage';
import NewPasswordPage from '@/pages/auth/NewPasswordPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLogin';
import StylistManagementPage from '@/pages/admin/stylist/StylistManagementPage';
import UserManagementPage from '@/pages/admin/user/UserManagementPage';

// Stylist Pages
import AcceptInvitePage from '@/pages/stylist/AcceptInvitePage';
import StylistLoginPage from '@/pages/stylist/StylistLoginPage';
import StylistDashboard from '@/pages/stylist/StylistDashboard';
import StylistProfilePage from '@/pages/stylist/StylistProfilePage';
import { StylistLayout } from '@/pages/stylist/StylistLayout';
import DashboardContent from '@/pages/admin/DashboardContent';

// Layouts
import { SalonAdminLayout } from '@/pages/admin/SalonAdminLayout';
import ProfileLayout from '@/layouts/user/ProfileLayout';

// User Pages
import HomePage from '@/pages/user/HomePage';
import ContactPage from '@/pages/user/ContactPage';
import ProfileContent from '@/pages/user/ProfileContent';

// HOC
import ProtectedRoute from '@/hoc/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ====================== */}
      {/* PUBLIC AUTH ROUTES     */}
      {/* ====================== */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-phone-otp" element={<VerifyPhoneOtpPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
      <Route path="/new-password" element={<NewPasswordPage />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ====================== */}
      {/* STYLIST INVITE FLOW    */}
      {/* ====================== */}
      <Route path="/stylist/invite/:token" element={<AcceptInvitePage />} />
      <Route path="/stylist/login" element={<StylistLoginPage />} />

      {/* ====================== */}
      {/* PROTECTED ROUTES       */}
      {/* ====================== */}

      {/* User Dashboard */}
      <Route path="/user" element={<ProtectedRoute roles={['USER']} />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<ProfileContent />} />
        </Route>
      </Route>

      {/* Admin Dashboard & Management */}
      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<SalonAdminLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="stylists" element={<StylistManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Route>

      {/* Stylist Dashboard */}
      <Route element={<ProtectedRoute roles={['STYLIST']} />}>
        <Route path="/stylist" element={<StylistLayout />}>
          <Route index element={<StylistDashboard />} />
          <Route path="profile" element={<StylistProfilePage />} />
        </Route>
      </Route>

      {/* ====================== */}
      {/* FALLBACK              */}
      {/* ====================== */}
      <Route
        path="*"
        element={<div className="p-10 text-2xl text-center">404 - Page Not Found</div>}
      />
    </Routes>
  );
}
