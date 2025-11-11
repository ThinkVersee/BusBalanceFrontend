"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Bus, DollarSign ,Loader2} from 'lucide-react';

const LoginForm = () => {
  const [username, setUsername] = useState(''); // Changed from email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user'));

      if (user?.is_superuser) {
        router.push('/admin/');
      } else if (user?.is_owner) {
        router.push('/owner/');
      } else {
        router.push('/employee');
      }
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async () => {
    clearError();

    await login({
      username, // Now using username
      password,
      endpoint: '/login/',
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">BUS BALANCE</h1>
        </div>


          {/* Title */}
          <h2 className="text-2xl font-semibold mb-8 text-gray-900">Login</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {typeof error === 'string' ? error : error.detail || 'Login failed. Please check your credentials.'}
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
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                placeholder="Enter username..."
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                  placeholder="Enter password..."
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;