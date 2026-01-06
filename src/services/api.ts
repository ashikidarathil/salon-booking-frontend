import axios from 'axios';

const getTabId = () => {
  let tabId = sessionStorage.getItem('tab_id');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tab_id', tabId);
  }
  return tabId;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['X-Tab-ID'] = getTabId();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const url = original?.url || '';

    if (status !== 401) return Promise.reject(error);
    if (status === 401 && message?.includes('different tab')) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (original._retry) return Promise.reject(error);
    original._retry = true;

    try {
      await api.post('/auth/refresh');
      return api(original);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
