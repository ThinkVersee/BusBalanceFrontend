'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export default function Navbar({ isSuperAdmin = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  const dropdownRef = useRef(null);

  /* -------------------------------------------------
   * Load user from localStorage
   * ------------------------------------------------- */
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

  /* -------------------------------------------------
   * Close dropdown on click outside
   * ------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  /* -------------------------------------------------
   * Logout – clear cookies + storage
   * ------------------------------------------------- */
  const clearAuthCookies = (superAdmin) => {
    const prefix = superAdmin ? 'superadmin_' : '';
    const opp = superAdmin ? '' : 'superadmin_';

    Cookies.remove(`${prefix}access_token`);
    Cookies.remove(`${prefix}refresh_token`);
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);

    Cookies.remove(`${opp}access_token`);
    Cookies.remove(`${opp}refresh_token`);
    localStorage.removeItem(`${opp}access_token`);
    localStorage.removeItem(`${opp}refresh_token`);

    localStorage.removeItem('user');
  };

  const handleLogout = () => {
    clearAuthCookies(isSuperAdmin);
    window.location.href = isSuperAdmin ? '/admin/login' : '/login';
  };

  return (
    <>
      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
        
        {/* Left: Logo / Title */}
        <div className="flex items-center flex-1">
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
            Bus Book
          </h1>
        </div>

        {/* Right: User Dropdown */}
        <div className="flex items-center">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-9 h-9 text-sm font-bold text-gray-800 bg-yellow-400 rounded-full">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>

              {/* Name/Email – visible on sm+ */}
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold text-gray-800 truncate max-w-32">
                  {user.username || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-32">
                  {user.email || 'user@example.com'}
                </div>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {/* Mobile User Info */}
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {user.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email || 'user@example.com'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}