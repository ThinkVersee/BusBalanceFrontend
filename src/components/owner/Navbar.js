// components/Navbar.js
'use client';

import { ChevronDown, Menu, KeyRound } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import ChangePasswordModal from '../common/ChangePasswordModal';

export default function Navbar({ onMenuToggle }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  const dropdownRef = useRef(null);



  
  // Load user from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch (e) { console.error('Failed to parse user', e); }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  // Logout function (only for normal user)
  const handleLogout = () => {
    // Clear normal user tokens
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Just in case superadmin tokens exist (defensive)
    Cookies.remove('superadmin_access_token');
    Cookies.remove('superadmin_refresh_token');
    localStorage.removeItem('superadmin_access_token');
    localStorage.removeItem('superadmin_refresh_token');

    window.location.href = '/login';
  };

  const openChangePassword = () => {
    setIsDropdownOpen(false);
    setIsChangePassModalOpen(true);
  };

  return (
    <>
      {/* ========== NAVBAR (Normal User - Owner) ========== */}
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center h-16 px-4 bg-white border-b border-gray-200 md:left-64 md:px-6">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg md:hidden hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Dashboard Title - Centered */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">
            <span className="hidden sm:inline">Owner Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </h1>
        </div>

        {/* User Avatar + Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-center w-9 h-9 text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-600 rounded-full shadow-md">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                {user.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-32">
                {user.email || 'user@example.com'}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
              {/* Mobile User Info */}
              <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                <p className="font-medium text-gray-800">{user.username || 'User'}</p>
                <p className="text-sm text-gray-500">{user.email || 'user@example.com'}</p>
              </div>

              {/* Change Password */}
              <button
                onClick={openChangePassword}
                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <KeyRound size={18} />
                Change Password
              </button>

              <div className="border-t border-gray-200" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        isSuperAdmin={false}  // Explicitly false for normal user
      />
    </>
  );
}