import { Routes, Route } from 'react-router-dom';
import { APP_ROUTES } from '@/common/constants/app.routes';

// Public Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyPhoneOtpPage from '@/pages/auth/VerifyPhoneOtpPage';
import VerifyResetOtpPage from '@/pages/auth/VerifyResetOtpPage';
import NewPasswordPage from '@/pages/auth/NewPasswordPage';
import BranchesListingPage from '@/pages/user/BranchesListingPage';
import ServicesListingPage from '@/pages/user/ServicesListingPage';
import ServiceDetailsPage from '@/pages/user/service/ServiceDetailsPage';
import StylistsListingPage from '@/pages/user/stylist/StylistsListingPage';
import StylistDetailsPage from '@/pages/user/stylist/StylistDetailsPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLogin';
import StylistManagementPage from '@/pages/admin/stylist/StylistManagementPage';
import StylistDetailPage from '@/pages/admin/stylist/StylistDetailPage';
import SlotManagementPage from '@/pages/admin/SlotManagementPage';
import UserManagementPage from '@/pages/admin/user/UserManagementPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import ServicesPage from '@/pages/admin/ServicesPage';
import BranchesPage from '@/pages/admin/branch/BranchesPage';
import OffDayManagementPage from '@/pages/admin/stylist/OffDayManagementPage';
import DashboardContent from '@/pages/admin/DashboardContent';

// Stylist Pages
import AcceptInvitePage from '@/pages/stylist/AcceptInvitePage';
import StylistLoginPage from '@/pages/stylist/StylistLoginPage';
import StylistDashboard from '@/pages/stylist/StylistDashboard';
import StylistProfilePage from '@/pages/stylist/StylistProfilePage';
import StylistSchedulePage from '@/pages/stylist/StylistSchedulePage';
import OffDayPage from '@/pages/stylist/OffDayPage';
import StylistSlotManagementPage from '@/pages/stylist/StylistSlotManagementPage';

// Layouts
import { SalonAdminLayout } from '@/layouts/admin/SalonAdminLayout';
import { StylistLayout } from '@/layouts/stylist/StylistLayout';
import ProfileLayout from '@/layouts/userProfile/ProfileLayout';

// User Pages
import HomePage from '@/pages/user/HomePage';
import ContactPage from '@/pages/user/ContactPage';
import ProfileContent from '@/pages/user/ProfileContent';

// HOC
import ProtectedRoute from '@/hoc/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/branches" element={<BranchesListingPage />} />
      <Route path="/services" element={<ServicesListingPage />} />
      <Route path="/branches/:branchId/services/:serviceId" element={<ServiceDetailsPage />} />
      <Route path={APP_ROUTES.PUBLIC.SIGNUP} element={<SignupPage />} />
      <Route path={APP_ROUTES.PUBLIC.VERIFY_OTP} element={<VerifyOtpPage />} />
      <Route path={APP_ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />
      <Route path={APP_ROUTES.PUBLIC.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={APP_ROUTES.PUBLIC.VERIFY_PHONE_OTP} element={<VerifyPhoneOtpPage />} />
      <Route path={APP_ROUTES.PUBLIC.HOME} element={<HomePage />} />
      <Route path={APP_ROUTES.PUBLIC.CONTACT} element={<ContactPage />} />
      <Route path={APP_ROUTES.PUBLIC.VERIFY_RESET_OTP} element={<VerifyResetOtpPage />} />
      <Route path={APP_ROUTES.PUBLIC.NEW_PASSWORD} element={<NewPasswordPage />} />
      <Route path={APP_ROUTES.USER.STYLISTS} element={<StylistsListingPage />} />
      <Route path={APP_ROUTES.USER.STYLIST_DETAILS} element={<StylistDetailsPage />} />

      {/* Admin Login */}
      <Route path={APP_ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />

      {/* Stylist Invite Flow */}
      <Route path={APP_ROUTES.STYLIST.INVITE} element={<AcceptInvitePage />} />
      <Route path={APP_ROUTES.STYLIST.LOGIN} element={<StylistLoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={['USER']} />}>
        <Route path={APP_ROUTES.USER.DASHBOARD} element={<HomePage />} />
        <Route path={APP_ROUTES.USER.PROFILE} element={<ProfileLayout />}>
          <Route index element={<ProfileContent />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path={APP_ROUTES.ADMIN.DASHBOARD} element={<SalonAdminLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="stylists" element={<StylistManagementPage />} />
          <Route path="stylists/:stylistId" element={<StylistDetailPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="slots" element={<SlotManagementPage />} />
          <Route path="off-days" element={<OffDayManagementPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['STYLIST']} />}>
        <Route path={APP_ROUTES.STYLIST.DASHBOARD} element={<StylistLayout />}>
          <Route index element={<StylistDashboard />} />
          <Route path="profile" element={<StylistProfilePage />} />
          <Route path="schedule" element={<StylistSchedulePage />} />
          <Route path="slots" element={<StylistSlotManagementPage />} />
          <Route path="off-days" element={<OffDayPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
