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
  selectAccessToken 
} from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();

  return {
    // Selectors
    user: useSelector(selectCurrentUser),
    isAuthenticated: useSelector(selectIsAuthenticated),
    isSuperAdmin: useSelector(selectIsSuperAdmin),
    isLoading: useSelector(selectAuthLoading),
    error: useSelector(selectAuthError),
    accessToken: useSelector(selectAccessToken),
    
    // Actions
    login: (credentials) => dispatch(loginUser(credentials)),
    logout: (options) => dispatch(logoutUser(options)),
    refresh: (options) => dispatch(refreshToken(options)),
    clearError: () => dispatch(clearError()),
  };
};