'use client';

import { Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosInstance from '@/config/axiosInstance';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ Fetch current user details from Django
        const { data } = await axiosInstance.get('/me/');
        setUser({
          id: data.id,
          username: data.username,
          name: data.name || data.username || 'Superuser',
          email: data.email || 'superuser@example.com',
          is_superuser: data.is_superuser,
          is_owner: data.is_owner,
          is_employee: data.is_employee,
        });

        // ✅ Save user role locally for axios interceptor
        localStorage.setItem('user', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to load user:', err);
        setUser({ name: 'Guest', email: 'guest@example.com' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || 'guest@example.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('superadmin_access_token');
    localStorage.removeItem('superadmin_refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-8">
      <h1 className="text-lg md:text-2xl font-semibold text-gray-800 truncate">
        Dashboard Overview
      </h1>

      <div className="flex items-center gap-3 md:gap-6">
        {/* 🔍 Search Bar */}
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

        {/* 🔎 Mobile Search Icon */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Search size={20} className="text-gray-600" />
        </button>

        {/* 👤 User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-semibold text-sm md:text-base">
                {loading ? '••' : initials}
              </span>
            </div>

            <div className="hidden md:block text-left">
              {loading ? (
                <>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-gray-800">{displayName}</div>
                  <div className="text-xs text-gray-500">{displayEmail}</div>
                </>
              )}
            </div>

            <ChevronDown size={18} className="text-gray-400" />
          </button>

          {/* 🔽 Dropdown */}
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
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 text-sm"
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
