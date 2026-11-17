import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { fetchMe } from '@/features/auth/authThunks';
import AppRoutes from '@/routes/AppRoutes';
import { NotificationWrapper } from '@/features/notification/components/NotificationWrapper';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ServerWakeBanner } from '@/components/common/ServerWakeBanner';

export default function App() {
  const dispatch = useAppDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchMe())
      .then(() => {
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, [dispatch]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <ServerWakeBanner />
      </div>
    );
  }

  return (
    <NotificationWrapper>
      <ScrollToTop />
      <AppRoutes />
      <ServerWakeBanner />
    </NotificationWrapper>
  );
}
