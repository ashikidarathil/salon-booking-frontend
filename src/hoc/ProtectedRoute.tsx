// frontend/src/hoc/ProtectedRoute.tsx or components/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedRouteProps {
  roles?: string[]; // optional if you want to allow any authenticated user
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check if roles are provided
  if (roles && user && !roles.includes(user.role)) {
    // Redirect based on role or home
    const redirectPath =
      user.role === 'ADMIN' ? '/admin' : user.role === 'STYLIST' ? '/stylist' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // All good → render nested routes
  return <Outlet />;
}
