import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/config/axiosInstance';
import Cookies from 'js-cookie';

// Helper function to set auth cookies
const setAuthCookies = (tokens, isSuperAdmin) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: 7 // 7 days
  };
  
  Cookies.set(`${prefix}access_token`, tokens.access, cookieOptions);
  Cookies.set(`${prefix}refresh_token`, tokens.refresh, cookieOptions);
  
  // Also store in localStorage as backup
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${prefix}access_token`, tokens.access);
    localStorage.setItem(`${prefix}refresh_token`, tokens.refresh);
  }
};

// Helper function to clear auth cookies
const clearAuthCookies = (isSuperAdmin) => {
  const prefix = isSuperAdmin ? 'superadmin_' : '';
  
  Cookies.remove(`${prefix}access_token`);
  Cookies.remove(`${prefix}refresh_token`);
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password, endpoint = '/login/' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(endpoint, { username, password });
      const isSuperAdmin = endpoint.includes('superadmin') || endpoint.includes('admin');
      const data = response.data;

      // ✅ Normalize tokens structure
      const tokens = data.tokens
        ? data.tokens
        : { access: data.access, refresh: data.refresh };

      // ✅ Store tokens in cookies/localStorage
      setAuthCookies(tokens, isSuperAdmin);

      // ✅ Store user object in localStorage
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // ✅ Return normalized payload
      return {
        user: data.user,
        tokens,
        isSuperAdmin,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);


// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear cookies and localStorage
      clearAuthCookies(isSuperAdmin);
    }
    
    return { success: true };
  }
);

// Async thunk for refreshing token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async ({ isSuperAdmin = false } = {}, { rejectWithValue, getState }) => {
    try {
      const prefix = isSuperAdmin ? 'superadmin_' : '';
      const refreshToken = getState().auth.refreshToken || 
        Cookies.get(`${prefix}refresh_token`) ||
        (typeof window !== 'undefined' ? localStorage.getItem(`${prefix}refresh_token`) : null);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axiosInstance.post('/token/refresh/', {
        refresh: refreshToken,
      });
      
      // Update access token in cookies
      const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7
      };
      
      Cookies.set(`${prefix}access_token`, response.data.access, cookieOptions);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${prefix}access_token`, response.data.access);
      }
      
      return response.data;
    } catch (error) {
      // Clear invalid tokens
      clearAuthCookies(isSuperAdmin);
      return rejectWithValue(error.response?.data || { error: 'Token refresh failed' });
    }
  }
);

// Initialize state from cookies or localStorage
const getInitialTokens = () => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, isSuperAdmin: false };
  }
  
  // Check for superadmin tokens first
  const superadminAccessToken = Cookies.get('superadmin_access_token') || 
    localStorage.getItem('superadmin_access_token');
  
  if (superadminAccessToken) {
    return {
      accessToken: superadminAccessToken,
      refreshToken: Cookies.get('superadmin_refresh_token') || 
        localStorage.getItem('superadmin_refresh_token'),
      isSuperAdmin: true
    };
  }
  
  // Check for regular user tokens
  const accessToken = Cookies.get('access_token') || localStorage.getItem('access_token');
  
  return {
    accessToken: accessToken || null,
    refreshToken: Cookies.get('refresh_token') || localStorage.getItem('refresh_token'),
    isSuperAdmin: false
  };
};

const initialTokens = getInitialTokens();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
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
      
      // Update cookies
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
        state.error = null;
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
        state.error = null;
      })
      // Refresh token cases
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

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsSuperAdmin = (state) => state.auth.isSuperAdmin;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;