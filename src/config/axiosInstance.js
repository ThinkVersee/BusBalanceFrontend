import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================
// REQUEST INTERCEPTOR
// =============================
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    let token = null;

    if (user?.is_superuser) {
      token = localStorage.getItem('superadmin_access_token');
      console.log('%c[Axios] Using SUPERADMIN access token:', 'color: #d97706', token);
    } else {
      token = localStorage.getItem('access_token');
      console.log('%c[Axios] Using NORMAL USER access token:', 'color: #2563eb', token);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('%c[Axios] No access token found in localStorage', 'color: #ef4444');
    }

    console.log('%c[Axios Request]', 'color: #10b981', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('%c[Axios Request Error]', 'color: #ef4444', error);
    return Promise.reject(error);
  }
);

// =============================
// RESPONSE INTERCEPTOR
// =============================
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('%c[Axios Response Success]', 'color: #22c55e', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Safe logging even if error.response is undefined
    console.error('%c[Axios Response Error]', 'color: #ef4444', {
      url: originalRequest?.url,
      status: error.response?.status ?? 'No response',
      data: error.response?.data ?? error.message,
    });

    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = JSON.parse(localStorage.getItem('user'));
        let refreshToken = null;
        let refreshUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/token/refresh/`; // fixed double slash

        if (user?.is_superuser) {
          refreshToken = localStorage.getItem('superadmin_refresh_token');
          console.log('%c[Axios] Refreshing SUPERADMIN token...', 'color: #d97706');
        } else {
          refreshToken = localStorage.getItem('refresh_token');
<<<<<<< HEAD
          console.log('%c[Axios] Refreshing USER token...', 'color: #2563eb');
=======
          refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`;
>>>>>>> 4618057 (fix-(employee)-finance mangement model and design created)
        }

        const response = await axios.post(refreshUrl, { refresh: refreshToken });
        const { access } = response.data;

        if (user?.is_superuser) {
          localStorage.setItem('superadmin_access_token', access);
          console.log('%c[Axios] New SUPERADMIN access token stored', 'color: #d97706', access);
        } else {
          localStorage.setItem('access_token', access);
          console.log('%c[Axios] New USER access token stored', 'color: #2563eb', access);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        console.log('%c[Axios] Retrying original request with new token', 'color: #10b981');

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('%c[Axios] Token refresh failed. Logging out...', 'color: #ef4444', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('superadmin_access_token');
        localStorage.removeItem('superadmin_refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
