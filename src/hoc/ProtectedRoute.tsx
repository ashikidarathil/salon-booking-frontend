
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

 
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {

    const redirectPath =
      user.role === 'ADMIN' ? '/admin' : user.role === 'STYLIST' ? '/stylist' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
