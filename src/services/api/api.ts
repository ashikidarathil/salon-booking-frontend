import axios from 'axios';
import { getTabId } from '@/common/utils/api.utils';
import { slowRequests } from './slowRequests';

export const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5001/api';
export const SOCKET_BASE_URL =
  (import.meta.env.VITE_SOCKET_URL as string) ?? BASE_URL.replace('/api', '');

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  // Generous timeout: the free-tier backend can take ~50s to wake from sleep
  timeout: 60000,
});

type TrackedConfig = { _doneSlowTracking?: () => void };

const settle = (config?: TrackedConfig) => {
  config?._doneSlowTracking?.();
  if (config) config._doneSlowTracking = undefined;
};

api.interceptors.request.use((config) => {
  (config as TrackedConfig)._doneSlowTracking = slowRequests.track();
  const role = sessionStorage.getItem('user_role');
  config.headers['X-Tab-ID'] = getTabId();

  if (role) {
    config.headers['X-Auth-Role'] = role;
  } else {
    config.headers['X-Auth-Role'] = 'USER';
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    settle(response.config as TrackedConfig);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    settle(originalRequest as TrackedConfig | undefined);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-Tab-ID': getTabId(),
              'X-Auth-Role': sessionStorage.getItem('user_role') || 'USER',
            },
          },
        );

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
