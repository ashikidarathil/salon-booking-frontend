import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNotifications();
  return <>{children}</>;
};
