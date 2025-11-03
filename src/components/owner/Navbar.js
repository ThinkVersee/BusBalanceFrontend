'use client';

import { Search, ChevronDown, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  // ✅ Load user info from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, []);

  return (
    <nav className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Page Title */}
      <h1 className="text-lg md:text-2xl font-semibold text-gray-800 truncate">
        Owner Dashboard Overview
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar - Hidden on mobile, shown on md+ */}
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

        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Search size={20} className="text-gray-600" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors"
          >
            {/* User Initial */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-semibold text-sm md:text-base">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>

            {/* User Info */}
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

          {/* Dropdown */}
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
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/admin/login'; 
                }}
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
