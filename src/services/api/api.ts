import axios from 'axios';
import { getTabId } from '@/common/utils/api.utils';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const role = sessionStorage.getItem('user_role') || 'USER';
  config.headers['X-Tab-ID'] = getTabId();
  if (role) {
    config.headers['X-Auth-Role'] = role;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh_token cookie (handled by backend/refresh)
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-Tab-ID': getTabId(),
              'X-Auth-Role': sessionStorage.getItem('user_role'),
            },
          },
        );

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear role and redirect to login if necessary
        // (The app's state management will handle logout on 401 if refresh fails)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
