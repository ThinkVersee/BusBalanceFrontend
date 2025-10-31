import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

 
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));  
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
  (error) => Promise.reject(error)
);

// ✅ Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        let refreshToken = null;
        let refreshUrl = null;

        if (user?.is_superuser) {
          refreshToken = localStorage.getItem('superadmin_refresh_token');
          refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/superadmin/token/refresh/`;
        } else {
          refreshToken = localStorage.getItem('refresh_token');
          refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`;
        }

        const response = await axios.post(refreshUrl, { refresh: refreshToken });

        const { access } = response.data;
        if (user?.is_superuser) {
          localStorage.setItem('superadmin_access_token', access);
        } else {
          localStorage.setItem('access_token', access);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
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
