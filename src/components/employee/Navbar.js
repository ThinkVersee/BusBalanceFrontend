'use client';

import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import ChangePasswordModal from '../common/ChangePasswordModal';

// Import your existing modal

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  const dropdownRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  // Logout - Clear employee auth data
  const handleLogout = () => {
    // Clear main employee tokens
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Extra safety: clear any superadmin tokens if exist
    Cookies.remove('superadmin_access_token');
    Cookies.remove('superadmin_refresh_token');
    localStorage.removeItem('superadmin_access_token');
    localStorage.removeItem('superadmin_refresh_token');

    window.location.href = '/employee/login'; // Or '/login' if shared
  };

  const openChangePassword = () => {
    setIsDropdownOpen(false);
    setIsChangePassOpen(true);
  };

  return (
    <>
      {/* ========== EMPLOYEE NAVBAR ========== */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center h-16 px-4 bg-white border-b border-gray-200 shadow-sm sm:px-6">
        
        {/* Left: Brand */}
        <div className="flex items-center flex-1">
          <h1 className="text-xl font-bold text-blue-600 sm:text-2xl">
            Bus Book
          </h1>
          <span className="hidden ml-3 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full sm:inline-block">
            Employee
          </span>
        </div>

        {/* Right: User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            {/* Avatar */}
            <div className="flex items-center justify-center w-10 h-10 text-white font-bold text-sm bg-gradient-to-br from-blue-600 to-blue-600 rounded-full shadow-md">
              {user.username ? user.username[0].toUpperCase() : 'E'}
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-40">
                {user.username || 'Employee'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-40">
                {user.email || 'employee@busbook.in'}
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 z-50 w-64 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              
              {/* Mobile User Info */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-50 border-b border-gray-200 sm:hidden">
                <p className="font-semibold text-gray-800">{user.username || 'Employee'}</p>
                <p className="text-sm text-gray-600">{user.email || 'employee@busbook.in'}</p>
              </div>

              {/* Change Password */}
              <button
                onClick={openChangePassword}
                className="w-full px-5 py-3.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <KeyRound size={18} className="text-blue-600" />
                Change Password
              </button>

              <div className="h-px bg-gray-200" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-5 py-3.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
        isSuperAdmin={false}  // Employee is not superadmin
      />
    </>
  );
}