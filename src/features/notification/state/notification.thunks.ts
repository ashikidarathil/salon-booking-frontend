import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../../services/notification.service';
// import type { NotificationResponse } from '../types/notification.types';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (
    { isRead, limit, skip }: { isRead?: boolean; limit?: number; skip?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      return await notificationService.getMyNotifications(isRead, limit, skip);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);
