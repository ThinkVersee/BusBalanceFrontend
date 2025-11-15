import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Always read from localStorage (client-only)
    if (typeof window === 'undefined') return config;

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    let token = null;

    if (user?.is_superuser) {
      token = localStorage.getItem('superadmin_access_token');
    } else {
      token = localStorage.getItem('access_token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const isSuper = user?.is_superuser;
        const refreshToken = isSuper
          ? localStorage.getItem('superadmin_refresh_token')
          : localStorage.getItem('refresh_token');

        if (!refreshToken) throw new Error('No refresh token');

        const refreshEndpoint = isSuper
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/token/refresh/`
          : `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`;

        const { data } = await axios.post(refreshEndpoint, { refresh: refreshToken });
        const newAccess = data.access;

        // Save new access token
        if (isSuper) {
          localStorage.setItem('superadmin_access_token', newAccess);
        } else {
          localStorage.setItem('access_token', newAccess);
        }

        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);

        // DO NOT use window.location.href → causes full reload
        // Instead, just clear and let RouteGuard handle redirect
        localStorage.clear();

        // Let RouteGuard handle navigation
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;