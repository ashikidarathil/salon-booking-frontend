import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '@/services/notification.service';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { NOTIFICATION_MESSAGES } from '../constants/notification.messages';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (params: { isRead?: boolean; limit?: number; skip?: number } = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getMyNotifications(params.isRead, params.limit, params.skip);
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue, NOTIFICATION_MESSAGES.FETCH_ERROR);
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue, NOTIFICATION_MESSAGES.MARK_READ_ERROR);
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error: unknown) {
      return handleThunkError(error, rejectWithValue, NOTIFICATION_MESSAGES.MARK_ALL_READ_ERROR);
    }
  },
);
