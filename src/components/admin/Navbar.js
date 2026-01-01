'use client';

import { ChevronDown, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import ChangePasswordModal from '../common/ChangePasswordModal';

export default function Navbar({ onMenuToggle }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  const dropdownRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch (e) { console.error('Failed to parse user', e); }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  // Clear all auth tokens (superadmin + regular)
  const clearAuthCookies = () => {
    const prefixes = ['superadmin_', ''];
    prefixes.forEach(p => {
      Cookies.remove(`${p}access_token`);
      Cookies.remove(`${p}refresh_token`);
      localStorage.removeItem(`${p}access_token`);
      localStorage.removeItem(`${p}refresh_token`);
    });
    localStorage.removeItem('user');
  };

  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = '/admin/login';
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center h-16 px-3 bg-white border-b border-gray-200 sm:px-4 md:left-64 md:px-6">
        {/* Hamburger - Mobile Only */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg md:hidden hover:bg-gray-100 mr-2"
          aria-label="Toggle menu"
        >
          <Menu size={22} className="text-gray-700" />
        </button>

        {/* Title */}
        <h1 className="flex-1 text-sm font-semibold text-gray-800 truncate text-center sm:text-black md:text-lg lg:text-xl">
          <span className="hidden sm:inline">Admin Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </h1>

        {/* Right: Avatar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white sm:w-9 sm:h-9 sm:text-sm">
                {user.username ? user.username[0].toUpperCase() : 'A'}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-gray-800 truncate max-w-24">
                  {user.username || 'Admin'}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-24">
                  {user.email || 'admin@example.com'}
                </div>
              </div>

              <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg sm:w-56">
                {/* Mobile User Info */}
                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                  <div className="text-sm font-medium text-gray-800 truncate">{user.username || 'Admin'}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email || 'admin@example.com'}</div>
                </div>

                {/* Change Password */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change Password
                </button>

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Reusing the SAME ChangePasswordModal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}