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
import CartPage from '@/pages/user/CartPage';
import CheckoutPage from '@/pages/user/CheckoutPage';
import BookingsPage from '@/pages/user/BookingsPage';
import BookingDetailPage from '@/pages/user/BookingDetailPage';
import WalletPage from '@/pages/user/WalletPage';
import PaymentSuccessPage from '@/pages/user/PaymentSuccessPage';
import PaymentFailurePage from '@/pages/user/PaymentFailurePage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import { RoleNotFound } from '@/components/common/RoleNotFound';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLogin';
import StylistManagementPage from '@/pages/admin/stylist/StylistManagementPage';
import SlotManagementPage from '@/pages/admin/SlotManagementPage';
import UserManagementPage from '@/pages/admin/user/UserManagementPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import ServicesPage from '@/pages/admin/ServicesPage';
import BranchesPage from '@/pages/admin/branch/BranchesPage';
import OffDayManagementPage from '@/pages/admin/stylist/OffDayManagementPage';
import DashboardContent from '@/pages/admin/DashboardContent';
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage';
import AdminBookingDetailPage from '@/pages/admin/AdminBookingDetailPage';
import CouponManagementPage from '@/pages/admin/CouponManagementPage';
import AdminChatPage from '@/pages/admin/AdminChatPage';

import HolidayManagementPage from '@/pages/admin/holiday/HolidayManagementPage';

// Stylist Pages
import AcceptInvitePage from '@/pages/stylist/AcceptInvitePage';
import StylistLoginPage from '@/pages/stylist/StylistLoginPage';
import StylistDashboard from '@/pages/stylist/StylistDashboard';
import StylistProfilePage from '@/pages/stylist/StylistProfilePage';
import StylistSchedulePage from '@/pages/stylist/StylistSchedulePage';
import OffDayPage from '@/pages/stylist/OffDayPage';
import StylistSlotManagementPage from '@/pages/stylist/StylistSlotManagementPage';
import StylistAppointmentsPage from '@/pages/stylist/StylistAppointmentsPage';
import StylistBookingDetailPage from '@/pages/stylist/StylistBookingDetailPage';
import StylistWalletPage from '@/pages/stylist/StylistWalletPage';
import AdminWalletPage from '@/pages/admin/AdminWalletPage';

// Layouts
import { SalonAdminLayout } from '@/layouts/admin/SalonAdminLayout';
import { StylistLayout } from '@/layouts/stylist/StylistLayout';
import ProfileLayout from '@/layouts/userProfile/ProfileLayout';

// User Pages
import HomePage from '@/pages/user/HomePage';
import ContactPage from '@/pages/user/ContactPage';
import ProfileContent from '@/pages/user/ProfileContent';
import FavoritesPage from '@/pages/user/FavoritesPage';
import NotificationsPage from '@/features/notification/pages/NotificationsPage';

// HOC
import ProtectedRoute from '@/hoc/ProtectedRoute';

// Shared Pages
import ChatPage from '@/pages/shared/ChatPage';

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
      <Route path="/cart" element={<CartPage />} />

      {/* Admin Login */}
      <Route path={APP_ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />

      {/* Stylist Invite Flow */}
      <Route path={APP_ROUTES.STYLIST.INVITE} element={<AcceptInvitePage />} />
      <Route path={APP_ROUTES.STYLIST.LOGIN} element={<StylistLoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={['USER']} />}>
        <Route path={APP_ROUTES.USER.CART} element={<CartPage />} />
        <Route path={APP_ROUTES.USER.CHECKOUT} element={<CheckoutPage />} />
        <Route path="/payment/success/:bookingId" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure/:bookingId" element={<PaymentFailurePage />} />
        <Route path={APP_ROUTES.USER.PROFILE} element={<ProfileLayout />}>
          <Route index element={<ProfileContent />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path={APP_ROUTES.ADMIN.DASHBOARD} element={<SalonAdminLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="stylists" element={<StylistManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="slots" element={<SlotManagementPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="bookings/:id" element={<AdminBookingDetailPage />} />
          <Route path="off-days" element={<OffDayManagementPage />} />
          <Route path="holidays" element={<HolidayManagementPage />} />
          <Route path="coupons" element={<CouponManagementPage />} />
          <Route path="chat" element={<AdminChatPage />} />
          <Route path="wallet" element={<AdminWalletPage />} />
          <Route path="*" element={<RoleNotFound role="ADMIN" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['STYLIST']} />}>
        <Route path={APP_ROUTES.STYLIST.DASHBOARD} element={<StylistLayout />}>
          <Route index element={<StylistDashboard />} />
          <Route path="profile" element={<StylistProfilePage />} />
          <Route path="schedule" element={<StylistSchedulePage />} />
          <Route path="slots" element={<StylistSlotManagementPage />} />
          <Route path="off-days" element={<OffDayPage />} />
          <Route path="appointments" element={<StylistAppointmentsPage />} />
          <Route path="appointments/:id" element={<StylistBookingDetailPage />} />
          <Route path="wallet" element={<StylistWalletPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="*" element={<RoleNotFound role="STYLIST" />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
