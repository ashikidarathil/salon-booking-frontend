import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { restoreAuth } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return <AppRoutes />;
}