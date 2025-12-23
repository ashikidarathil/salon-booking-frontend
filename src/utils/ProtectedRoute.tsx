import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
  roles: string[];
};

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return null;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}