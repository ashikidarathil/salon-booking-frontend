import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { ComponentType } from 'react';
import type { User } from '../features/auth/authTypes';

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: User['role'][],
) {
  return function AuthComponent(props: P) {
    const { token, user } = useAppSelector((state) => state.auth);

    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}
