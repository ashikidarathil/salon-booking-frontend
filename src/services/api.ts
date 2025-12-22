import axios from 'axios';
import { getToken, clearToken } from '../utils/token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:5001/api
  withCredentials: false,
});

/* ======================
   REQUEST INTERCEPTOR
====================== */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ======================
   RESPONSE INTERCEPTOR
====================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired / unauthorized
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
