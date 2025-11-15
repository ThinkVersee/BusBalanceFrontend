import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  logoutUser,
  refreshToken,
  clearError,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsSuperAdmin,
  selectAuthLoading,
  selectAuthError,
  selectAccessToken,
  selectIsInitializing, // NEW
} from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  return {
    user: useSelector(selectCurrentUser),
    isAuthenticated: useSelector(selectIsAuthenticated),
    isSuperAdmin: useSelector(selectIsSuperAdmin),
    isLoading: useSelector(selectAuthLoading),
    isInitializing: useSelector(selectIsInitializing), // NEW
    error: useSelector(selectAuthError),
    accessToken: useSelector(selectAccessToken),

    login: (credentials) => dispatch(loginUser(credentials)),
    logout: (options) => dispatch(logoutUser(options)),
    refresh: (options) => dispatch(refreshToken(options)),
    clearError: () => dispatch(clearError()),
  };
};