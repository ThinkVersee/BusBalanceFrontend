'use client';
import { Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // ✅ Load user info and detect role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Detect if user is superadmin
          if (parsedUser.is_superuser || parsedUser.role === 'superadmin') {
            setIsSuperAdmin(true);
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, []);

  // ✅ Clear tokens and cookies
  const clearAuthCookies = (isSuperAdmin) => {
    const prefix = isSuperAdmin ? 'superadmin_' : '';
    Cookies.remove(`${prefix}access_token`);
    Cookies.remove(`${prefix}refresh_token`);
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);
    localStorage.removeItem('user');

    // Extra cleanup (cross-type)
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('superadmin_access_token');
    Cookies.remove('superadmin_refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('superadmin_access_token');
    localStorage.removeItem('superadmin_refresh_token');

    console.log(`🧹 Cleared ${isSuperAdmin ? 'superadmin' : 'user'} tokens`);
  };

  // ✅ Logout handler
  const handleLogout = () => {
    clearAuthCookies(isSuperAdmin);

    // Redirect based on role
    if (isSuperAdmin) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-8">
      <h1 className="text-lg md:text-2xl font-semibold text-gray-800 truncate">
        {isSuperAdmin ? 'Admin Dashboard' : 'Owner Dashboard Overview'}
      </h1>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar */}
        <div className="hidden md:block relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mobile Search */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Search size={20} className="text-gray-600" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-semibold text-sm md:text-base">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-800">
                {user.username || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {user.email || 'user@example.com'}
              </div>
            </div>
            <ChevronDown size={18} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                Settings
              </button>
              <hr className="my-2" />
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 text-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
