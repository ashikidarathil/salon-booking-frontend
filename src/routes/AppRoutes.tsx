import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import UserDashboard from '../pages/user/UserDashboard';
import {SalonAdminDashboard} from '../pages/admin/AdminDashboard';
import StylistDashboard from '../pages/stylist/StylistDashboard';

import ProtectedRoute from '../utils/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/user"
        element={
          <ProtectedRoute roles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <SalonAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stylist"
        element={
          <ProtectedRoute roles={['STYLIST']}>
            <StylistDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
