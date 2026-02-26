import axios from 'axios';
import { getTabId } from '@/common/utils/api.utils';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const role = sessionStorage.getItem('user_role');
  config.headers['X-Tab-ID'] = getTabId();

  if (role) {
    config.headers['X-Auth-Role'] = role;
  } else {
    // If no role in session, we assume USER but don't force it in the header
    // to allow the backend to fall back to default or public routes.
    // Except for explicit private routes where we might want to default.
    config.headers['X-Auth-Role'] = 'USER';
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
