import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/config/axiosInstance';
import Cookies from 'js-cookie';

/* ===========================================================
   🧩 HELPER: SET AUTH COOKIES + LOCALSTORAGE
   =========================================================== */
const setAuthCookies = (tokens, isSuperAdmin) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: 7, // 7 days
  };

  // ✅ Set tokens in cookies
  Cookies.set(`${prefix}access_token`, tokens.access, cookieOptions);
  Cookies.set(`${prefix}refresh_token`, tokens.refresh, cookieOptions);

  // ✅ Backup in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${prefix}access_token`, tokens.access);
    localStorage.setItem(`${prefix}refresh_token`, tokens.refresh);
  }
};

/* ===========================================================
   🧩 HELPER: CLEAR AUTH COOKIES + LOCALSTORAGE
   =========================================================== */
const clearAuthCookies = (isSuperAdmin = false) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';

  // ✅ Remove cookies
  Cookies.remove(`${prefix}access_token`);
  Cookies.remove(`${prefix}refresh_token`);

  // ✅ Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);
  }

  // ✅ Remove user object
  localStorage.removeItem('user');

  // ✅ Also clear opposite role tokens (optional for safety)
  if (isSuperAdmin) {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } else {
    Cookies.remove('superadmin_access_token');
    Cookies.remove('superadmin_refresh_token');
    localStorage.removeItem('superadmin_access_token');
    localStorage.removeItem('superadmin_refresh_token');
  }

  console.log(`🧹 Cleared all ${isSuperAdmin ? 'superadmin' : 'user'} tokens.`);
};

/* ===========================================================
   🧩 LOGIN THUNK
   =========================================================== */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password, endpoint = '/login/' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(endpoint, { username, password });
      const data = response.data;
      const isSuperAdmin = endpoint.includes('superadmin') || endpoint.includes('admin');

      // Normalize token structure
      const tokens = data.tokens ? data.tokens : { access: data.access, refresh: data.refresh };

      // Save tokens and user
      setAuthCookies(tokens, isSuperAdmin);
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return { user: data.user, tokens, isSuperAdmin };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

/* ===========================================================
   🧩 LOGOUT THUNK
   =========================================================== */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ Always clear tokens
      clearAuthCookies(isSuperAdmin);
    }
    return { success: true };
  }
);

/* ===========================================================
   🧩 REFRESH TOKEN THUNK
   =========================================================== */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue, getState }) => {
    try {
      const prefix = isSuperAdmin ? 'superadmin_' : '';
      const refreshToken =
        getState().auth.refreshToken ||
        Cookies.get(`${prefix}refresh_token`) ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(`${prefix}refresh_token`)
          : null);

      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });

      const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7,
      };

      Cookies.set(`${prefix}access_token`, response.data.access, cookieOptions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${prefix}access_token`, response.data.access);
      }

      return response.data;
    } catch (error) {
      clearAuthCookies(isSuperAdmin);
      return rejectWithValue(error.response?.data || { error: 'Token refresh failed' });
    }
  }
);

/* ===========================================================
   🧩 INITIAL TOKEN LOADING
   =========================================================== */
const getInitialTokens = () => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, isSuperAdmin: false };
  }

  // Superadmin tokens first
  const superadminAccessToken =
    Cookies.get('superadmin_access_token') || localStorage.getItem('superadmin_access_token');
  if (superadminAccessToken) {
    return {
      accessToken: superadminAccessToken,
      refreshToken:
        Cookies.get('superadmin_refresh_token') ||
        localStorage.getItem('superadmin_refresh_token'),
      isSuperAdmin: true,
    };
  }

  // Normal user tokens
  const accessToken = Cookies.get('access_token') || localStorage.getItem('access_token');
  return {
    accessToken: accessToken || null,
    refreshToken: Cookies.get('refresh_token') || localStorage.getItem('refresh_token'),
    isSuperAdmin: false,
  };
};

const initialTokens = getInitialTokens();

/* ===========================================================
   🧩 SLICE
   =========================================================== */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
    accessToken: initialTokens.accessToken,
    refreshToken: initialTokens.refreshToken,
    isAuthenticated: !!initialTokens.accessToken,
    isSuperAdmin: initialTokens.isSuperAdmin,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens?.access || null;
      state.refreshToken = action.payload.tokens?.refresh || null;
      state.isAuthenticated = !!action.payload.user;
      state.isSuperAdmin = action.payload.isSuperAdmin || false;

      if (action.payload.tokens) {
        setAuthCookies(action.payload.tokens, action.payload.isSuperAdmin);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isSuperAdmin = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;

/* ===========================================================
   🧩 SELECTORS
   =========================================================== */
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsSuperAdmin = (state) => state.auth.isSuperAdmin;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
