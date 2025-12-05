"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Bus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayError, setDisplayError] = useState(null);
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();
  const errorCaptured = useRef(false);

  // Capture and persist error immediately when it appears
  useEffect(() => {
    if (error && !errorCaptured.current) {
      setDisplayError(error);
      errorCaptured.current = true;

      // Allow it to be cleared again after a short delay
      setTimeout(() => {
        errorCaptured.current = false;
      }, 100);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      setDisplayError(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user?.is_superuser) {
        router.push('/admin/');
      } else if (user?.is_owner) {
        router.push('/owner/');
      } else {
        router.push('/employee');
      }
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    setDisplayError(null);
    errorCaptured.current = false;

    if (clearError) clearError();

    try {
      await login({
        username,
        password,
        endpoint: '/login/',
      });
    } catch (err) {
      setDisplayError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (displayError) setDisplayError(null);
  };

  const getErrorMessage = () => {
    if (!displayError) return null;

    if (typeof displayError === 'string') return displayError;
    if (displayError.detail) return displayError.detail;
    if (displayError.message) return displayError.message;
    if (displayError.non_field_errors)
      return Array.isArray(displayError.non_field_errors)
        ? displayError.non_field_errors.join(', ')
        : displayError.non_field_errors;
    if (displayError.error) return displayError.error;

    return 'Login failed. Please check your credentials.';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-12 rounded-3xl shadow-sm">
          {/* Bus-Themed Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-xl shadow-md">
                <div className="bg-white p-2 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center">
                    <Bus className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BUSBOOK</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-8 text-gray-900">Login</h2>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 font-medium">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleInputChange(setUsername)}
                onKeyPress={handleKeyPress}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                placeholder="Enter username..."
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  onKeyPress={handleKeyPress}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                  placeholder="Enter password..."
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 underline transition duration-200"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;