import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/config/axiosInstance';
import Cookies from 'js-cookie';

/* ===========================================================
   HELPER: Set Auth Cookies + localStorage (sync)
   =========================================================== */
const setAuthCookies = (tokens, isSuperAdmin = false) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: 7,
  };
  Cookies.set(`${prefix}access_token`, tokens.access, cookieOptions);
  Cookies.set(`${prefix}refresh_token`, tokens.refresh, cookieOptions);
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${prefix}access_token`, tokens.access);
    localStorage.setItem(`${prefix}refresh_token`, tokens.refresh);
  }
};

/* ===========================================================
   HELPER: Clear All Auth Data
   =========================================================== */
const clearAuthData = (isSuperAdmin = false) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';
  Cookies.remove(`${prefix}access_token`);
  Cookies.remove(`${prefix}refresh_token`);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);
  }
  const opposite = isSuperAdmin ? '' : 'superadmin_';
  Cookies.remove(`${opposite}access_token`);
  Cookies.remove(`${opposite}refresh_token`);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${opposite}access_token`);
    localStorage.removeItem(`${opposite}refresh_token`);
    localStorage.removeItem('user');
  }
};

/* ===========================================================
   THUNK: Login User
   =========================================================== */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password, endpoint = '/login/' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(endpoint, { username, password });
      const data = response.data;
      const isSuperAdmin = endpoint.includes('admin') || endpoint.includes('superadmin');
      const tokens = data.tokens || { access: data.access, refresh: data.refresh };
      setAuthCookies(tokens, isSuperAdmin);
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { user: data.user, tokens, isSuperAdmin };
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.error || 'Login failed';
      return rejectWithValue({ message });
    }
  }
);

/* ===========================================================
   THUNK: Logout User
   =========================================================== */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/logout/');
    } catch (error) {
      console.warn('Logout API failed (continuing cleanup):', error);
    } finally {
      clearAuthData(isSuperAdmin);
    }
    return { success: true };
  }
);

/* ===========================================================
   THUNK: Refresh Token
   =========================================================== */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue, getState }) => {
    try {
      const prefix = isSuperAdmin ? 'superadmin_' : '';
      const state = getState().auth;
      const refreshTokenValue =
        state.refreshToken ||
        Cookies.get(`${prefix}refresh_token`) ||
        (typeof window !== 'undefined' ? localStorage.getItem(`${prefix}refresh_token`) : null);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      const endpoint = isSuperAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/token/refresh/`
        : `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`;
      const { data } = await axiosInstance.post(endpoint, { refresh: refreshTokenValue });
      const cookieOptions = { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: 7 };
      Cookies.set(`${prefix}access_token`, data.access, cookieOptions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${prefix}access_token`, data.access);
      }
      return { access: data.access, isSuperAdmin };
    } catch (error) {
      const message = error.response?.data?.detail || 'Token refresh failed';
      clearAuthData(isSuperAdmin);
      return rejectWithValue({ message });
    }
  }
);

/* ===========================================================
   INITIAL TOKEN LOADER (SSR-safe)
   =========================================================== */
const loadInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      isSuperAdmin: false,
      user: null,
    };
  }

  const superAccess = Cookies.get('superadmin_access_token') || localStorage.getItem('superadmin_access_token');
  if (superAccess) {
    return {
      accessToken: superAccess,
      refreshToken: Cookies.get('superadmin_refresh_token') || localStorage.getItem('superadmin_refresh_token'),
      isSuperAdmin: true,
      user: JSON.parse(localStorage.getItem('user') || 'null'),
    };
  }

  const access = Cookies.get('access_token') || localStorage.getItem('access_token');
  return {
    accessToken: access || null,
    refreshToken: Cookies.get('refresh_token') || localStorage.getItem('refresh_token'),
    isSuperAdmin: false,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  };
};

const initialAuth = loadInitialAuthState();

/* ===========================================================
   AUTH SLICE
   =========================================================== */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialAuth.user,
    accessToken: initialAuth.accessToken,
    refreshToken: initialAuth.refreshToken,
    isAuthenticated: !!initialAuth.accessToken,
    isSuperAdmin: initialAuth.isSuperAdmin,
    isLoading: false,
    isInitializing: true, // NEW: Are we still checking tokens?
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, tokens, isSuperAdmin } = action.payload;
      state.user = user;
      state.accessToken = tokens?.access || null;
      state.refreshToken = tokens?.refresh || null;
      state.isAuthenticated = !!user;
      state.isSuperAdmin = !!isSuperAdmin;
      state.isInitializing = false;
      if (tokens) setAuthCookies(tokens, isSuperAdmin);
    },
    forceLogout: (state) => {
      clearAuthData(state.isSuperAdmin);
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isSuperAdmin = false;
      state.isInitializing = false;
      state.error = 'Session expired. Please log in again.';
    },
    // NEW: Mark initialization complete (used after hydration check)
    finishInitialization: (state) => {
      state.isInitializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.isSuperAdmin = action.payload.isSuperAdmin;
        state.isInitializing = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.isInitializing = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.isInitializing = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.isInitializing = false;
      })

      // REFRESH
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
        state.isSuperAdmin = action.payload.isSuperAdmin;
        state.isInitializing = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.isInitializing = false;
        state.error = action.payload?.message || 'Session expired';
      });
  },
});

export const { clearError, setCredentials, forceLogout, finishInitialization } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsSuperAdmin = (state) => state.auth.isSuperAdmin;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsInitializing = (state) => state.auth.isInitializing; // NEW

export default authSlice.reducer;