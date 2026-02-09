import axios from 'axios';
import { getTabId } from '@/common/utils/api.utils';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['X-Tab-ID'] = getTabId();
  return config;
});
